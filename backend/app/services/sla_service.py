import logging
from datetime import datetime, timedelta, timezone
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.expense_request import ExpenseRequest
from app.models.notification import Notification
from app.models.sla_config import SLAConfig

logger = logging.getLogger(__name__)

# Map SLA stage to the corresponding deadline column on ExpenseRequest
_STAGE_TO_COLUMN = {
    "PENDING_MANAGER": "manager_sla_due_at",
    "PENDING_FINANCE": "finance_sla_due_at",
    "IN_CORRECTION": "correction_sla_due_at",
}

# Stages that have SLA tracking
_SLA_STAGES = list(_STAGE_TO_COLUMN.keys())


def _ensure_aware(dt: datetime | None) -> datetime | None:
    """Ensure a datetime is timezone-aware (SQLite returns naive datetimes)."""
    if dt is not None and dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt


def _sla_to_timedelta(sla: SLAConfig) -> timedelta:
    if sla.unit == "hours":
        return timedelta(hours=sla.value)
    elif sla.unit == "days":
        return timedelta(days=sla.value)
    elif sla.unit == "minutes":
        return timedelta(minutes=sla.value)
    return timedelta(hours=sla.value)


def _get_deadline_for_stage(req: ExpenseRequest, stage: str) -> datetime | None:
    col = _STAGE_TO_COLUMN.get(stage)
    if col:
        return getattr(req, col, None)
    return None


class SLAService:
    @staticmethod
    def apply_sla(request_id: UUID, db: Session) -> None:
        expense = db.query(ExpenseRequest).filter(ExpenseRequest.id == request_id).first()
        if not expense:
            return

        sla = (
            db.query(SLAConfig)
            .filter(SLAConfig.stage == expense.status, SLAConfig.is_active.is_(True))
            .first()
        )
        if not sla:
            return

        col = _STAGE_TO_COLUMN.get(expense.status)
        if not col:
            return

        now = datetime.now(timezone.utc)
        setattr(expense, col, now + _sla_to_timedelta(sla))
        db.commit()

    @staticmethod
    def calculate_all_deadlines(db: Session) -> dict[str, SLAConfig]:
        """Fetch active SLA configs for all stages. Returns {stage: SLAConfig}."""
        configs = (
            db.query(SLAConfig)
            .filter(SLAConfig.stage.in_(_SLA_STAGES), SLAConfig.is_active.is_(True))
            .all()
        )
        return {c.stage: c for c in configs}

    @staticmethod
    def set_deadlines_on_submit(expense: ExpenseRequest, db: Session) -> None:
        """Set all SLA deadline fields on an expense at submission time."""
        now = datetime.now(timezone.utc)
        sla_map = SLAService.calculate_all_deadlines(db)
        for stage, col in _STAGE_TO_COLUMN.items():
            sla = sla_map.get(stage)
            if sla:
                setattr(expense, col, now + _sla_to_timedelta(sla))

    @staticmethod
    def check_sla_violations(db: Session) -> list[dict]:
        now = datetime.now(timezone.utc)
        violations = []

        active_slas = db.query(SLAConfig).filter(SLAConfig.is_active.is_(True)).all()
        stage_set = {s.stage for s in active_slas}

        for stage in stage_set:
            col = _STAGE_TO_COLUMN.get(stage)
            if not col:
                continue
            deadline_col = getattr(ExpenseRequest, col)
            overdue = (
                db.query(ExpenseRequest)
                .filter(
                    ExpenseRequest.status == stage,
                    deadline_col.isnot(None),
                    deadline_col < now,
                    ExpenseRequest.deleted_at.is_(None),
                )
                .all()
            )
            for req in overdue:
                deadline = _ensure_aware(getattr(req, col))
                violations.append({
                    "request_id": str(req.id),
                    "title": req.title,
                    "status": req.status,
                    "deadline": str(deadline),
                    "overdue_hours": round((now - deadline).total_seconds() / 3600, 1),
                })

        return violations

    @staticmethod
    def check_warnings(db: Session) -> list[dict]:
        now = datetime.now(timezone.utc)
        warnings = []

        active_slas = db.query(SLAConfig).filter(SLAConfig.is_active.is_(True)).all()
        sla_map = {s.stage: s for s in active_slas}

        for stage, sla in sla_map.items():
            col = _STAGE_TO_COLUMN.get(stage)
            if not col:
                continue
            deadline_col = getattr(ExpenseRequest, col)

            # Calculate warning threshold from reminder_1_pct
            total_duration = _sla_to_timedelta(sla)
            pct = sla.reminder_1_pct or 75
            warning_delta = total_duration * (pct / 100.0)
            at_risk = (
                db.query(ExpenseRequest)
                .filter(
                    ExpenseRequest.status == stage,
                    deadline_col.isnot(None),
                    deadline_col > now,
                    deadline_col <= now + (total_duration - warning_delta),
                    ExpenseRequest.deleted_at.is_(None),
                )
                .all()
            )
            for req in at_risk:
                deadline = _ensure_aware(getattr(req, col))
                warnings.append({
                    "request_id": str(req.id),
                    "title": req.title,
                    "status": req.status,
                    "deadline": str(deadline),
                    "hours_remaining": round((deadline - now).total_seconds() / 3600, 1),
                })

        return warnings

    @staticmethod
    def create_sla_notifications(db: Session) -> int:
        violations = SLAService.check_sla_violations(db)
        warnings = SLAService.check_warnings(db)
        count = 0

        for v in violations:
            existing = (
                db.query(Notification)
                .filter(
                    Notification.request_id == v["request_id"],
                    Notification.type == "SLA_OVERDUE",
                )
                .first()
            )
            if not existing:
                req = db.query(ExpenseRequest).filter(ExpenseRequest.id == v["request_id"]).first()
                if req:
                    notification = Notification(
                        user_id=req.employee_id,
                        request_id=req.id,
                        type="SLA_OVERDUE",
                        title=f"SLA Overdue: {req.title}",
                        body=f"Request is overdue by {v['overdue_hours']} hours",
                    )
                    db.add(notification)
                    count += 1

        for w in warnings:
            existing = (
                db.query(Notification)
                .filter(
                    Notification.request_id == w["request_id"],
                    Notification.type == "SLA_WARNING",
                )
                .first()
            )
            if not existing:
                req = db.query(ExpenseRequest).filter(ExpenseRequest.id == w["request_id"]).first()
                if req:
                    notification = Notification(
                        user_id=req.employee_id,
                        request_id=req.id,
                        type="SLA_WARNING",
                        title=f"SLA Warning: {req.title}",
                        body=f"Request due in {w['hours_remaining']} hours",
                    )
                    db.add(notification)
                    count += 1

        db.commit()
        return count
