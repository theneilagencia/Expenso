import json
import logging
from datetime import datetime, timezone
from typing import AsyncGenerator, Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.config import settings
from app.core.state_machine import transition
from app.integrations.anthropic.context_builder import (
    build_analyst_context,
    build_assistant_context,
    build_chatbot_context,
)
from app.models.ai_analysis_log import AIAnalysisLog
from app.models.expense_category import ExpenseCategory
from app.models.expense_request import ExpenseRequest

logger = logging.getLogger(__name__)

MODEL = "claude-sonnet-4-20250514"


def _get_client():
    try:
        import anthropic
        return anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
    except Exception as e:
        logger.error(f"Failed to create Anthropic client: {e}")
        return None


async def _get_async_client():
    try:
        import anthropic
        return anthropic.AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)
    except Exception as e:
        logger.error(f"Failed to create async Anthropic client: {e}")
        return None


class AIService:
    @staticmethod
    async def stream_assistance(
        request_id: UUID, db: Session, user_locale: str = "en-US"
    ) -> AsyncGenerator[str, None]:
        expense = db.query(ExpenseRequest).filter(ExpenseRequest.id == request_id).first()
        if not expense:
            yield f"data: {json.dumps({'error': 'Request not found'})}\n\n"
            return

        category = None
        if expense.category_id:
            category = db.query(ExpenseCategory).filter(ExpenseCategory.id == expense.category_id).first()

        request_data = {
            "title": expense.title,
            "amount": str(expense.amount),
            "currency": expense.currency or "BRL",
            "justification": expense.justification,
            "vendor_name": expense.vendor_name,
        }
        category_data = {"name": category.name} if category else None
        system_prompt = build_assistant_context(request_data, category_data, user_locale)

        client = await _get_async_client()
        if not client:
            yield f"data: {json.dumps({'error': 'AI service unavailable'})}\n\n"
            return

        try:
            async with client.messages.stream(
                model=MODEL,
                max_tokens=1024,
                system=system_prompt,
                messages=[{"role": "user", "content": "Analyze this expense request and provide suggestions."}],
            ) as stream:
                async for text in stream.text_stream:
                    yield f"data: {json.dumps({'content': text})}\n\n"
            yield f"data: {json.dumps({'done': True})}\n\n"
        except Exception as e:
            logger.error(f"AI streaming error: {e}")
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    @staticmethod
    def analyze_request(request_id: UUID, db: Session) -> Optional[dict]:
        expense = db.query(ExpenseRequest).filter(ExpenseRequest.id == request_id).first()
        if not expense:
            return None

        category = None
        if expense.category_id:
            category = db.query(ExpenseCategory).filter(ExpenseCategory.id == expense.category_id).first()

        request_data = {
            "title": expense.title,
            "amount": str(expense.amount),
            "currency": expense.currency or "BRL",
            "justification": expense.justification,
            "vendor_name": expense.vendor_name,
            "expense_date": str(expense.expense_date) if expense.expense_date else None,
        }
        category_data = {
            "name": category.name,
            "limit_per_request": str(category.limit_per_request) if hasattr(category, 'limit_per_request') else None,
            "limit_per_month": str(category.limit_per_month) if hasattr(category, 'limit_per_month') else None,
        } if category else None

        previous_requests = (
            db.query(ExpenseRequest)
            .filter(ExpenseRequest.employee_id == expense.employee_id, ExpenseRequest.id != expense.id)
            .all()
        )
        history = [{"id": str(r.id)} for r in previous_requests]

        system_prompt = build_analyst_context(request_data, category_data, history)

        client = _get_client()
        if not client:
            _handle_ai_skip(expense, db)
            return {"ai_skipped": True}

        try:
            response = client.messages.create(
                model=MODEL,
                max_tokens=2048,
                system=system_prompt,
                messages=[{"role": "user", "content": "Analyze this request and return the JSON analysis."}],
            )
            content = response.content[0].text
            start = content.find("{")
            end = content.rfind("}") + 1
            if start >= 0 and end > start:
                analysis = json.loads(content[start:end])
            else:
                analysis = {"error": "Could not parse AI response"}

            log = AIAnalysisLog(
                request_id=expense.id,
                ai_role="ANALYST",
                model_used=MODEL,
                input_tokens=response.usage.input_tokens,
                output_tokens=response.usage.output_tokens,
                response=analysis,
                status="SUCCESS",
            )
            db.add(log)

            _apply_ai_results(expense, analysis)

            recommendation = analysis.get("recommendation", "REVIEW").upper()
            if recommendation == "BLOCK":
                action = "ai_blocked"
            else:
                action = "ai_approved"

            try:
                new_status = transition(expense.status, action)
                expense.status = new_status
            except Exception:
                logger.warning(f"State transition failed for request {request_id}, action={action}")

            db.commit()
            return analysis
        except Exception as e:
            logger.error(f"AI analysis error: {e}")
            _handle_ai_skip(expense, db)
            return {"ai_skipped": True, "error": str(e)}

    @staticmethod
    async def stream_chat(
        messages: list, user_locale: str = "en-US"
    ) -> AsyncGenerator[str, None]:
        system_prompt = build_chatbot_context(user_locale)

        client = await _get_async_client()
        if not client:
            yield f"data: {json.dumps({'error': 'AI service unavailable'})}\n\n"
            return

        try:
            api_messages = [
                {"role": msg["role"], "content": msg["content"]}
                for msg in messages
            ]

            async with client.messages.stream(
                model=MODEL,
                max_tokens=1024,
                system=system_prompt,
                messages=api_messages,
            ) as stream:
                async for text in stream.text_stream:
                    yield f"data: {json.dumps({'content': text})}\n\n"
            yield f"data: {json.dumps({'done': True})}\n\n"
        except Exception as e:
            logger.error(f"AI chat error: {e}")
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    @staticmethod
    def get_analysis(request_id: UUID, db: Session) -> Optional[dict]:
        log = (
            db.query(AIAnalysisLog)
            .filter(AIAnalysisLog.request_id == request_id)
            .order_by(AIAnalysisLog.created_at.desc())
            .first()
        )
        if not log:
            return None
        resp = log.response or {}
        return {
            "id": str(log.id),
            "risk_score": resp.get("risk_score"),
            "quality_score": resp.get("semantic_quality_score"),
            "recommendation": resp.get("recommendation"),
            "full_response": resp,
            "created_at": str(log.created_at),
        }


def _apply_ai_results(expense: ExpenseRequest, analysis: dict):
    expense.ai_risk_score = analysis.get("risk_score")
    risk_score = expense.ai_risk_score
    if risk_score is not None:
        if risk_score >= 80:
            expense.ai_risk_level = "HIGH"
        elif risk_score >= 40:
            expense.ai_risk_level = "MEDIUM"
        else:
            expense.ai_risk_level = "LOW"
    expense.ai_recommendation = analysis.get("recommendation")
    expense.ai_summary = analysis.get("summary")
    expense.ai_attention_points = analysis.get("attention_points")
    expense.ai_policy_violations = analysis.get("policy_violations")
    expense.ai_analyzed_at = datetime.now(timezone.utc)


def _handle_ai_skip(expense: ExpenseRequest, db: Session):
    expense.ai_skipped = True
    expense.ai_analyzed_at = datetime.now(timezone.utc)
    try:
        new_status = transition(expense.status, "ai_approved")
        expense.status = new_status
    except Exception:
        logger.warning(f"AI skip transition failed for request {expense.id}")
    db.commit()
