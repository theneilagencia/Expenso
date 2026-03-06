import json
import logging

from app.db.session import SessionLocal
from app.workers.celery_app import celery_app

logger = logging.getLogger(__name__)

MODEL = "claude-sonnet-4-20250514"


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
    Aggregates expense data by department and category, then calls Claude API
    for strategic insights, forecasts, and optimization recommendations.
    """
    from sqlalchemy import func

    from app.config import settings
    from app.integrations.anthropic.context_builder import build_strategist_context
    from app.integrations.anthropic.prompts.strategist import STRATEGIST_SYSTEM_PROMPT
    from app.models.ai_analysis_log import AIAnalysisLog
    from app.models.department import Department
    from app.models.expense_category import ExpenseCategory
    from app.models.expense_request import ExpenseRequest
    from app.models.user import User

    db = SessionLocal()
    try:
        logger.info("Running daily strategist analysis")

        # Aggregate by department
        departments = db.query(Department).filter(Department.deleted_at.is_(None)).all()
        dept_summary = []
        for dept in departments:
            dept_requests = (
                db.query(ExpenseRequest)
                .join(User, ExpenseRequest.employee_id == User.id)
                .filter(
                    User.department_id == dept.id,
                    ExpenseRequest.deleted_at.is_(None),
                )
                .all()
            )
            total = sum(float(r.amount or 0) for r in dept_requests)
            dept_summary.append({
                "department_id": str(dept.id),
                "department_name": dept.name,
                "total_requests": len(dept_requests),
                "total_amount": total,
            })

        # Aggregate by category
        cat_rows = (
            db.query(
                ExpenseCategory.name,
                func.count(ExpenseRequest.id).label("count"),
                func.coalesce(func.sum(ExpenseRequest.amount), 0).label("total"),
            )
            .outerjoin(ExpenseRequest, ExpenseRequest.category_id == ExpenseCategory.id)
            .filter(ExpenseCategory.deleted_at.is_(None))
            .group_by(ExpenseCategory.id, ExpenseCategory.name)
            .all()
        )
        cat_summary = [
            {"category_name": row.name, "count": row.count, "total": float(row.total)}
            for row in cat_rows
        ]

        # Build context and call Claude API
        user_message = build_strategist_context(dept_summary, cat_summary)

        client = None
        if settings.ANTHROPIC_API_KEY:
            try:
                import anthropic
                client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
            except Exception as e:
                logger.warning(f"Failed to create Anthropic client: {e}")

        if client:
            response = client.messages.create(
                model=MODEL,
                max_tokens=4096,
                system=STRATEGIST_SYSTEM_PROMPT["en-US"],
                messages=[{"role": "user", "content": user_message}],
            )

            content = response.content[0].text
            start = content.find("{")
            end = content.rfind("}") + 1
            analysis = {}
            if start >= 0 and end > start:
                try:
                    analysis = json.loads(content[start:end])
                except json.JSONDecodeError:
                    logger.warning("Failed to parse strategist JSON, storing raw")
                    analysis = {"raw_response": content}

            log = AIAnalysisLog(
                ai_role="STRATEGIST",
                model_used=MODEL,
                input_tokens=response.usage.input_tokens,
                output_tokens=response.usage.output_tokens,
                status="SUCCESS",
                response=analysis,
            )
            db.add(log)
            db.commit()

            logger.info(f"Strategist analysis completed with {len(dept_summary)} departments")
            return {"departments_analyzed": len(dept_summary), "analysis": analysis}
        else:
            # Fallback: store stub result when Anthropic unavailable
            logger.info("Anthropic client unavailable, storing stub strategist result")
            log = AIAnalysisLog(
                ai_role="STRATEGIST",
                model_used="stub",
                input_tokens=0,
                output_tokens=0,
                status="SUCCESS",
                response={"departments": dept_summary, "status": "stub"},
            )
            db.add(log)
            db.commit()
            return {"departments_analyzed": len(dept_summary), "summary": dept_summary}
    except Exception as e:
        logger.error(f"Strategist analysis failed: {e}")
        raise
    finally:
        db.close()


@celery_app.task(name="app.workers.tasks.ai_tasks.run_strategist_weekly")
def run_strategist_weekly():
    """Run weekly strategist analysis with broader window and week-over-week comparison.

    AI Role: STRATEGIST — weekly deep analysis via Celery beat.
    Aggregates 90 days of expense data with week-over-week trends,
    then calls Claude API for strategic insights and optimization recommendations.
    """
    from datetime import datetime, timedelta

    from sqlalchemy import func

    from app.config import settings
    from app.integrations.anthropic.context_builder import build_strategist_context
    from app.integrations.anthropic.prompts.strategist import STRATEGIST_SYSTEM_PROMPT
    from app.models.ai_analysis_log import AIAnalysisLog
    from app.models.department import Department
    from app.models.expense_category import ExpenseCategory
    from app.models.expense_request import ExpenseRequest
    from app.models.user import User

    db = SessionLocal()
    try:
        logger.info("Running weekly strategist analysis (90-day window)")

        now = datetime.utcnow()
        ninety_days_ago = now - timedelta(days=90)
        seven_days_ago = now - timedelta(days=7)

        # Aggregate by department (last 90 days)
        departments = db.query(Department).filter(Department.deleted_at.is_(None)).all()
        dept_summary = []
        for dept in departments:
            dept_requests = (
                db.query(ExpenseRequest)
                .join(User, ExpenseRequest.employee_id == User.id)
                .filter(
                    User.department_id == dept.id,
                    ExpenseRequest.deleted_at.is_(None),
                    ExpenseRequest.created_at >= ninety_days_ago,
                )
                .all()
            )
            total = sum(float(r.amount or 0) for r in dept_requests)
            # Week-over-week: requests in last 7 days vs prior 7 days
            recent = [r for r in dept_requests if r.created_at and r.created_at >= seven_days_ago]
            prior_week_start = seven_days_ago - timedelta(days=7)
            prior = [
                r for r in dept_requests
                if r.created_at and prior_week_start <= r.created_at < seven_days_ago
            ]
            dept_summary.append({
                "department_id": str(dept.id),
                "department_name": dept.name,
                "total_requests": len(dept_requests),
                "total_amount": total,
                "last_week_requests": len(recent),
                "last_week_amount": sum(float(r.amount or 0) for r in recent),
                "prior_week_requests": len(prior),
                "prior_week_amount": sum(float(r.amount or 0) for r in prior),
            })

        # Aggregate by category (last 90 days)
        cat_rows = (
            db.query(
                ExpenseCategory.name,
                func.count(ExpenseRequest.id).label("count"),
                func.coalesce(func.sum(ExpenseRequest.amount), 0).label("total"),
            )
            .outerjoin(ExpenseRequest, ExpenseRequest.category_id == ExpenseCategory.id)
            .filter(
                ExpenseCategory.deleted_at.is_(None),
                ExpenseRequest.created_at >= ninety_days_ago,
            )
            .group_by(ExpenseCategory.id, ExpenseCategory.name)
            .all()
        )
        cat_summary = [
            {"category_name": row.name, "count": row.count, "total": float(row.total)}
            for row in cat_rows
        ]

        # Build context with week-over-week note and call Claude API
        wow_note = (
            "\n\nPeriod: last 90 days. Report type: WEEKLY. "
            "Include week-over-week comparison using last_week vs prior_week fields. "
            "Identify spending trends, anomalies, and optimization opportunities."
        )
        user_message = build_strategist_context(dept_summary, cat_summary) + wow_note

        client = None
        if settings.ANTHROPIC_API_KEY:
            try:
                import anthropic
                client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
            except Exception as e:
                logger.warning(f"Failed to create Anthropic client: {e}")

        if client:
            response = client.messages.create(
                model=MODEL,
                max_tokens=8192,
                system=STRATEGIST_SYSTEM_PROMPT["en-US"],
                messages=[{"role": "user", "content": user_message}],
            )

            content = response.content[0].text
            start = content.find("{")
            end = content.rfind("}") + 1
            analysis = {}
            if start >= 0 and end > start:
                try:
                    analysis = json.loads(content[start:end])
                except json.JSONDecodeError:
                    logger.warning("Failed to parse weekly strategist JSON, storing raw")
                    analysis = {"raw_response": content}

            analysis["report_type"] = "weekly"

            log = AIAnalysisLog(
                ai_role="STRATEGIST",
                model_used=MODEL,
                input_tokens=response.usage.input_tokens,
                output_tokens=response.usage.output_tokens,
                status="SUCCESS",
                response=analysis,
            )
            db.add(log)
            db.commit()

            logger.info(f"Weekly strategist analysis completed with {len(dept_summary)} departments")
            return {"departments_analyzed": len(dept_summary), "analysis": analysis}
        else:
            # Fallback: store stub result when Anthropic unavailable
            logger.info("Anthropic client unavailable, storing stub weekly strategist result")
            log = AIAnalysisLog(
                ai_role="STRATEGIST",
                model_used="stub",
                input_tokens=0,
                output_tokens=0,
                status="SUCCESS",
                response={
                    "departments": dept_summary,
                    "report_type": "weekly",
                    "status": "stub",
                },
            )
            db.add(log)
            db.commit()
            return {"departments_analyzed": len(dept_summary), "summary": dept_summary}
    except Exception as e:
        logger.error(f"Weekly strategist analysis failed: {e}")
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
