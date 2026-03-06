import logging
from datetime import datetime, timedelta, timezone
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.corporate_calendar import CorporateCalendar
from app.models.department import Department
from app.models.expense_request import ExpenseRequest
from app.models.notification import Notification
from app.models.sla_config import SLAConfig
from app.models.user import User

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


def _sla_total_minutes(sla: SLAConfig) -> int:
    """Convert SLA value+unit to total minutes."""
    if sla.unit == "hours":
        return sla.value * 60
    elif sla.unit == "days":
        return sla.value * 60 * 24
    elif sla.unit == "minutes":
        return sla.value
    return sla.value * 60


def _get_deadline_for_stage(req: ExpenseRequest, stage: str) -> datetime | None:
    col = _STAGE_TO_COLUMN.get(stage)
    if col:
        return getattr(req, col, None)
    return None


def calculate_business_deadline(
    start: datetime, sla: SLAConfig, db: Session
) -> datetime:
    """Calculate a business-hours-aware deadline.

    Advances minute by minute, skipping:
    - Hours outside business_start_hour..business_end_hour
    - Saturdays and Sundays
    - Corporate calendar holidays
    """
    try:
        import zoneinfo
        tz = zoneinfo.ZoneInfo(sla.timezone or "America/Sao_Paulo")
    except Exception:
        import zoneinfo
        tz = zoneinfo.ZoneInfo("America/Sao_Paulo")

    business_start = sla.business_start_hour if sla.business_start_hour is not None else 9
    business_end = sla.business_end_hour if sla.business_end_hour is not None else 18

    # Convert start to SLA timezone
    if start.tzinfo is None:
        start = start.replace(tzinfo=timezone.utc)
    local_dt = start.astimezone(tz)

    total_minutes = _sla_total_minutes(sla)

    # Pre-load holidays for the year to avoid repeated queries
    year = local_dt.year
    holiday_cache: dict[int, set] = {}

    def _load_holidays(yr: int) -> set:
        if yr in holiday_cache:
            return holiday_cache[yr]
        holidays = (
            db.query(CorporateCalendar.date)
            .filter(
                CorporateCalendar.date >= datetime(yr, 1, 1).date(),
                CorporateCalendar.date <= datetime(yr, 12, 31).date(),
            )
            .all()
        )
        holiday_set = {h.date for h in holidays}
        holiday_cache[yr] = holiday_set
        return holiday_set

    _load_holidays(year)
    minutes_counted = 0

    while minutes_counted < total_minutes:
        # Ensure we have holidays for the current year
        if local_dt.year not in holiday_cache:
            _load_holidays(local_dt.year)

        current_date = local_dt.date()
        weekday = local_dt.weekday()

        # Skip weekends
        if weekday >= 5:
            local_dt += timedelta(minutes=1)
            continue

        # Skip holidays
        if current_date in holiday_cache.get(local_dt.year, set()):
            local_dt += timedelta(minutes=1)
            continue

        # Skip outside business hours
        if local_dt.hour < business_start or local_dt.hour >= business_end:
            local_dt += timedelta(minutes=1)
            continue

        minutes_counted += 1
        local_dt += timedelta(minutes=1)

    # Convert back to UTC
    return local_dt.astimezone(timezone.utc)


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
        if sla.business_start_hour is not None:
            deadline = calculate_business_deadline(now, sla, db)
        else:
            deadline = now + _sla_to_timedelta(sla)
        setattr(expense, col, deadline)
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
                if sla.business_start_hour is not None:
                    deadline = calculate_business_deadline(now, sla, db)
                else:
                    deadline = now + _sla_to_timedelta(sla)
                setattr(expense, col, deadline)

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
    def _handle_escalation(req: ExpenseRequest, sla: SLAConfig, db: Session) -> int:
        """Handle SLA escalation actions. Returns count of notifications created."""
        count = 0
        escalation = sla.escalation_action
        if not escalation:
            return count

        now = datetime.now(timezone.utc)

        if escalation == "ASSIGN_SUBSTITUTE":
            # Find the employee's manager
            employee = db.query(User).filter(User.id == req.employee_id).first()
            if employee and employee.manager_id:
                manager = db.query(User).filter(User.id == employee.manager_id).first()
                if manager and manager.substitute_id and manager.substitute_until:
                    sub_until = _ensure_aware(manager.substitute_until)
                    if sub_until and sub_until > now:
                        notification = Notification(
                            user_id=manager.substitute_id,
                            request_id=req.id,
                            type="SLA_ESCALATION",
                            title=f"SLA Escalation (Substitute): {req.title}",
                            body="Assigned as substitute approver for overdue request",
                        )
                        db.add(notification)
                        count += 1

        elif escalation == "ESCALATE_DEPARTMENT":
            # Find department head
            employee = db.query(User).filter(User.id == req.employee_id).first()
            if employee and employee.department_id:
                dept = db.query(Department).filter(Department.id == employee.department_id).first()
                if dept and dept.head_user_id:
                    notification = Notification(
                        user_id=dept.head_user_id,
                        request_id=req.id,
                        type="SLA_ESCALATION",
                        title=f"SLA Escalation (Department Head): {req.title}",
                        body="Request escalated to department head due to SLA violation",
                    )
                    db.add(notification)
                    count += 1

        elif escalation == "AUTO_APPROVE":
            # Auto-transition to next state
            from app.core.state_machine import transition
            try:
                new_status = transition(req.status, "approve")
                req.status = new_status
                logger.info(f"Auto-approved request {req.id} due to SLA escalation")
            except Exception:
                logger.warning(f"Auto-approve transition failed for request {req.id}")

        return count

    @staticmethod
    def create_sla_notifications(db: Session) -> int:
        violations = SLAService.check_sla_violations(db)
        warnings = SLAService.check_warnings(db)
        count = 0

        # Build a map of SLA configs for escalation lookup
        active_slas = db.query(SLAConfig).filter(SLAConfig.is_active.is_(True)).all()
        sla_by_stage = {s.stage: s for s in active_slas}

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

                    # Handle escalation
                    sla = sla_by_stage.get(req.status)
                    if sla:
                        count += SLAService._handle_escalation(req, sla, db)

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
