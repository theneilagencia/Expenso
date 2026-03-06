import uuid
from datetime import datetime, timezone
from typing import Optional

import httpx
from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.core.permissions import require_role
from app.dependencies import get_db
from app.models.webhook_config import WebhookConfig

router = APIRouter()


class WebhookCreate(BaseModel):
    url: str = Field(..., min_length=10, max_length=500)
    events: list[str] = Field(..., min_length=1)
    secret: Optional[str] = None
    is_active: bool = True


class WebhookUpdate(BaseModel):
    url: Optional[str] = None
    events: Optional[list[str]] = None
    secret: Optional[str] = None
    is_active: Optional[bool] = None


def _serialize_webhook(wh: WebhookConfig) -> dict:
    return {
        "id": str(wh.id),
        "url": wh.url,
        "events": wh.events,
        "is_active": wh.is_active,
        "created_by": str(wh.created_by) if wh.created_by else None,
        "created_at": wh.created_at.isoformat() if wh.created_at else None,
        "updated_at": wh.updated_at.isoformat() if wh.updated_at else None,
    }


@router.get("", summary="List active webhooks")
async def list_webhooks(
    current_user=Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
):
    webhooks = db.query(WebhookConfig).filter(
        WebhookConfig.deleted_at.is_(None),
    ).order_by(WebhookConfig.created_at.desc()).all()
    return [_serialize_webhook(wh) for wh in webhooks]


@router.post("", status_code=201, summary="Create webhook")
async def create_webhook(
    data: WebhookCreate,
    current_user=Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
):
    wh = WebhookConfig(
        id=uuid.uuid4(),
        url=data.url,
        events=data.events,
        secret=data.secret,
        is_active=data.is_active,
        created_by=current_user.id,
    )
    db.add(wh)
    db.commit()
    return _serialize_webhook(wh)


@router.patch("/{webhook_id}", summary="Update webhook")
async def update_webhook(
    webhook_id: str,
    data: WebhookUpdate,
    current_user=Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
):
    wh = db.query(WebhookConfig).filter(
        WebhookConfig.id == uuid.UUID(webhook_id),
        WebhookConfig.deleted_at.is_(None),
    ).first()
    if not wh:
        raise NotFoundError("Webhook")

    for field, value in data.model_dump(exclude_unset=True).items():
        if value is not None:
            setattr(wh, field, value)

    db.commit()
    return _serialize_webhook(wh)


@router.delete("/{webhook_id}", summary="Soft delete webhook")
async def delete_webhook(
    webhook_id: str,
    current_user=Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
):
    wh = db.query(WebhookConfig).filter(
        WebhookConfig.id == uuid.UUID(webhook_id),
        WebhookConfig.deleted_at.is_(None),
    ).first()
    if not wh:
        raise NotFoundError("Webhook")

    wh.deleted_at = datetime.now(timezone.utc)
    wh.is_active = False
    db.commit()
    return {"id": str(wh.id), "status": "deleted"}


@router.post("/{webhook_id}/test", summary="Send test ping to webhook URL")
async def test_webhook(
    webhook_id: str,
    current_user=Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
):
    wh = db.query(WebhookConfig).filter(
        WebhookConfig.id == uuid.UUID(webhook_id),
        WebhookConfig.deleted_at.is_(None),
    ).first()
    if not wh:
        raise NotFoundError("Webhook")

    payload = {"event": "webhook.test", "data": {"message": "Test ping from Expenso"}}
    try:
        with httpx.Client(timeout=10) as client:
            response = client.post(
                wh.url,
                json=payload,
                headers={"Content-Type": "application/json", "X-Webhook-Event": "webhook.test"},
            )
        return {
            "id": str(wh.id),
            "url": wh.url,
            "status_code": response.status_code,
            "success": 200 <= response.status_code < 300,
        }
    except httpx.RequestError as e:
        return {
            "id": str(wh.id),
            "url": wh.url,
            "status_code": None,
            "success": False,
            "error": str(e),
        }
