"""LGPD data export — builds ZIP with all user data."""

import io
import json
import logging
import zipfile

from sqlalchemy.orm import Session

from app.models.audit_log import AuditLog
from app.models.expense_request import ExpenseRequest
from app.models.notification import Notification
from app.models.payment import Payment
from app.models.user import User

logger = logging.getLogger(__name__)


def build_user_data_zip(user_id: str, db: Session) -> bytes:
    """Build a ZIP archive with all personal data for LGPD export."""
    buf = io.BytesIO()

    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        # 1. User profile
        user = db.query(User).filter(User.id == user_id).first()
        if user:
            profile = {
                "id": str(user.id),
                "full_name": user.full_name,
                "email": user.email,
                "role": user.role,
                "locale": user.locale,
                "status": user.status,
                "created_at": str(user.created_at) if user.created_at else None,
                "last_login_at": str(user.last_login_at) if user.last_login_at else None,
            }
            zf.writestr("profile.json", json.dumps(profile, indent=2, default=str))

        # 2. Expense requests
        requests = db.query(ExpenseRequest).filter(
            ExpenseRequest.employee_id == user_id
        ).all()
        req_data = []
        for r in requests:
            req_data.append({
                "id": str(r.id),
                "title": r.title,
                "description": r.description,
                "amount": float(r.amount) if r.amount else None,
                "currency": r.currency,
                "status": r.status,
                "created_at": str(r.created_at) if r.created_at else None,
            })
        zf.writestr("expense_requests.json", json.dumps(req_data, indent=2, default=str))

        # 3. Audit logs (where actor)
        logs = db.query(AuditLog).filter(AuditLog.actor_id == user_id).all()
        log_data = []
        for log in logs:
            log_data.append({
                "id": str(log.id),
                "action": log.action,
                "actor_role": log.actor_role,
                "previous_status": log.previous_status,
                "new_status": log.new_status,
                "created_at": str(log.created_at) if log.created_at else None,
            })
        zf.writestr("audit_logs.json", json.dumps(log_data, indent=2, default=str))

        # 4. Payments (for user's requests)
        request_ids = [str(r.id) for r in requests]
        if request_ids:
            payments = db.query(Payment).filter(
                Payment.request_id.in_(request_ids)
            ).all()
            pay_data = []
            for p in payments:
                pay_data.append({
                    "id": str(p.id),
                    "request_id": str(p.request_id),
                    "method": p.method,
                    "amount_paid": float(p.amount_paid) if p.amount_paid else None,
                    "currency_paid": p.currency_paid,
                    "status": p.revolut_status,
                    "payment_date": str(p.payment_date) if p.payment_date else None,
                })
            zf.writestr("payments.json", json.dumps(pay_data, indent=2, default=str))

        # 5. Notifications
        notifs = db.query(Notification).filter(
            Notification.user_id == user_id
        ).all()
        notif_data = []
        for n in notifs:
            notif_data.append({
                "id": str(n.id),
                "type": n.type,
                "title": n.title,
                "body": n.body,
                "is_read": n.is_read,
                "created_at": str(n.created_at) if n.created_at else None,
            })
        zf.writestr("notifications.json", json.dumps(notif_data, indent=2, default=str))

    buf.seek(0)
    return buf.getvalue()
