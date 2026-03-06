"""Health check endpoint with dependency checks."""

import logging
from datetime import datetime, timezone

from fastapi import APIRouter

router = APIRouter()
logger = logging.getLogger(__name__)


def _check_database() -> dict:
    """Check DB connectivity with a simple query."""
    try:
        from app.db.session import SessionLocal
        db = SessionLocal()
        try:
            from sqlalchemy import text
            db.execute(text("SELECT 1"))
            return {"status": "ok"}
        finally:
            db.close()
    except Exception as e:
        return {"status": "error", "detail": str(e)}


def _check_redis() -> dict:
    """Check Redis connectivity."""
    try:
        import redis

        from app.config import settings
        client = redis.from_url(settings.REDIS_URL, decode_responses=True)
        client.ping()
        return {"status": "ok"}
    except Exception as e:
        return {"status": "error", "detail": str(e)}


def _check_minio() -> dict:
    """Check MinIO connectivity."""
    try:
        from app.api.v1.routers.attachments import get_minio_client
        from app.config import settings
        client = get_minio_client()
        bucket = getattr(settings, "MINIO_BUCKET", "expenso")
        client.bucket_exists(bucket)
        return {"status": "ok"}
    except Exception as e:
        return {"status": "error", "detail": str(e)}


def _check_celery() -> dict:
    """Check Celery worker availability."""
    try:
        from app.workers.celery_app import celery_app
        inspector = celery_app.control.inspect(timeout=2.0)
        ping = inspector.ping()
        if ping:
            return {"status": "ok", "workers": len(ping)}
        return {"status": "warning", "detail": "No workers responding"}
    except Exception as e:
        return {"status": "error", "detail": str(e)}


@router.get("/health", summary="Health check with dependency status")
async def health_check():
    checks = {
        "database": _check_database(),
        "redis": _check_redis(),
        "minio": _check_minio(),
        "celery": _check_celery(),
    }

    # Overall status: healthy if DB is ok, degraded if optional deps fail
    db_ok = checks["database"]["status"] == "ok"
    all_ok = all(c["status"] == "ok" for c in checks.values())

    if all_ok:
        overall = "healthy"
    elif db_ok:
        overall = "degraded"
    else:
        overall = "unhealthy"

    return {
        "status": overall,
        "service": "expenso-backend",
        "version": "1.0.0",
        "checks": checks,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
