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
    """Run daily strategist analysis for forecasting and optimization.

    AI Role: STRATEGIST — scheduled forecasts/optimization via Celery beat.
    Aggregates expense data by department, identifies spending trends,
    and generates optimization recommendations.
    """
    from app.models.ai_analysis_log import AIAnalysisLog
    from app.models.department import Department
    from app.models.expense_request import ExpenseRequest

    db = SessionLocal()
    try:
        logger.info("Running daily strategist analysis")

        departments = db.query(Department).all()
        summary = []
        for dept in departments:
            dept_requests = (
                db.query(ExpenseRequest)
                .filter(ExpenseRequest.deleted_at.is_(None))
                .all()
            )
            total = sum(float(r.amount or 0) for r in dept_requests)
            summary.append({
                "department_id": str(dept.id),
                "department_name": dept.name,
                "total_requests": len(dept_requests),
                "total_amount": total,
            })

        # TODO: Call Anthropic API with STRATEGIST prompt for department-level
        # spending insights, forecasts, anomaly detection, and optimization
        # recommendations. For now, log the aggregated data.
        logger.info(f"Strategist aggregated {len(departments)} departments")

        log = AIAnalysisLog(
            ai_role="STRATEGIST",
            model_used="stub",
            input_tokens=0,
            output_tokens=0,
            recommendation="Stub: pending full Anthropic integration",
            full_response={"departments": summary, "status": "stub"},
        )
        db.add(log)
        db.commit()

        logger.info("Strategist analysis completed")
        return {"departments_analyzed": len(departments), "summary": summary}
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
