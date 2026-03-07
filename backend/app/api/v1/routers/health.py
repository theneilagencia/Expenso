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
        from sqlalchemy import create_engine, text
        from app.config import settings
        engine = create_engine(settings.DATABASE_URL, connect_args={"connect_timeout": 10})
        with engine.connect() as conn:
            # Check tables
            rows = conn.execute(text(
                "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename"
            )).fetchall()
            result["tables"] = [r[0] for r in rows]

            # Check alembic version
            try:
                rows = conn.execute(text("SELECT version_num FROM alembic_version")).fetchall()
                result["alembic_version"] = [r[0] for r in rows]
            except Exception as e:
                result["alembic_version"] = f"error: {e}"
                conn.rollback()

            # Check users
            if "users" in result["tables"]:
                rows = conn.execute(text("SELECT email, role, status FROM users LIMIT 5")).fetchall()
                result["users"] = [{"email": r[0], "role": r[1], "status": r[2]} for r in rows]
            else:
                result["users"] = "NO USERS TABLE"
    except Exception as e:
        result["db_error"] = str(e)
        result["traceback"] = traceback.format_exc()
    return result


@router.post("/debug/migrate", summary="Temporary: run migrations", include_in_schema=False)
async def debug_migrate():
    """Temporary endpoint to run alembic migrations and return results."""
    import io
    import traceback
    result = {"steps": []}

    try:
        from sqlalchemy import create_engine, text
        from app.config import settings

        engine = create_engine(settings.DATABASE_URL, connect_args={"connect_timeout": 10})

        # Step 1: Test connection
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
            result["steps"].append("DB connection OK")

        # Step 2: Run alembic
        try:
            from alembic.config import Config
            from alembic import command

            alembic_cfg = Config("alembic.ini")
            alembic_cfg.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

            # Capture output
            output = io.StringIO()
            alembic_cfg.stdout = output

            command.upgrade(alembic_cfg, "head")
            result["steps"].append(f"Alembic upgrade OK: {output.getvalue()}")
        except Exception as e:
            result["steps"].append(f"Alembic FAILED: {e}")
            result["alembic_traceback"] = traceback.format_exc()

        # Step 3: Check tables after
        with engine.connect() as conn:
            rows = conn.execute(text(
                "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename"
            )).fetchall()
            result["tables_after"] = [r[0] for r in rows]

        # Step 4: Run seed
        try:
            from app.db.session import SessionLocal
            from scripts.seed_db import seed
            db = SessionLocal()
            try:
                seed(db)
                result["steps"].append("Seed OK")
            finally:
                db.close()
        except Exception as e:
            result["steps"].append(f"Seed FAILED: {e}")
            result["seed_traceback"] = traceback.format_exc()

    except Exception as e:
        result["error"] = str(e)
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
