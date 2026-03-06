import uuid
from datetime import date as date_type
from typing import Optional

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, Field
from sqlalchemy import extract
from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.core.permissions import require_role
from app.dependencies import get_db
from app.models.corporate_calendar import CorporateCalendar

router = APIRouter()


class HolidayCreate(BaseModel):
    date: str = Field(..., description="Date in YYYY-MM-DD format")
    name: str = Field(..., min_length=2, max_length=255)
    type: str = Field(..., max_length=20)
    state_code: Optional[str] = None


class HolidayUpdate(BaseModel):
    date: Optional[str] = None
    name: Optional[str] = None
    type: Optional[str] = None
    state_code: Optional[str] = None


@router.get("", summary="List holidays")
async def list_holidays(
    year: Optional[int] = Query(None, description="Filter by year"),
    current_user=Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
):
    query = db.query(CorporateCalendar)
    if year:
        query = query.filter(extract("year", CorporateCalendar.date) == year)
    holidays = query.order_by(CorporateCalendar.date).all()
    return [
        {
            "id": str(h.id),
            "date": str(h.date),
            "name": h.name,
            "type": h.type,
            "state_code": h.state_code,
        }
        for h in holidays
    ]


@router.post("", status_code=201, summary="Create holiday")
async def create_holiday(
    data: HolidayCreate,
    current_user=Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
):
    parsed_date = date_type.fromisoformat(data.date)
    holiday = CorporateCalendar(
        id=uuid.uuid4(),
        date=parsed_date,
        name=data.name,
        type=data.type,
        state_code=data.state_code,
    )
    db.add(holiday)
    db.commit()
    return {"id": str(holiday.id), "name": holiday.name}


@router.patch("/{holiday_id}", summary="Update holiday")
async def update_holiday(
    holiday_id: str,
    data: HolidayUpdate,
    current_user=Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
):
    holiday = (
        db.query(CorporateCalendar)
        .filter(CorporateCalendar.id == uuid.UUID(holiday_id))
        .first()
    )
    if not holiday:
        raise NotFoundError("Holiday")

    for field, value in data.model_dump(exclude_unset=True).items():
        if value is not None:
            if field == "date":
                value = date_type.fromisoformat(value)
            setattr(holiday, field, value)

    db.commit()
    return {"id": str(holiday.id), "name": holiday.name, "status": "updated"}


@router.delete("/{holiday_id}", summary="Delete holiday")
async def delete_holiday(
    holiday_id: str,
    current_user=Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
):
    holiday = (
        db.query(CorporateCalendar)
        .filter(CorporateCalendar.id == uuid.UUID(holiday_id))
        .first()
    )
    if not holiday:
        raise NotFoundError("Holiday")

    db.delete(holiday)
    db.commit()
    return {"id": str(holiday.id), "status": "deleted"}
