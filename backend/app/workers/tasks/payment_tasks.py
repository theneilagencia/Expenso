import logging
from datetime import datetime, timedelta, timezone

from app.db.session import SessionLocal
from app.workers.celery_app import celery_app

logger = logging.getLogger(__name__)


@celery_app.task(name="app.workers.tasks.payment_tasks.process_payment")
def process_payment(payment_id: str):
    """Process a single payment through the configured gateway."""
    from app.services.payment_service import PaymentService

    db = SessionLocal()
    try:
        service = PaymentService(db)
        service.process_via_gateway(payment_id)
        logger.info(f"Payment {payment_id} processed successfully")
    except Exception as e:
        logger.error(f"Payment task failed for {payment_id}: {e}")
        raise
    finally:
        db.close()


@celery_app.task(name="app.workers.tasks.payment_tasks.retry_failed_payments")
def retry_failed_payments():
    """Retry failed payments that are eligible for retry."""
    from app.services.payment_service import PaymentService

    db = SessionLocal()
    try:
        service = PaymentService(db)
        count = service.retry_failed()
        logger.info(f"Retried {count} failed payments")
        return count
    except Exception as e:
        logger.error(f"Payment retry task failed: {e}")
        raise
    finally:
        db.close()


@celery_app.task(name="app.workers.tasks.payment_tasks.poll_payment_status")
def poll_payment_status():
    """Poll Revolut for status of PROCESSING payments older than 5 minutes.

    Acts as a fallback for webhook delivery failures.
    """
    from app.config import settings
    from app.integrations.payments import get_gateway
    from app.models.payment import Payment

    db = SessionLocal()
    try:
        cutoff = datetime.now(timezone.utc) - timedelta(minutes=5)
        pending = (
            db.query(Payment)
            .filter(
                Payment.revolut_status == "PROCESSING",
                Payment.created_at <= cutoff,
            )
            .all()
        )

        if not pending:
            return {"polled": 0, "updated": 0}

        gateway_name = getattr(settings, "PAYMENT_GATEWAY", "mock")
        gateway = get_gateway(gateway_name)

        updated = 0
        for payment in pending:
            provider_id = payment.revolut_payment_id
            if not provider_id:
                continue

            try:
                result = gateway.check_status(provider_id)
                new_status = result.get("status", "PROCESSING")

                if new_status == "completed":
                    payment.revolut_status = "completed"
                    payment.revolut_raw_response = result.get("raw_response")
                    payment.payment_date = datetime.now(timezone.utc)

                    from app.services.request_service import RequestService
                    service = RequestService(db)
                    service.perform_action(
                        request_id=payment.request_id,
                        action="confirm_payment",
                        actor_id=payment.processed_by,
                        actor_role="SYSTEM",
                    )
                    updated += 1

                elif new_status == "FAILED":
                    payment.revolut_status = "FAILED"
                    payment.revolut_raw_response = result.get("raw_response")
                    payment.last_error = "Payment failed (detected by status poll)"
                    payment.retry_count = (payment.retry_count or 0) + 1
                    max_retries = getattr(settings, "PAYMENT_MAX_RETRIES", 3)
                    delay_min = getattr(settings, "PAYMENT_RETRY_DELAY_MINUTES", 15)
                    if payment.retry_count < max_retries:
                        payment.next_retry_at = datetime.now(timezone.utc) + timedelta(minutes=delay_min)
                    updated += 1

            except Exception as e:
                logger.warning(f"Status poll failed for payment {payment.id}: {e}")

        db.commit()
        logger.info(f"Payment status poll: polled={len(pending)}, updated={updated}")
        return {"polled": len(pending), "updated": updated}

    except Exception as e:
        logger.error(f"Payment status poll task failed: {e}")
        raise
    finally:
        db.close()
