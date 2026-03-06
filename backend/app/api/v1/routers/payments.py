import uuid
from typing import Optional

from fastapi import APIRouter, Depends, Query, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError, ValidationError
from app.core.permissions import require_role
from app.dependencies import get_db
from app.models.payment import Payment
from app.services.payment_service import PaymentService

router = APIRouter()


class PaymentCreate(BaseModel):
    method: str
    notes: Optional[str] = None


@router.post("/{request_id}", status_code=201, summary="Process payment for request")
async def create_payment(
    request_id: str,
    data: PaymentCreate,
    current_user=Depends(require_role("FINANCE", "ADMIN")),
    db: Session = Depends(get_db),
):
    service = PaymentService(db)
    payment = service.initiate_payment(
        request_id=uuid.UUID(request_id),
        processed_by=current_user.id,
        method=data.method,
        notes=data.notes,
    )
    return {
        "id": str(payment.id),
        "method": payment.method,
        "amount": payment.amount_paid,
        "status": payment.revolut_status or "PROCESSING",
    }


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
                "currency_paid": p.currency_paid,
                "status": p.revolut_status,
                "payment_date": p.payment_date.isoformat() if p.payment_date else None,
                "created_at": p.created_at.isoformat() if p.created_at else None,
            }
            for p in payments
        ],
        "total": total, "page": page, "per_page": per_page,
    }


@router.get("/{payment_id}/status", summary="Check payment status")
async def get_payment_status(
    payment_id: str,
    current_user=Depends(require_role("FINANCE", "ADMIN")),
    db: Session = Depends(get_db),
):
    payment = db.query(Payment).filter(Payment.id == uuid.UUID(payment_id)).first()
    if not payment:
        raise NotFoundError("Payment")
    return {
        "id": str(payment.id),
        "status": payment.revolut_status,
        "provider_id": payment.revolut_payment_id,
        "retry_count": payment.retry_count,
        "last_error": payment.last_error,
        "payment_date": payment.payment_date.isoformat() if payment.payment_date else None,
    }


@router.post("/{payment_id}/retry", summary="Manually retry a failed payment")
async def retry_payment(
    payment_id: str,
    current_user=Depends(require_role("FINANCE", "ADMIN")),
    db: Session = Depends(get_db),
):
    payment = db.query(Payment).filter(Payment.id == uuid.UUID(payment_id)).first()
    if not payment:
        raise NotFoundError("Payment")
    if payment.revolut_status != "FAILED":
        raise ValidationError("Only failed payments can be retried")

    from app.workers.tasks.payment_tasks import process_payment
    process_payment.delay(str(payment.id))
    return {"message": "Payment retry dispatched", "payment_id": str(payment.id)}


@router.post("/webhook/{provider}", summary="Payment provider webhook")
async def payment_webhook(
    provider: str,
    request: Request,
    db: Session = Depends(get_db),
):
    """Public webhook endpoint for payment provider callbacks (no auth required)."""
    body = await request.json()
    provider_id = body.get("id") or body.get("payment_id")
    status = body.get("state") or body.get("status")

    if not provider_id:
        return {"error": "Missing provider payment ID"}

    payment = db.query(Payment).filter(
        Payment.revolut_payment_id == provider_id
    ).first()
    if not payment:
        return {"error": "Payment not found", "provider_id": provider_id}

    payment.revolut_status = status
    payment.revolut_raw_response = body
    db.commit()

    return {"status": "ok", "payment_id": str(payment.id), "new_status": status}
