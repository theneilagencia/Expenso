"""Health check endpoint with dependency checks."""

import logging
from concurrent.futures import ThreadPoolExecutor
from concurrent.futures import TimeoutError as FuturesTimeout
from datetime import datetime, timezone

from fastapi import APIRouter

router = APIRouter()
logger = logging.getLogger(__name__)


def _run_check_with_timeout(check_fn, timeout=5):
    """Run a health check with a hard timeout to prevent hanging."""
    with ThreadPoolExecutor(max_workers=1) as executor:
        future = executor.submit(check_fn)
        try:
            return future.result(timeout=timeout)
        except FuturesTimeout:
            return {"status": "error", "detail": "timeout"}
        except Exception as e:
            return {"status": "error", "detail": str(e)}


def _check_database() -> dict:
    """Check DB connectivity with a simple query."""
    try:
        from sqlalchemy import text

        from app.db.session import SessionLocal
        db = SessionLocal()
        try:
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
        client = redis.from_url(
            settings.REDIS_URL,
            decode_responses=True,
            socket_connect_timeout=3,
            socket_timeout=3,
        )
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


@router.get("/debug/db", summary="Temporary DB diagnostic", include_in_schema=False)
async def debug_db():
    """Temporary endpoint to debug database state. Remove after fixing."""
    import traceback
    result = {}
    try:
        from sqlalchemy import text
        from app.db.session import SessionLocal
        db = SessionLocal()
        try:
            # Check tables
            rows = db.execute(text(
                "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename"
            )).fetchall()
            result["tables"] = [r[0] for r in rows]

            # Check alembic version
            try:
                rows = db.execute(text("SELECT version_num FROM alembic_version")).fetchall()
                result["alembic_version"] = [r[0] for r in rows]
            except Exception as e:
                result["alembic_version"] = f"error: {e}"

            # Check users
            if "users" in result["tables"]:
                rows = db.execute(text("SELECT email, role, status FROM users LIMIT 5")).fetchall()
                result["users"] = [{"email": r[0], "role": r[1], "status": r[2]} for r in rows]
            else:
                result["users"] = "NO USERS TABLE"

            # Try login flow
            try:
                from app.models.user import User
                from app.core.security import verify_password
                user = db.query(User).filter(User.email == "admin@expenso.io").first()
                if user:
                    result["admin_found"] = True
                    result["admin_role"] = user.role
                    result["password_ok"] = verify_password("Admin@2026!", user.password_hash)
                else:
                    result["admin_found"] = False
            except Exception as e:
                result["login_test"] = f"error: {e}"
                result["login_traceback"] = traceback.format_exc()
        finally:
            db.close()
    except Exception as e:
        result["db_error"] = str(e)
        result["traceback"] = traceback.format_exc()
    return result


@router.get("/health", summary="Health check with dependency status")
async def health_check():
    checks = {
        "database": _run_check_with_timeout(_check_database, timeout=5),
        "redis": _run_check_with_timeout(_check_redis, timeout=5),
        "minio": _run_check_with_timeout(_check_minio, timeout=5),
        "celery": _run_check_with_timeout(_check_celery, timeout=5),
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
