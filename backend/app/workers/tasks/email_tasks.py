import logging
import os

from jinja2 import Environment, FileSystemLoader

from app.config import settings
from app.db.session import SessionLocal
from app.services.email_service import send_email
from app.workers.celery_app import celery_app

logger = logging.getLogger(__name__)

# Map notification types to template file names
_EVENT_TO_TEMPLATE = {
    "NEW_PENDING_APPROVAL": "new_pending_approval",
    "REQUEST_APPROVED": "approved",
    "REQUEST_REJECTED": "rejected",
    "CORRECTION_REQUESTED": "correction",
    "PAYMENT_CONFIRMED": "payment",
}

# Map notification types to email subjects
_EVENT_SUBJECTS = {
    "en-US": {
        "NEW_PENDING_APPROVAL": "New expense request pending your approval",
        "REQUEST_APPROVED": "Your expense request has been approved",
        "REQUEST_REJECTED": "Your expense request has been rejected",
        "CORRECTION_REQUESTED": "Correction requested for your expense",
        "PAYMENT_CONFIRMED": "Payment confirmed for your expense",
    },
    "pt-BR": {
        "NEW_PENDING_APPROVAL": "Nova solicitação de reembolso aguardando aprovação",
        "REQUEST_APPROVED": "Sua solicitação de reembolso foi aprovada",
        "REQUEST_REJECTED": "Sua solicitação de reembolso foi rejeitada",
        "CORRECTION_REQUESTED": "Correção solicitada para sua solicitação",
        "PAYMENT_CONFIRMED": "Pagamento confirmado para sua solicitação",
    },
}

_LABELS = {
    "en-US": {
        "label_title": "Title",
        "label_amount": "Amount",
        "label_view": "View Request",
        "footer_text": "This is an automated email from Expenso. Do not reply.",
    },
    "pt-BR": {
        "label_title": "Título",
        "label_amount": "Valor",
        "label_view": "Ver Solicitação",
        "footer_text": "Este é um e-mail automático do Expenso. Não responda.",
    },
}

_templates_dir = os.path.join(os.path.dirname(__file__), "..", "..", "templates")
_jinja_env = Environment(loader=FileSystemLoader(_templates_dir), autoescape=True)


@celery_app.task(name="app.workers.tasks.email_tasks.send_notification_email")
def send_notification_email(user_id: str, request_id: str, event_type: str):
    """Send an email notification for a request event."""
    from app.models.expense_request import ExpenseRequest
    from app.models.user import User

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            logger.warning(f"User {user_id} not found for email notification")
            return

        request = db.query(ExpenseRequest).filter(ExpenseRequest.id == request_id).first()
        if not request:
            logger.warning(f"Request {request_id} not found for email notification")
            return

        locale = user.locale or "en-US"
        if locale not in ("en-US", "pt-BR"):
            locale = "en-US"

        template_name = _EVENT_TO_TEMPLATE.get(event_type)
        if not template_name:
            logger.warning(f"Unknown event type: {event_type}")
            return

        template_path = f"email/{locale}/{template_name}.html"
        template = _jinja_env.get_template(template_path)

        # Get requester name for manager notifications
        requester = db.query(User).filter(User.id == request.employee_id).first()
        requester_name = requester.full_name if requester else "Unknown"

        labels = _LABELS.get(locale, _LABELS["en-US"])
        html = template.render(
            user_name=user.full_name,
            requester_name=requester_name,
            request_title=request.title,
            amount=f"{request.amount:.2f}",
            currency=request.currency or "BRL",
            status=request.status,
            action_url=f"{settings.FRONTEND_URL}/requests/{request_id}",
            **labels,
        )

        subjects = _EVENT_SUBJECTS.get(locale, _EVENT_SUBJECTS["en-US"])
        subject = subjects.get(event_type, "Expenso Notification")

        send_email(user.email, subject, html)
    except Exception as e:
        logger.error(f"Email notification task failed: {e}")
    finally:
        db.close()
