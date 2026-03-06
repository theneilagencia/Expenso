from datetime import datetime, timedelta, timezone
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy import Date, cast, func
from sqlalchemy.orm import Session

from app.core.permissions import require_role
from app.core.security import get_current_user
from app.dependencies import get_db
from app.models.ai_analysis_log import AIAnalysisLog
from app.models.expense_category import ExpenseCategory
from app.services.ai_service import AIService

router = APIRouter()


class ChatRequest(BaseModel):
    messages: list[dict]


class SuggestCommentRequest(BaseModel):
    request_id: UUID
    action: str  # "approve", "reject", "request_edit"


@router.get("/assist/{request_id}/stream")
async def stream_assistance(
    request_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    locale = current_user.locale or "en-US"
    return StreamingResponse(
        AIService.stream_assistance(request_id, db, locale),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/assist/stream")
async def stream_assistance_draft(
    description: str = Query(""),
    justification: str = Query(""),
    category_id: Optional[str] = Query(None),
    amount: Optional[float] = Query(None),
    expense_date: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """SSE assistance for draft forms (unsaved). Uses query params."""
    locale = current_user.locale or "en-US"

    category_data = None
    if category_id:
        category = db.query(ExpenseCategory).filter(
            ExpenseCategory.id == category_id
        ).first()
        if category:
            category_data = {
                "name": category.name,
                "limit_per_request": str(category.limit_per_request) if category.limit_per_request else None,
                "min_justification_chars": category.min_justification_chars,
                "requires_strong_just": category.requires_strong_just,
            }

    request_data = {
        "description": description,
        "justification": justification,
        "amount": str(amount) if amount else "N/A",
        "expense_date": expense_date or "N/A",
    }

    return StreamingResponse(
        AIService.stream_assistance_draft(request_data, category_data, locale),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/analysis/{request_id}")
async def get_analysis(
    request_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = AIService.get_analysis(request_id, db)
    if not result:
        return {"message": "No analysis available"}
    return result


@router.post("/analysis/{request_id}")
async def trigger_analysis(
    request_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    result = AIService.analyze_request(request_id, db)
    if not result:
        return {"message": "Analysis failed"}
    return result


@router.post("/chat/stream")
async def stream_chat(
    body: ChatRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    locale = current_user.locale or "en-US"
    return StreamingResponse(
        AIService.stream_chat(
            body.messages, locale,
            user_role=current_user.role,
            user_id=current_user.id,
            db=db,
        ),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.post("/suggest-comment")
async def suggest_comment(
    body: SuggestCommentRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Suggest an approval/rejection comment using AI Writer."""
    locale = current_user.locale or "en-US"
    result = AIService.suggest_comment(body.request_id, body.action, db, locale)
    if not result:
        return {"message": "Suggestion failed"}
    return result


@router.get("/strategist/report")
async def get_strategist_report(
    db: Session = Depends(get_db),
    current_user=Depends(require_role("MANAGER", "FINANCE", "ADMIN")),
):
    log = (
        db.query(AIAnalysisLog)
        .filter(
            AIAnalysisLog.ai_role == "STRATEGIST",
            AIAnalysisLog.status == "SUCCESS",
        )
        .order_by(AIAnalysisLog.created_at.desc())
        .first()
    )
    if not log:
        return {"message": "No report available"}
    return {
        "id": str(log.id),
        "report": log.response,
        "model_used": log.model_used,
        "created_at": log.created_at.isoformat() if log.created_at else None,
    }


@router.get("/admin/ai-usage")
async def get_ai_usage(
    days: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user=Depends(require_role("ADMIN")),
):
    """AI usage statistics for admin dashboard."""
    since = datetime.now(timezone.utc) - timedelta(days=days)

    logs = db.query(AIAnalysisLog).filter(AIAnalysisLog.created_at >= since).all()

    # Aggregate by role
    by_role = {}
    for log in logs:
        role = log.ai_role or "UNKNOWN"
        if role not in by_role:
            by_role[role] = {
                "input_tokens": 0, "output_tokens": 0,
                "count": 0, "errors": 0, "skipped": 0,
            }
        by_role[role]["input_tokens"] += log.input_tokens or 0
        by_role[role]["output_tokens"] += log.output_tokens or 0
        by_role[role]["count"] += 1
        if log.status == "ERROR":
            by_role[role]["errors"] += 1
        if log.status == "SKIPPED":
            by_role[role]["skipped"] += 1

    # Cost estimation ($3/1M input, $15/1M output for claude-sonnet-4)
    total_input = sum(r["input_tokens"] for r in by_role.values())
    total_output = sum(r["output_tokens"] for r in by_role.values())
    estimated_cost = (total_input / 1_000_000 * 3) + (total_output / 1_000_000 * 15)

    # Avg latency
    durations = [log.duration_ms for log in logs if log.duration_ms]
    avg_latency_ms = sum(durations) / len(durations) if durations else 0

    # Success/error/skipped rates
    total = len(logs)
    success_count = sum(1 for log in logs if log.status == "SUCCESS")
    error_count = sum(1 for log in logs if log.status == "ERROR")
    skipped_count = sum(1 for log in logs if log.status == "SKIPPED")

    # Time series
    time_series = (
        db.query(
            cast(AIAnalysisLog.created_at, Date).label("date"),
            func.count(AIAnalysisLog.id).label("count"),
            func.sum(AIAnalysisLog.input_tokens).label("input_tokens"),
            func.sum(AIAnalysisLog.output_tokens).label("output_tokens"),
        )
        .filter(AIAnalysisLog.created_at >= since)
        .group_by(cast(AIAnalysisLog.created_at, Date))
        .order_by(cast(AIAnalysisLog.created_at, Date))
        .all()
    )

    return {
        "period_days": days,
        "total_calls": total,
        "by_role": by_role,
        "total_input_tokens": total_input,
        "total_output_tokens": total_output,
        "estimated_cost_usd": round(estimated_cost, 4),
        "avg_latency_ms": round(avg_latency_ms, 1),
        "success_rate": round(success_count / total * 100, 1) if total else 0,
        "error_rate": round(error_count / total * 100, 1) if total else 0,
        "skipped_rate": round(skipped_count / total * 100, 1) if total else 0,
        "time_series": [
            {
                "date": str(ts.date),
                "count": ts.count,
                "input_tokens": int(ts.input_tokens or 0),
                "output_tokens": int(ts.output_tokens or 0),
            }
            for ts in time_series
        ],
    }
