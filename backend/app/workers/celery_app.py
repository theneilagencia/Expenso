from celery import Celery

from app.config import settings

celery_app = Celery(
    "expenso",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
)

celery_app.conf.beat_schedule = {
    "strategist-daily-analysis": {
        "task": "app.workers.tasks.ai_tasks.run_strategist_analysis",
        "schedule": 86400.0,  # daily
    },
    "sla-check-hourly": {
        "task": "app.workers.tasks.ai_tasks.check_sla",
        "schedule": 3600.0,  # hourly
    },
}

celery_app.autodiscover_tasks(["app.workers.tasks"])
