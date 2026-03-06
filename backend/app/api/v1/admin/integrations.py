import uuid
from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.encryption import decrypt_config, encrypt_config
from app.core.exceptions import NotFoundError
from app.core.permissions import require_role
from app.dependencies import get_db
from app.models.integration import Integration

router = APIRouter()


class IntegrationCreate(BaseModel):
    type: str
    name: str
    config: Optional[dict] = None
    is_active: bool = False


class IntegrationUpdate(BaseModel):
    name: Optional[str] = None
    config: Optional[dict] = None
    is_active: Optional[bool] = None


@router.get("", summary="List integrations")
async def list_integrations(
    current_user=Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
):
    integrations = db.query(Integration).order_by(Integration.type).all()
    return [
        {
            "id": str(i.id), "type": i.type, "name": i.name,
            "is_active": i.is_active, "last_sync_at": i.last_sync_at.isoformat() if i.last_sync_at else None,
            "last_error": i.last_error,
        }
        for i in integrations
    ]


@router.get("/{integration_id}", summary="Get integration detail (with decrypted config)")
async def get_integration(
    integration_id: str,
    current_user=Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
):
    integration = db.query(Integration).filter(Integration.id == uuid.UUID(integration_id)).first()
    if not integration:
        raise NotFoundError("Integration")
    return {
        "id": str(integration.id),
        "type": integration.type,
        "name": integration.name,
        "config": decrypt_config(integration.config),
        "is_active": integration.is_active,
        "last_sync_at": integration.last_sync_at.isoformat() if integration.last_sync_at else None,
        "last_error": integration.last_error,
    }


@router.post("", status_code=201, summary="Create integration")
async def create_integration(
    data: IntegrationCreate,
    current_user=Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
):
    create_data = data.model_dump()
    # Encrypt config before storing
    if create_data.get("config"):
        create_data["config"] = encrypt_config(create_data["config"])
    integration = Integration(id=uuid.uuid4(), **create_data)
    db.add(integration)
    db.commit()
    return {"id": str(integration.id), "type": integration.type, "name": integration.name}


@router.patch("/{integration_id}", summary="Update integration")
async def update_integration(
    integration_id: str,
    data: IntegrationUpdate,
    current_user=Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
):
    integration = db.query(Integration).filter(Integration.id == uuid.UUID(integration_id)).first()
    if not integration:
        raise NotFoundError("Integration")

    update_data = data.model_dump(exclude_unset=True)
    # Encrypt config before storing
    if "config" in update_data and update_data["config"] is not None:
        update_data["config"] = encrypt_config(update_data["config"])

    for field, value in update_data.items():
        if value is not None:
            setattr(integration, field, value)

    db.commit()
    return {"id": str(integration.id), "status": "updated"}
