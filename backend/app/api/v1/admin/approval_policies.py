import uuid
from typing import Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.core.permissions import require_role
from app.dependencies import get_db
from app.models.approval_policy import ApprovalPolicy

router = APIRouter()


class PolicyCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    min_amount: Optional[float] = None
    max_amount: Optional[float] = None
    department_id: Optional[str] = None
    approval_flow: Optional[dict] = None
    is_active: bool = True


class PolicyUpdate(BaseModel):
    name: Optional[str] = None
    min_amount: Optional[float] = None
    max_amount: Optional[float] = None
    department_id: Optional[str] = None
    approval_flow: Optional[dict] = None
    is_active: Optional[bool] = None


@router.get("", summary="List approval policies")
async def list_policies(
    current_user=Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
):
    policies = (
        db.query(ApprovalPolicy)
        .filter(ApprovalPolicy.deleted_at.is_(None))
        .order_by(ApprovalPolicy.sort_order)
        .all()
    )
    return [
        {
            "id": str(p.id),
            "name": p.name,
            "min_amount": p.min_amount,
            "max_amount": p.max_amount,
            "department_id": str(p.department_id) if p.department_id else None,
            "approval_flow": p.approval_flow,
            "is_active": p.is_active,
            "sort_order": p.sort_order,
        }
        for p in policies
    ]


@router.post("", status_code=201, summary="Create approval policy")
async def create_policy(
    data: PolicyCreate,
    current_user=Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
):
    dump = data.model_dump()
    if dump.get("department_id"):
        dump["department_id"] = uuid.UUID(dump["department_id"])
    policy = ApprovalPolicy(id=uuid.uuid4(), **dump)
    db.add(policy)
    db.commit()
    return {"id": str(policy.id), "name": policy.name}


@router.patch("/{policy_id}", summary="Update approval policy")
async def update_policy(
    policy_id: str,
    data: PolicyUpdate,
    current_user=Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
):
    policy = (
        db.query(ApprovalPolicy)
        .filter(
            ApprovalPolicy.id == uuid.UUID(policy_id),
            ApprovalPolicy.deleted_at.is_(None),
        )
        .first()
    )
    if not policy:
        raise NotFoundError("Approval Policy")

    for field, value in data.model_dump(exclude_unset=True).items():
        if value is not None:
            if field == "department_id":
                value = uuid.UUID(value)
            setattr(policy, field, value)

    db.commit()
    return {"id": str(policy.id), "name": policy.name, "status": "updated"}


@router.delete("/{policy_id}", summary="Soft delete approval policy")
async def delete_policy(
    policy_id: str,
    current_user=Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
):
    from datetime import datetime, timezone

    policy = (
        db.query(ApprovalPolicy)
        .filter(
            ApprovalPolicy.id == uuid.UUID(policy_id),
            ApprovalPolicy.deleted_at.is_(None),
        )
        .first()
    )
    if not policy:
        raise NotFoundError("Approval Policy")

    policy.deleted_at = datetime.now(timezone.utc)
    policy.is_active = False
    db.commit()
    return {"id": str(policy.id), "status": "deleted"}
