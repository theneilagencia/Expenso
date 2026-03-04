import uuid
from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.core.permissions import require_role
from app.dependencies import get_db
from app.models.sla_config import SLAConfig

router = APIRouter()


class SLAUpdate(BaseModel):
    value: Optional[int] = None
    unit: Optional[str] = None
    reminder_1_pct: Optional[int] = None
    reminder_2_pct: Optional[int] = None
    escalation_action: Optional[str] = None
    business_start_hour: Optional[int] = None
    business_end_hour: Optional[int] = None
    is_active: Optional[bool] = None


@router.get("", summary="List SLA configurations")
async def list_sla(
    current_user=Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
):
    configs = db.query(SLAConfig).order_by(SLAConfig.stage).all()
    return [
        {
            "id": str(c.id), "stage": c.stage, "value": c.value, "unit": c.unit,
            "reminder_1_pct": c.reminder_1_pct, "reminder_2_pct": c.reminder_2_pct,
            "escalation_action": c.escalation_action, "is_active": c.is_active,
            "business_start_hour": c.business_start_hour, "business_end_hour": c.business_end_hour,
        }
        for c in configs
    ]


@router.patch("/{sla_id}", summary="Update SLA configuration")
async def update_sla(
    sla_id: str,
    data: SLAUpdate,
    current_user=Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
):
    config = db.query(SLAConfig).filter(SLAConfig.id == uuid.UUID(sla_id)).first()
    if not config:
        raise NotFoundError("SLA configuration")

    for field, value in data.model_dump(exclude_unset=True).items():
        if value is not None:
            setattr(config, field, value)

    db.commit()
    return {"id": str(config.id), "stage": config.stage, "status": "updated"}
