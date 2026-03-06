import io
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.core.permissions import require_role
from app.dependencies import get_db
from app.models.department import Department
from app.models.expense_category import ExpenseCategory
from app.models.expense_request import ExpenseRequest
from app.models.payment import Payment
from app.models.user import User

router = APIRouter()


@router.get("/erp-export", summary="Export payments for ERP integration")
async def erp_export(
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
    current_user=Depends(require_role("ADMIN", "FINANCE")),
    db: Session = Depends(get_db),
):
    import openpyxl

    query = (
        db.query(Payment, ExpenseRequest, ExpenseCategory, Department, User)
        .join(ExpenseRequest, Payment.request_id == ExpenseRequest.id)
        .outerjoin(ExpenseCategory, ExpenseRequest.category_id == ExpenseCategory.id)
        .outerjoin(User, ExpenseRequest.employee_id == User.id)
        .outerjoin(Department, User.department_id == Department.id)
        .filter(Payment.revolut_status == "PAID")
        .order_by(Payment.payment_date.desc())
    )

    if date_from:
        query = query.filter(Payment.payment_date >= datetime.fromisoformat(date_from))
    if date_to:
        query = query.filter(Payment.payment_date <= datetime.fromisoformat(date_to))

    rows = query.limit(10000).all()

    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "ERP Export"
    headers = [
        "request_id", "date", "category", "accounting_code",
        "amount_brl", "cost_center", "department",
    ]
    ws.append(headers)

    for payment, req, category, dept, employee in rows:
        ws.append([
            str(req.id) if req else "",
            payment.payment_date.strftime("%Y-%m-%d") if payment.payment_date else "",
            category.name if category else "",
            category.accounting_code if category else "",
            req.amount_brl if req and req.amount_brl else (req.amount if req else 0),
            dept.code if dept else "",
            dept.name if dept else "",
        ])

    output = io.BytesIO()
    wb.save(output)
    output.seek(0)

    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=erp_export.xlsx"},
    )
