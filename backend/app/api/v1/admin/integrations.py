import uuid
from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

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


@router.post("", status_code=201, summary="Create integration")
async def create_integration(
    data: IntegrationCreate,
    current_user=Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
):
    integration = Integration(id=uuid.uuid4(), **data.model_dump())
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

    for field, value in data.model_dump(exclude_unset=True).items():
        if value is not None:
            setattr(integration, field, value)

    db.commit()
    return {"id": str(integration.id), "status": "updated"}
