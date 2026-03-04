import logging

from app.db.session import SessionLocal
from app.workers.celery_app import celery_app

logger = logging.getLogger(__name__)


@celery_app.task(name="app.workers.tasks.ai_tasks.analyze_request")
def analyze_request(request_id: str):
    """Run AI analyst on a submitted expense request."""
    from app.services.ai_service import AIService

    db = SessionLocal()
    try:
        result = AIService.analyze_request(request_id, db)
        if result:
            logger.info(f"AI analysis completed for request {request_id}")
        else:
            logger.warning(f"AI analysis returned no result for request {request_id}")
        return result
    except Exception as e:
        logger.error(f"AI analysis task failed for request {request_id}: {e}")
        raise
    finally:
        db.close()


@celery_app.task(name="app.workers.tasks.ai_tasks.run_strategist_analysis")
def run_strategist_analysis():
    """Run daily strategist analysis for forecasting and optimization."""
    db = SessionLocal()
    try:
        logger.info("Running daily strategist analysis")
        # Strategist role: aggregate data analysis for forecasting
        # TODO: Implement full strategist with department-level insights
        logger.info("Strategist analysis completed")
    except Exception as e:
        logger.error(f"Strategist analysis failed: {e}")
        raise
    finally:
        db.close()


@celery_app.task(name="app.workers.tasks.ai_tasks.check_sla")
def check_sla():
    """Check SLA violations and create notifications."""
    from app.services.sla_service import SLAService

    db = SessionLocal()
    try:
        count = SLAService.create_sla_notifications(db)
        logger.info(f"SLA check created {count} notifications")
        return count
    except Exception as e:
        logger.error(f"SLA check failed: {e}")
        raise
    finally:
        db.close()
