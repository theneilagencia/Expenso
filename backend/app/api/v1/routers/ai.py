from uuid import UUID

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.core.security import get_current_user
from app.services.ai_service import AIService

router = APIRouter()


class ChatRequest(BaseModel):
    messages: list[dict]


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
    current_user=Depends(get_current_user),
):
    locale = current_user.locale or "en-US"
    return StreamingResponse(
        AIService.stream_chat(body.messages, locale),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
