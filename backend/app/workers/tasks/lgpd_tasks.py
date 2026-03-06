"""LGPD Celery tasks — data export, retention cleanup."""

import logging
from datetime import datetime, timedelta, timezone

from app.workers.celery_app import celery_app

logger = logging.getLogger(__name__)


@celery_app.task(name="app.workers.tasks.lgpd_tasks.generate_data_export")
def generate_data_export(user_id: str):
    """Generate LGPD data export ZIP and store in MinIO."""
    from app.db.session import SessionLocal
    from app.services.data_export_service import build_user_data_zip

    db = SessionLocal()
    try:
        zip_bytes = build_user_data_zip(user_id, db)

        # Upload to MinIO
        try:
            import io

            from app.api.v1.routers.attachments import ensure_bucket, get_minio_client
            from app.config import settings

            client = get_minio_client()
            bucket = getattr(settings, "MINIO_BUCKET", "expenso")
            ensure_bucket(client, bucket)

            file_key = f"exports/{user_id}/data_export.zip"
            client.put_object(
                bucket, file_key, io.BytesIO(zip_bytes),
                length=len(zip_bytes),
                content_type="application/zip",
            )
            logger.info(f"Data export for user {user_id} uploaded to {file_key}")
        except Exception as e:
            logger.warning(f"Failed to upload data export to MinIO: {e}")

        return {"status": "completed", "size_bytes": len(zip_bytes)}
    finally:
        db.close()


@celery_app.task(name="app.workers.tasks.lgpd_tasks.data_retention_cleanup")
def data_retention_cleanup():
    """Monthly task: hard-delete records with deleted_at > 5 years.

    NEVER deletes audit_logs — they are immutable by design.
    """
    from app.db.session import SessionLocal
    from app.models.attachment import Attachment
    from app.models.expense_request import ExpenseRequest
    from app.models.notification import Notification
    from app.models.payment import Payment
    from app.models.request_comment import RequestComment
    from app.models.request_version import RequestVersion
    from app.models.user import User

    db = SessionLocal()
    cutoff = datetime.now(timezone.utc) - timedelta(days=5 * 365)

    tables = [
        ("notifications", Notification),
        ("attachments", Attachment),
        ("payments", Payment),
        ("request_comments", RequestComment),
        ("request_versions", RequestVersion),
        ("expense_requests", ExpenseRequest),
        ("users", User),
    ]

    total_deleted = 0
    try:
        for name, model in tables:
            if not hasattr(model, "deleted_at"):
                continue
            count = db.query(model).filter(model.deleted_at < cutoff).delete()
            total_deleted += count
            if count:
                logger.info(f"Retention cleanup: deleted {count} rows from {name}")

        db.commit()
        logger.info(f"Retention cleanup complete: {total_deleted} total records purged")
        return {"total_deleted": total_deleted}
    except Exception as e:
        db.rollback()
        logger.error(f"Retention cleanup failed: {e}")
        raise
    finally:
        db.close()
