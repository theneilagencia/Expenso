import logging

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
