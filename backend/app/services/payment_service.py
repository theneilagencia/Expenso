import logging
import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.config import settings
from app.core.exceptions import NotFoundError, ValidationError
from app.integrations.payments import get_gateway
from app.models.expense_request import ExpenseRequest
from app.models.payment import Payment
from app.models.user import User

logger = logging.getLogger(__name__)

MAX_RETRIES = getattr(settings, "PAYMENT_MAX_RETRIES", 3)
RETRY_DELAY_MINUTES = getattr(settings, "PAYMENT_RETRY_DELAY_MINUTES", 15)


class PaymentService:
    def __init__(self, db: Session):
        self.db = db

    def initiate_payment(
        self,
        request_id: uuid.UUID,
        processed_by: uuid.UUID,
        method: str,
        notes: str = None,
    ) -> Payment:
        """Create a PROCESSING payment record and dispatch async task."""
        req = self.db.query(ExpenseRequest).filter(
            ExpenseRequest.id == request_id,
            ExpenseRequest.deleted_at.is_(None),
        ).first()
        if not req:
            raise NotFoundError("Expense request")
        if req.status != "IN_PAYMENT":
            raise ValidationError("Request must be in IN_PAYMENT status to process payment")

        existing = self.db.query(Payment).filter(Payment.request_id == req.id).first()
        if existing:
            raise ValidationError("Payment already exists for this request")

        payment = Payment(
            id=uuid.uuid4(),
            request_id=req.id,
            processed_by=processed_by,
            method=method,
            amount_paid=req.amount,
            currency_paid=req.currency or "BRL",
            notes=notes,
            revolut_status="PROCESSING",
        )
        self.db.add(payment)
        self.db.commit()
        self.db.refresh(payment)

        # Dispatch async processing
        try:
            from app.workers.tasks.payment_tasks import process_payment
            process_payment.delay(str(payment.id))
        except Exception as e:
            logger.warning(f"Failed to dispatch payment task: {e}")

        return payment

    def process_via_gateway(self, payment_id: uuid.UUID) -> Payment:
        """Execute payment through configured gateway."""
        payment = self.db.query(Payment).filter(Payment.id == payment_id).first()
        if not payment:
            raise NotFoundError("Payment")

        req = self.db.query(ExpenseRequest).filter(ExpenseRequest.id == payment.request_id).first()
        if not req:
            raise NotFoundError("Expense request")

        employee = self.db.query(User).filter(User.id == req.employee_id).first()

        gateway_name = getattr(settings, "PAYMENT_GATEWAY", "mock")
        gateway = get_gateway(gateway_name)

        recipient = {
            "name": employee.full_name if employee else "Unknown",
            "email": employee.email if employee else "",
        }

        try:
            result = gateway.send_payment(
                amount=float(payment.amount_paid),
                currency=payment.currency_paid or "BRL",
                recipient=recipient,
            )

            payment.revolut_payment_id = result.get("provider_id")
            payment.revolut_status = result.get("status", "completed")
            payment.revolut_raw_response = result.get("raw_response")
            payment.payment_date = datetime.now(timezone.utc)

            # Transition request to PAID
            from app.services.request_service import RequestService
            service = RequestService(self.db)
            service.perform_action(
                request_id=req.id,
                action="confirm_payment",
                actor_id=payment.processed_by,
                actor_role="SYSTEM",
            )

            logger.info(f"Payment {payment.id} processed successfully via {gateway_name}")
            return payment

        except Exception as e:
            logger.error(f"Payment {payment.id} failed via {gateway_name}: {e}")
            payment.retry_count = (payment.retry_count or 0) + 1
            payment.last_error = str(e)
            payment.revolut_status = "FAILED"
            if payment.retry_count < MAX_RETRIES:
                payment.next_retry_at = datetime.now(timezone.utc) + timedelta(minutes=RETRY_DELAY_MINUTES)
            self.db.commit()
            raise

    def retry_failed(self) -> int:
        """Retry payments that are eligible for retry."""
        now = datetime.now(timezone.utc)
        eligible = (
            self.db.query(Payment)
            .filter(
                Payment.revolut_status == "FAILED",
                Payment.retry_count < MAX_RETRIES,
                Payment.next_retry_at <= now,
            )
            .all()
        )

        count = 0
        for payment in eligible:
            try:
                from app.workers.tasks.payment_tasks import process_payment
                process_payment.delay(str(payment.id))
                count += 1
            except Exception as e:
                logger.warning(f"Failed to dispatch retry for payment {payment.id}: {e}")

        return count
