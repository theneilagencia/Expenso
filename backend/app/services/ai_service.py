import hashlib
import json
import logging
import time
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
    build_writer_context,
)
from app.integrations.anthropic.prompts.writer import WRITER_SYSTEM_PROMPT
from app.models.ai_analysis_log import AIAnalysisLog
from app.models.expense_category import ExpenseCategory
from app.models.expense_request import ExpenseRequest
from app.models.vendor_list import VendorList
from app.schemas.ai_analysis import AnalystResponse

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


def _run_hard_policy_checks(expense: ExpenseRequest, category, db: Session) -> list[str]:
    """Run hard policy checks BEFORE calling Claude. Returns list of blocking violations."""
    violations = []

    if not category:
        return violations

    # 1. Amount exceeds category limit
    if category.limit_per_request and expense.amount:
        if float(expense.amount) > category.limit_per_request:
            violations.append(
                f"Amount {expense.amount} exceeds category limit of {category.limit_per_request}"
            )

    # 2. Expense date exceeds max_days_to_submit
    if category.max_days_to_submit and expense.expense_date:
        expense_date = expense.expense_date
        now = datetime.now(timezone.utc)
        # Handle naive datetimes (e.g. from SQLite) by comparing as naive
        if expense_date.tzinfo is None:
            now = now.replace(tzinfo=None)
        days_diff = (now - expense_date).days
        if days_diff > category.max_days_to_submit:
            violations.append(
                f"Expense is {days_diff} days old, maximum allowed is {category.max_days_to_submit} days"
            )

    # 3. Justification too short
    if category.min_justification_chars:
        justification_len = len(expense.justification or "")
        if justification_len < category.min_justification_chars:
            violations.append(
                f"Justification has {justification_len} characters, minimum required is {category.min_justification_chars}"
            )

    return violations


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
    async def stream_assistance_draft(
        request_data: dict, category_data: dict = None, user_locale: str = "en-US"
    ) -> AsyncGenerator[str, None]:
        """Stream assistance for unsaved draft forms using query params."""
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
                messages=[{"role": "user", "content": "Analyze this draft expense request and provide suggestions."}],
            ) as stream:
                async for text in stream.text_stream:
                    yield f"data: {json.dumps({'content': text})}\n\n"
            yield f"data: {json.dumps({'done': True})}\n\n"
        except Exception as e:
            logger.error(f"AI draft streaming error: {e}")
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    @staticmethod
    def analyze_request(request_id: UUID, db: Session) -> Optional[dict]:
        expense = db.query(ExpenseRequest).filter(ExpenseRequest.id == request_id).first()
        if not expense:
            return None

        category = None
        if expense.category_id:
            category = db.query(ExpenseCategory).filter(ExpenseCategory.id == expense.category_id).first()

        # --- Embedding + Duplicate detection ---
        from app.services.embedding_service import EmbeddingService
        EmbeddingService.store_embedding(expense, db)
        duplicates = EmbeddingService.find_duplicates(db, expense, threshold=0.92)

        # --- Hard policy checks (before Claude call) ---
        policy_violations = _run_hard_policy_checks(expense, category, db)

        # --- Vendor blacklist/whitelist check ---
        vendor_risk_adjustment = 0
        if expense.vendor_name:
            vendor_matches = (
                db.query(VendorList)
                .filter(
                    VendorList.name.ilike(f"%{expense.vendor_name}%"),
                    VendorList.deleted_at.is_(None),
                )
                .all()
            )
            for match in vendor_matches:
                if match.list_type == "BLACKLIST":
                    policy_violations.append(
                        f"BLACKLISTED_VENDOR: Vendor {expense.vendor_name} is blacklisted: {match.reason or 'No reason provided'}"
                    )
                elif match.list_type == "WHITELIST":
                    vendor_risk_adjustment -= 10

        # Add duplicate violations
        for dup in duplicates:
            if dup["similarity"] > 0.92:
                policy_violations.append(
                    f"Duplicate suspected: similar to request {dup['id']} "
                    f"(similarity: {dup['similarity']}, title: {dup['title']})"
                )

        if policy_violations:
            analysis = {
                "risk_score": 100,
                "risk_level": "BLOCK",
                "recommendation": "REJECT",
                "recommendation_reason": "Hard policy violation detected",
                "semantic_quality_score": 0,
                "policy_violations": policy_violations,
                "anomalies": [],
                "duplicate_suspicion": False,
                "attention_points": policy_violations,
            }

            log = AIAnalysisLog(
                request_id=expense.id,
                ai_role="ANALYST",
                model_used="policy_engine",
                input_tokens=0,
                output_tokens=0,
                response=analysis,
                duration_ms=0,
                status="SUCCESS",
            )
            db.add(log)

            _apply_ai_results(expense, analysis)

            try:
                new_status = transition(expense.status, "ai_blocked")
                expense.status = new_status
            except Exception:
                logger.warning(f"Policy block transition failed for request {request_id}")

            db.commit()
            return analysis

        # --- Build context for Claude ---
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
            "limit_per_request": str(category.limit_per_request) if category and category.limit_per_request else None,
            "limit_per_month": str(category.limit_per_month) if category and category.limit_per_month else None,
            "max_days_to_submit": category.max_days_to_submit if category else None,
            "min_justification_chars": category.min_justification_chars if category else None,
            "requires_strong_just": category.requires_strong_just if category else False,
            "receipt_required_above": str(category.receipt_required_above) if category and category.receipt_required_above else None,
            "ai_attention_score": category.ai_attention_score if category else 50,
        } if category else None

        previous_requests = (
            db.query(ExpenseRequest)
            .filter(
                ExpenseRequest.employee_id == expense.employee_id,
                ExpenseRequest.id != expense.id,
                ExpenseRequest.deleted_at.is_(None),
            )
            .order_by(ExpenseRequest.created_at.desc())
            .limit(20)
            .all()
        )
        history = [
            {
                "title": r.title,
                "amount": str(r.amount),
                "status": r.status,
                "date": str(r.expense_date) if r.expense_date else None,
            }
            for r in previous_requests
        ]

        # Include duplicate info in context for Claude
        if duplicates:
            request_data["similar_requests"] = duplicates

        system_prompt = build_analyst_context(request_data, category_data, history)

        # Compute prompt hash
        prompt_text = system_prompt + json.dumps(request_data, default=str)
        prompt_hash = hashlib.sha256(prompt_text.encode()).hexdigest()

        client = _get_client()
        if not client:
            _handle_ai_skip(expense, db)
            return {"ai_skipped": True}

        try:
            start_time = time.monotonic()
            response = client.messages.create(
                model=MODEL,
                max_tokens=2048,
                system=system_prompt,
                messages=[{"role": "user", "content": "Analyze this request and return the JSON analysis."}],
            )
            duration_ms = int((time.monotonic() - start_time) * 1000)

            content = response.content[0].text

            # Parse and validate with Pydantic
            start = content.find("{")
            end = content.rfind("}") + 1
            if start >= 0 and end > start:
                raw_json = json.loads(content[start:end])
                try:
                    validated = AnalystResponse(**raw_json)
                    analysis = validated.model_dump()
                except Exception as validation_error:
                    logger.warning(f"Pydantic validation failed, using raw JSON: {validation_error}")
                    analysis = raw_json
            else:
                analysis = {"error": "Could not parse AI response"}

            # Apply vendor whitelist risk adjustment
            if vendor_risk_adjustment and "risk_score" in analysis:
                adjusted = max(0, analysis["risk_score"] + vendor_risk_adjustment)
                analysis["risk_score"] = adjusted

            log = AIAnalysisLog(
                request_id=expense.id,
                ai_role="ANALYST",
                model_used=MODEL,
                prompt_hash=prompt_hash,
                input_tokens=response.usage.input_tokens,
                output_tokens=response.usage.output_tokens,
                response=analysis,
                duration_ms=duration_ms,
                status="SUCCESS",
            )
            db.add(log)

            _apply_ai_results(expense, analysis)

            # Map recommendation to state transition
            recommendation = analysis.get("recommendation", "REVIEW").upper()
            if recommendation == "REJECT":
                action = "ai_blocked"
            elif recommendation == "REVIEW":
                action = "ai_review"
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
        messages: list, user_locale: str = "en-US",
        user_role: str = "EMPLOYEE", user_id=None, db: Session = None,
    ) -> AsyncGenerator[str, None]:
        # Build role-specific context
        user_context = None
        if db and user_id:
            try:
                if user_role == "EMPLOYEE":
                    count = db.query(ExpenseRequest).filter(
                        ExpenseRequest.employee_id == user_id,
                        ExpenseRequest.deleted_at.is_(None),
                    ).count()
                    user_context = f"User has {count} expense requests."
                elif user_role == "MANAGER":
                    pending = db.query(ExpenseRequest).filter(
                        ExpenseRequest.status == "PENDING_MANAGER",
                        ExpenseRequest.deleted_at.is_(None),
                    ).count()
                    user_context = f"There are {pending} requests pending manager approval."
                elif user_role == "FINANCE":
                    pending = db.query(ExpenseRequest).filter(
                        ExpenseRequest.status == "PENDING_FINANCE",
                        ExpenseRequest.deleted_at.is_(None),
                    ).count()
                    user_context = f"There are {pending} requests pending finance approval."
                elif user_role == "ADMIN":
                    total = db.query(ExpenseRequest).filter(
                        ExpenseRequest.deleted_at.is_(None),
                    ).count()
                    user_context = f"Total expense requests in system: {total}."
            except Exception as e:
                logger.debug(f"Failed to build chat context: {e}")

        system_prompt = build_chatbot_context(user_locale, user_role, user_context)

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

    @staticmethod
    async def stream_narrative(
        report_data: dict, user_locale: str = "en-US"
    ) -> AsyncGenerator[str, None]:
        """Stream a narrative expense report using the Writer AI role."""
        user_message = build_writer_context(
            mode="narrative", data=report_data, user_locale=user_locale
        )
        system_prompt = WRITER_SYSTEM_PROMPT.get(user_locale, WRITER_SYSTEM_PROMPT["en-US"])

        client = await _get_async_client()
        if not client:
            yield f"data: {json.dumps({'error': 'AI service unavailable'})}\n\n"
            return

        try:
            async with client.messages.stream(
                model=MODEL,
                max_tokens=4096,
                system=system_prompt,
                messages=[{"role": "user", "content": user_message}],
            ) as stream:
                async for text in stream.text_stream:
                    yield f"data: {json.dumps({'content': text})}\n\n"
            yield f"data: {json.dumps({'done': True})}\n\n"
        except Exception as e:
            logger.error(f"AI narrative streaming error: {e}")
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    @staticmethod
    def generate_summary(request_id: UUID, db: Session) -> Optional[dict]:
        """Generate an executive summary for an expense request using the Writer AI role."""
        expense = db.query(ExpenseRequest).filter(ExpenseRequest.id == request_id).first()
        if not expense:
            return None

        category = None
        if expense.category_id:
            category = (
                db.query(ExpenseCategory)
                .filter(ExpenseCategory.id == expense.category_id)
                .first()
            )

        request_data = {
            "title": expense.title,
            "amount": str(expense.amount),
            "currency": expense.currency or "BRL",
            "status": expense.status,
            "justification": expense.justification,
            "vendor_name": expense.vendor_name,
            "category_name": category.name if category else "N/A",
            "ai_risk_score": expense.ai_risk_score,
            "ai_risk_level": expense.ai_risk_level,
            "ai_recommendation": expense.ai_recommendation,
        }

        user_message = build_writer_context(mode="summary", data=request_data)
        system_prompt = WRITER_SYSTEM_PROMPT.get("en-US")

        client = _get_client()
        if not client:
            return {"ai_skipped": True}

        try:
            start_time = time.monotonic()
            response = client.messages.create(
                model=MODEL,
                max_tokens=1024,
                system=system_prompt,
                messages=[{"role": "user", "content": user_message}],
            )
            duration_ms = int((time.monotonic() - start_time) * 1000)

            summary_text = response.content[0].text

            log = AIAnalysisLog(
                request_id=expense.id,
                ai_role="WRITER",
                model_used=MODEL,
                input_tokens=response.usage.input_tokens,
                output_tokens=response.usage.output_tokens,
                response={"summary": summary_text},
                duration_ms=duration_ms,
                status="SUCCESS",
            )
            db.add(log)
            db.commit()

            return {"summary": summary_text}
        except Exception as e:
            logger.error(f"AI summary generation error: {e}")
            return {"ai_skipped": True, "error": str(e)}

    @staticmethod
    def suggest_comment(
        request_id: UUID, action: str, db: Session, user_locale: str = "en-US"
    ) -> Optional[dict]:
        """Suggest an approval/rejection comment using the Writer AI role."""
        expense = db.query(ExpenseRequest).filter(ExpenseRequest.id == request_id).first()
        if not expense:
            return None

        category = None
        if expense.category_id:
            category = (
                db.query(ExpenseCategory)
                .filter(ExpenseCategory.id == expense.category_id)
                .first()
            )

        request_data = {
            "title": expense.title,
            "amount": str(expense.amount),
            "currency": expense.currency or "BRL",
            "justification": expense.justification,
            "category_name": category.name if category else "N/A",
            "ai_risk_score": expense.ai_risk_score,
            "ai_recommendation": expense.ai_recommendation,
            "action": action,
        }

        user_message = build_writer_context(
            mode="suggest_comment", data=request_data, user_locale=user_locale
        )
        system_prompt = WRITER_SYSTEM_PROMPT.get(
            user_locale, WRITER_SYSTEM_PROMPT["en-US"]
        )

        client = _get_client()
        if not client:
            return {"ai_skipped": True}

        try:
            start_time = time.monotonic()
            response = client.messages.create(
                model=MODEL,
                max_tokens=512,
                system=system_prompt,
                messages=[{"role": "user", "content": user_message}],
            )
            duration_ms = int((time.monotonic() - start_time) * 1000)

            suggestion_text = response.content[0].text

            log = AIAnalysisLog(
                request_id=expense.id,
                ai_role="WRITER",
                model_used=MODEL,
                input_tokens=response.usage.input_tokens,
                output_tokens=response.usage.output_tokens,
                response={"suggestion": suggestion_text},
                duration_ms=duration_ms,
                status="SUCCESS",
            )
            db.add(log)
            db.commit()

            return {"suggestion": suggestion_text}
        except Exception as e:
            logger.error(f"AI suggest comment error: {e}")
            return {"ai_skipped": True, "error": str(e)}


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
    expense.ai_summary = analysis.get("recommendation_reason") or analysis.get("summary")
    expense.ai_attention_points = analysis.get("attention_points")
    expense.ai_policy_violations = analysis.get("policy_violations")
    expense.ai_analyzed_at = datetime.now(timezone.utc)


def _handle_ai_skip(expense: ExpenseRequest, db: Session):
    log = AIAnalysisLog(
        request_id=expense.id,
        ai_role="ANALYST",
        model_used="skipped",
        status="SKIPPED",
        error_message="AI service unavailable",
    )
    db.add(log)
    expense.ai_skipped = True
    expense.ai_analyzed_at = datetime.now(timezone.utc)
    try:
        new_status = transition(expense.status, "ai_approved")
        expense.status = new_status
    except Exception:
        logger.warning(f"AI skip transition failed for request {expense.id}")
    db.commit()
