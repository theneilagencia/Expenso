import uuid
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from app.dependencies import get_db
from app.core.permissions import require_role
from app.core.exceptions import NotFoundError
from app.models.expense_category import ExpenseCategory

router = APIRouter()


class CategoryCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    icon: Optional[str] = None
    limit_per_request: Optional[float] = None
    limit_per_month: Optional[float] = None
    max_days_to_submit: int = 90
    receipt_required_above: Optional[float] = None
    min_justification_chars: int = 20
    ai_attention_score: int = 50
    tax_deductibility_pct: Optional[float] = None


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    icon: Optional[str] = None
    limit_per_request: Optional[float] = None
    limit_per_month: Optional[float] = None
    max_days_to_submit: Optional[int] = None
    min_justification_chars: Optional[int] = None
    ai_attention_score: Optional[int] = None
    is_active: Optional[bool] = None


@router.get("", summary="List categories")
async def list_categories(
    current_user=Depends(require_role("ADMIN", "FINANCE")),
    db: Session = Depends(get_db),
):
    cats = db.query(ExpenseCategory).filter(ExpenseCategory.deleted_at.is_(None)).order_by(ExpenseCategory.sort_order).all()
    return [
        {
            "id": str(c.id), "name": c.name, "icon": c.icon,
            "limit_per_request": c.limit_per_request, "limit_per_month": c.limit_per_month,
            "max_days_to_submit": c.max_days_to_submit, "ai_attention_score": c.ai_attention_score,
            "is_active": c.is_active, "sort_order": c.sort_order,
        }
        for c in cats
    ]


@router.post("", status_code=201, summary="Create category")
async def create_category(
    data: CategoryCreate,
    current_user=Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
):
    cat = ExpenseCategory(id=uuid.uuid4(), **data.model_dump())
    db.add(cat)
    db.commit()
    return {"id": str(cat.id), "name": cat.name}


@router.patch("/{category_id}", summary="Update category")
async def update_category(
    category_id: str,
    data: CategoryUpdate,
    current_user=Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
):
    cat = db.query(ExpenseCategory).filter(
        ExpenseCategory.id == uuid.UUID(category_id),
        ExpenseCategory.deleted_at.is_(None),
    ).first()
    if not cat:
        raise NotFoundError("Category")

    for field, value in data.model_dump(exclude_unset=True).items():
        if value is not None:
            setattr(cat, field, value)

    db.commit()
    return {"id": str(cat.id), "name": cat.name, "status": "updated"}


@router.delete("/{category_id}", summary="Soft delete category")
async def delete_category(
    category_id: str,
    current_user=Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
):
    from datetime import datetime, timezone
    cat = db.query(ExpenseCategory).filter(
        ExpenseCategory.id == uuid.UUID(category_id),
        ExpenseCategory.deleted_at.is_(None),
    ).first()
    if not cat:
        raise NotFoundError("Category")

    cat.deleted_at = datetime.now(timezone.utc)
    cat.is_active = False
    db.commit()
    return {"id": str(cat.id), "status": "deleted"}
