import io
import logging
import uuid
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, Query, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.config import settings
from app.core.exceptions import NotFoundError, ValidationError
from app.core.permissions import require_role
from app.dependencies import get_db
from app.models.department import Department
from app.models.expense_category import ExpenseCategory
from app.models.expense_request import ExpenseRequest
from app.models.payment import Payment
from app.models.user import User
from app.services.payment_service import PaymentService

logger = logging.getLogger(__name__)
router = APIRouter()


class PaymentCreate(BaseModel):
    method: str
    notes: Optional[str] = None


class BatchPaymentCreate(BaseModel):
    request_ids: list[str]
    method: str
    scheduled_date: Optional[str] = None


@router.post("/batch", status_code=200, summary="Batch process payments")
async def batch_payments(
    data: BatchPaymentCreate,
    current_user=Depends(require_role("FINANCE", "ADMIN")),
    db: Session = Depends(get_db),
):
    if not data.request_ids:
        raise ValidationError("request_ids cannot be empty")

    service = PaymentService(db)
    result = service.batch_process(
        request_ids=data.request_ids,
        processed_by=current_user.id,
        method=data.method,
        scheduled_date=data.scheduled_date,
    )
    return result


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
    status: Optional[str] = Query(None),
    method: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    employee_id: Optional[str] = Query(None),
    current_user=Depends(require_role("FINANCE", "ADMIN")),
    db: Session = Depends(get_db),
):
    query = db.query(Payment).order_by(Payment.created_at.desc())

    if status:
        query = query.filter(Payment.revolut_status == status)
    if method:
        query = query.filter(Payment.method == method)
    if date_from:
        query = query.filter(Payment.created_at >= datetime.fromisoformat(date_from))
    if date_to:
        query = query.filter(Payment.created_at <= datetime.fromisoformat(date_to))
    if employee_id:
        query = query.join(ExpenseRequest, Payment.request_id == ExpenseRequest.id).filter(
            ExpenseRequest.employee_id == employee_id
        )

    total = query.count()
    payments = query.offset((page - 1) * per_page).limit(per_page).all()

    # Enrich with request/employee data
    data = []
    for p in payments:
        req = db.query(ExpenseRequest).filter(ExpenseRequest.id == p.request_id).first()
        employee = None
        dept_name = None
        cat_name = None
        if req:
            employee = db.query(User).filter(User.id == req.employee_id).first()
            cat = db.query(ExpenseCategory).filter(ExpenseCategory.id == req.category_id).first()
            cat_name = cat.name if cat else None
            if employee:
                dept = db.query(Department).filter(Department.id == employee.department_id).first()
                dept_name = dept.name if dept else None

        data.append({
            "id": str(p.id),
            "request_id": str(p.request_id),
            "request_title": req.title if req else None,
            "requester_name": employee.full_name if employee else None,
            "department": dept_name,
            "category": cat_name,
            "method": p.method,
            "amount_paid": p.amount_paid,
            "currency_paid": p.currency_paid,
            "status": p.revolut_status,
            "last_error": p.last_error,
            "retry_count": p.retry_count,
            "payment_date": p.payment_date.isoformat() if p.payment_date else None,
            "created_at": p.created_at.isoformat() if p.created_at else None,
        })

    return {"data": data, "total": total, "page": page, "per_page": per_page}


@router.get("/export/xlsx", summary="Export payments as XLSX")
async def export_xlsx(
    status: Optional[str] = Query(None),
    method: Optional[str] = Query(None),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    current_user=Depends(require_role("FINANCE", "ADMIN")),
    db: Session = Depends(get_db),
):
    import openpyxl

    query = (
        db.query(Payment, ExpenseRequest, User)
        .outerjoin(ExpenseRequest, Payment.request_id == ExpenseRequest.id)
        .outerjoin(User, ExpenseRequest.employee_id == User.id)
        .order_by(Payment.created_at.desc())
    )
    if status:
        query = query.filter(Payment.revolut_status == status)
    if method:
        query = query.filter(Payment.method == method)
    if date_from:
        query = query.filter(Payment.created_at >= datetime.fromisoformat(date_from))
    if date_to:
        query = query.filter(Payment.created_at <= datetime.fromisoformat(date_to))

    rows = query.limit(5000).all()

    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Payments"
    headers = [
        "Payment ID", "Request Title", "Employee", "Method",
        "Amount", "Currency", "Status", "Error",
        "Retry Count", "Payment Date", "Created At",
    ]
    ws.append(headers)

    for payment, req, employee in rows:
        ws.append([
            str(payment.id),
            req.title if req else "",
            employee.full_name if employee else "",
            payment.method,
            payment.amount_paid,
            payment.currency_paid,
            payment.revolut_status,
            payment.last_error or "",
            payment.retry_count or 0,
            payment.payment_date.isoformat() if payment.payment_date else "",
            payment.created_at.isoformat() if payment.created_at else "",
        ])

    output = io.BytesIO()
    wb.save(output)
    output.seek(0)

    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=payments_export.xlsx"},
    )


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
    body_bytes = await request.body()

    # HMAC-SHA256 signature validation for Revolut
    if provider == "revolut":
        webhook_secret = getattr(settings, "REVOLUT_WEBHOOK_SECRET", "")
        if webhook_secret:
            signature = request.headers.get("Revolut-Signature", "")
            if not signature:
                return {"error": "Missing webhook signature"}
            try:
                from app.integrations.revolut.webhooks import validate_webhook_signature
                validate_webhook_signature(body_bytes, signature, webhook_secret)
            except ValueError:
                return {"error": "Invalid webhook signature"}

    import json
    body = json.loads(body_bytes)

    provider_id = body.get("id") or body.get("payment_id")
    state = body.get("state") or body.get("status")

    if not provider_id:
        return {"error": "Missing provider payment ID"}

    payment = db.query(Payment).filter(
        Payment.revolut_payment_id == provider_id
    ).first()
    if not payment:
        return {"error": "Payment not found", "provider_id": provider_id}

    payment.revolut_raw_response = body

    if state == "completed":
        payment.revolut_status = "completed"
        payment.payment_date = datetime.utcnow()

        # Transition expense request to PAID
        try:
            from app.services.request_service import RequestService
            service = RequestService(db)
            service.perform_action(
                request_id=payment.request_id,
                action="confirm_payment",
                actor_id=payment.processed_by,
                actor_role="SYSTEM",
            )
        except Exception as e:
            logger.warning(f"Webhook: failed to confirm payment {payment.id}: {e}")

    elif state in ("failed", "declined", "reverted", "cancelled"):
        payment.revolut_status = "FAILED"
        payment.last_error = f"Webhook: payment {state}"
        payment.retry_count = (payment.retry_count or 0) + 1
        max_retries = getattr(settings, "PAYMENT_MAX_RETRIES", 3)
        if payment.retry_count < max_retries:
            from datetime import timedelta
            delay_min = getattr(settings, "PAYMENT_RETRY_DELAY_MINUTES", 15)
            payment.next_retry_at = datetime.utcnow() + timedelta(minutes=delay_min)
    else:
        payment.revolut_status = state

    db.commit()
    return {"status": "ok", "payment_id": str(payment.id), "new_status": payment.revolut_status}
