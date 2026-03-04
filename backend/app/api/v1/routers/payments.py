import uuid
from typing import Optional

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.dependencies import get_db
from app.core.security import get_current_user
from app.core.permissions import require_role
from app.core.exceptions import NotFoundError, ValidationError
from app.models.payment import Payment
from app.models.expense_request import ExpenseRequest
from app.services.request_service import RequestService

router = APIRouter()


class PaymentCreate(BaseModel):
    method: str
    notes: Optional[str] = None


@router.post("/{request_id}", status_code=201, summary="Process payment for request")
async def create_payment(
    request_id: str,
    data: PaymentCreate,
    http_request: Request,
    current_user=Depends(require_role("FINANCE", "ADMIN")),
    db: Session = Depends(get_db),
):
    req = db.query(ExpenseRequest).filter(
        ExpenseRequest.id == uuid.UUID(request_id),
        ExpenseRequest.deleted_at.is_(None),
    ).first()
    if not req:
        raise NotFoundError("Expense request")
    if req.status != "IN_PAYMENT":
        raise ValidationError("Request must be in IN_PAYMENT status to process payment")

    existing = db.query(Payment).filter(Payment.request_id == req.id).first()
    if existing:
        raise ValidationError("Payment already exists for this request")

    payment = Payment(
        id=uuid.uuid4(),
        request_id=req.id,
        processed_by=current_user.id,
        method=data.method,
        amount_paid=req.amount,
        currency_paid=req.currency,
        notes=data.notes,
    )
    db.add(payment)

    # Transition to PAID
    service = RequestService(db)
    service.perform_action(
        request_id=req.id,
        action="confirm_payment",
        actor_id=current_user.id,
        actor_role=current_user.role,
        ip_address=http_request.client.host,
        user_agent=http_request.headers.get("user-agent"),
    )

    return {"id": str(payment.id), "method": payment.method, "amount": payment.amount_paid, "status": "PAID"}


@router.get("", summary="List payments")
async def list_payments(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user=Depends(require_role("FINANCE", "ADMIN")),
    db: Session = Depends(get_db),
):
    query = db.query(Payment).order_by(Payment.created_at.desc())
    total = query.count()
    payments = query.offset((page - 1) * per_page).limit(per_page).all()
    return {
        "data": [
            {
                "id": str(p.id), "request_id": str(p.request_id),
                "method": p.method, "amount_paid": p.amount_paid,
                "currency_paid": p.currency_paid, "payment_date": p.payment_date.isoformat() if p.payment_date else None,
                "created_at": p.created_at.isoformat() if p.created_at else None,
            }
            for p in payments
        ],
        "total": total, "page": page, "per_page": per_page,
    }
