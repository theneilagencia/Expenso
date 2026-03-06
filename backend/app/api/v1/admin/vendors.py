import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.core.permissions import require_role
from app.dependencies import get_db
from app.models.vendor_list import VendorList

router = APIRouter()


class VendorCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    document: Optional[str] = None
    list_type: str = Field(..., description="WHITELIST or BLACKLIST")
    category_id: Optional[str] = None
    reason: Optional[str] = None
    valid_from: Optional[str] = None
    valid_until: Optional[str] = None


class VendorUpdate(BaseModel):
    name: Optional[str] = None
    document: Optional[str] = None
    list_type: Optional[str] = None
    category_id: Optional[str] = None
    reason: Optional[str] = None
    valid_from: Optional[str] = None
    valid_until: Optional[str] = None


@router.get("", summary="List vendors")
async def list_vendors(
    list_type: Optional[str] = Query(None, description="WHITELIST or BLACKLIST"),
    category_id: Optional[str] = Query(None, description="Filter by category"),
    current_user=Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
):
    query = db.query(VendorList).filter(VendorList.deleted_at.is_(None))
    if list_type:
        query = query.filter(VendorList.list_type == list_type)
    if category_id:
        query = query.filter(VendorList.category_id == uuid.UUID(category_id))
    vendors = query.order_by(VendorList.created_at.desc()).all()
    return [
        {
            "id": str(v.id),
            "name": v.name,
            "document": v.document,
            "list_type": v.list_type,
            "category_id": str(v.category_id) if v.category_id else None,
            "reason": v.reason,
            "valid_from": str(v.valid_from) if v.valid_from else None,
            "valid_until": str(v.valid_until) if v.valid_until else None,
            "created_by": str(v.created_by) if v.created_by else None,
        }
        for v in vendors
    ]


@router.post("", status_code=201, summary="Create vendor entry")
async def create_vendor(
    data: VendorCreate,
    current_user=Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
):
    dump = data.model_dump()

    # Convert UUID strings
    if dump.get("category_id"):
        dump["category_id"] = uuid.UUID(dump["category_id"])

    # Convert date strings to datetime
    if dump.get("valid_from"):
        dump["valid_from"] = datetime.fromisoformat(dump["valid_from"])
    if dump.get("valid_until"):
        dump["valid_until"] = datetime.fromisoformat(dump["valid_until"])

    vendor = VendorList(id=uuid.uuid4(), created_by=current_user.id, **dump)
    db.add(vendor)
    db.commit()
    return {"id": str(vendor.id), "name": vendor.name}


@router.patch("/{vendor_id}", summary="Update vendor")
async def update_vendor(
    vendor_id: str,
    data: VendorUpdate,
    current_user=Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
):
    vendor = (
        db.query(VendorList)
        .filter(
            VendorList.id == uuid.UUID(vendor_id),
            VendorList.deleted_at.is_(None),
        )
        .first()
    )
    if not vendor:
        raise NotFoundError("Vendor")

    for field, value in data.model_dump(exclude_unset=True).items():
        if value is not None:
            if field == "category_id":
                value = uuid.UUID(value)
            elif field in ("valid_from", "valid_until"):
                value = datetime.fromisoformat(value)
            setattr(vendor, field, value)

    db.commit()
    return {"id": str(vendor.id), "name": vendor.name, "status": "updated"}


@router.delete("/{vendor_id}", summary="Soft delete vendor")
async def delete_vendor(
    vendor_id: str,
    current_user=Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
):
    vendor = (
        db.query(VendorList)
        .filter(
            VendorList.id == uuid.UUID(vendor_id),
            VendorList.deleted_at.is_(None),
        )
        .first()
    )
    if not vendor:
        raise NotFoundError("Vendor")

    vendor.deleted_at = datetime.now(timezone.utc)
    db.commit()
    return {"id": str(vendor.id), "status": "deleted"}
