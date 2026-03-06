"""Admin system status endpoint — ADMIN only."""

import logging
import time
from datetime import datetime, timezone

from fastapi import APIRouter, Depends

from app.core.permissions import require_role

router = APIRouter()
logger = logging.getLogger(__name__)

_START_TIME = time.time()


@router.get("/system-status", summary="System status and resource usage (ADMIN)")
async def system_status(
    current_user=Depends(require_role("ADMIN")),
):
    """Return system resource usage and component status."""
    result = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "uptime_seconds": round(time.time() - _START_TIME, 1),
    }

    # System resources via psutil
    try:
        import psutil
        result["system"] = {
            "cpu_percent": psutil.cpu_percent(interval=0.1),
            "memory_percent": psutil.virtual_memory().percent,
            "memory_used_mb": round(psutil.virtual_memory().used / (1024 * 1024), 1),
            "memory_total_mb": round(psutil.virtual_memory().total / (1024 * 1024), 1),
            "disk_percent": psutil.disk_usage("/").percent,
        }
    except ImportError:
        result["system"] = {"error": "psutil not installed"}
    except Exception as e:
        result["system"] = {"error": str(e)}

    # Celery queue info
    try:
        from app.workers.celery_app import celery_app
        inspector = celery_app.control.inspect(timeout=2.0)
        active = inspector.active() or {}
        reserved = inspector.reserved() or {}

        total_active = sum(len(tasks) for tasks in active.values())
        total_reserved = sum(len(tasks) for tasks in reserved.values())

        result["celery"] = {
            "workers": len(active),
            "active_tasks": total_active,
            "queued_tasks": total_reserved,
        }
    except Exception as e:
        result["celery"] = {"error": str(e)}

    # Redis info
    try:
        import redis

        from app.config import settings
        client = redis.from_url(settings.REDIS_URL)
        info = client.info("memory")
        result["redis"] = {
            "used_memory_mb": round(info.get("used_memory", 0) / (1024 * 1024), 1),
            "connected_clients": info.get("connected_clients", 0),
        }
    except Exception as e:
        result["redis"] = {"error": str(e)}

    # DB connection pool info
    try:
        from app.db.session import engine
        pool = engine.pool
        result["database"] = {
            "pool_size": pool.size(),
            "checked_out": pool.checkedout(),
            "overflow": pool.overflow(),
        }
    except Exception as e:
        result["database"] = {"error": str(e)}

    return result
