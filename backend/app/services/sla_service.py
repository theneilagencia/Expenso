import logging
from datetime import datetime, timedelta, timezone
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.expense_request import ExpenseRequest
from app.models.sla_config import SLAConfig
from app.models.notification import Notification

logger = logging.getLogger(__name__)


class SLAService:
    @staticmethod
    def apply_sla(request_id: UUID, db: Session) -> None:
        expense = db.query(ExpenseRequest).filter(ExpenseRequest.id == request_id).first()
        if not expense:
            return

        sla = (
            db.query(SLAConfig)
            .filter(SLAConfig.status_type == expense.status, SLAConfig.is_active == True)
            .first()
        )
        if not sla:
            return

        now = datetime.now(timezone.utc)
        expense.sla_deadline = now + timedelta(hours=sla.deadline_hours)
        db.commit()

    @staticmethod
    def check_sla_violations(db: Session) -> list[dict]:
        now = datetime.now(timezone.utc)
        violations = []

        active_slas = db.query(SLAConfig).filter(SLAConfig.is_active == True).all()
        status_types = [s.status_type for s in active_slas]

        overdue_requests = (
            db.query(ExpenseRequest)
            .filter(
                ExpenseRequest.status.in_(status_types),
                ExpenseRequest.sla_deadline.isnot(None),
                ExpenseRequest.sla_deadline < now,
                ExpenseRequest.deleted_at.is_(None),
            )
            .all()
        )

        for req in overdue_requests:
            violations.append({
                "request_id": str(req.id),
                "title": req.title,
                "status": req.status,
                "deadline": str(req.sla_deadline),
                "overdue_hours": round((now - req.sla_deadline).total_seconds() / 3600, 1),
            })

        return violations

    @staticmethod
    def check_warnings(db: Session) -> list[dict]:
        now = datetime.now(timezone.utc)
        warnings = []

        active_slas = db.query(SLAConfig).filter(SLAConfig.is_active == True).all()
        sla_map = {s.status_type: s for s in active_slas}

        for status_type, sla in sla_map.items():
            warning_threshold = now + timedelta(hours=sla.warning_hours)
            at_risk = (
                db.query(ExpenseRequest)
                .filter(
                    ExpenseRequest.status == status_type,
                    ExpenseRequest.sla_deadline.isnot(None),
                    ExpenseRequest.sla_deadline > now,
                    ExpenseRequest.sla_deadline <= warning_threshold,
                    ExpenseRequest.deleted_at.is_(None),
                )
                .all()
            )
            for req in at_risk:
                warnings.append({
                    "request_id": str(req.id),
                    "title": req.title,
                    "status": req.status,
                    "deadline": str(req.sla_deadline),
                    "hours_remaining": round((req.sla_deadline - now).total_seconds() / 3600, 1),
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
                    Notification.entity_type == "expense_request",
                    Notification.entity_id == v["request_id"],
                    Notification.type == "SLA_OVERDUE",
                )
                .first()
            )
            if not existing:
                req = db.query(ExpenseRequest).filter(ExpenseRequest.id == v["request_id"]).first()
                if req:
                    notification = Notification(
                        user_id=req.user_id,
                        type="SLA_OVERDUE",
                        title=f"SLA Overdue: {req.title}",
                        message=f"Request is overdue by {v['overdue_hours']} hours",
                        entity_type="expense_request",
                        entity_id=str(req.id),
                    )
                    db.add(notification)
                    count += 1

        for w in warnings:
            existing = (
                db.query(Notification)
                .filter(
                    Notification.entity_type == "expense_request",
                    Notification.entity_id == w["request_id"],
                    Notification.type == "SLA_WARNING",
                )
                .first()
            )
            if not existing:
                req = db.query(ExpenseRequest).filter(ExpenseRequest.id == w["request_id"]).first()
                if req:
                    notification = Notification(
                        user_id=req.user_id,
                        type="SLA_WARNING",
                        title=f"SLA Warning: {req.title}",
                        message=f"Request due in {w['hours_remaining']} hours",
                        entity_type="expense_request",
                        entity_id=str(req.id),
                    )
                    db.add(notification)
                    count += 1

        db.commit()
        return count
