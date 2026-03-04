import csv
import io
from datetime import datetime

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import extract, func
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.dependencies import get_db
from app.models.department import Department
from app.models.expense_category import ExpenseCategory
from app.models.expense_request import ExpenseRequest
from app.models.user import User

router = APIRouter()


def _base_query(db: Session, date_from=None, date_to=None, department_id=None):
    q = db.query(ExpenseRequest).filter(ExpenseRequest.deleted_at.is_(None))
    if date_from:
        q = q.filter(ExpenseRequest.created_at >= datetime.fromisoformat(date_from))
    if date_to:
        q = q.filter(ExpenseRequest.created_at <= datetime.fromisoformat(date_to))
    if department_id:
        q = q.join(User, ExpenseRequest.employee_id == User.id).filter(
            User.department_id == department_id
        )
    return q


@router.get("/dashboard")
def get_dashboard(
    date_from: str = Query(None),
    date_to: str = Query(None),
    department_id: str = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    q = _base_query(db, date_from, date_to, department_id)

    total_requests = q.count()
    total_amount = q.with_entities(func.coalesce(func.sum(ExpenseRequest.amount), 0)).scalar()
    avg_amount = q.with_entities(func.coalesce(func.avg(ExpenseRequest.amount), 0)).scalar()

    status_counts = (
        q.with_entities(ExpenseRequest.status, func.count())
        .group_by(ExpenseRequest.status)
        .all()
    )

    paid_q = q.filter(ExpenseRequest.status == "PAID")
    total_paid = paid_q.with_entities(func.coalesce(func.sum(ExpenseRequest.amount), 0)).scalar()

    pending_q = q.filter(
        ExpenseRequest.status.in_(["PENDING_MANAGER", "PENDING_FINANCE", "PENDING_AI"])
    )
    total_pending = pending_q.with_entities(func.coalesce(func.sum(ExpenseRequest.amount), 0)).scalar()

    avg_risk = q.filter(ExpenseRequest.ai_risk_score.isnot(None)).with_entities(
        func.coalesce(func.avg(ExpenseRequest.ai_risk_score), 0)
    ).scalar()

    return {
        "total_requests": total_requests,
        "total_amount": float(total_amount),
        "average_amount": round(float(avg_amount), 2),
        "total_paid": float(total_paid),
        "total_pending": float(total_pending),
        "average_risk_score": round(float(avg_risk), 1),
        "status_breakdown": {s: c for s, c in status_counts},
    }


@router.get("/by-category")
def get_by_category(
    date_from: str = Query(None),
    date_to: str = Query(None),
    department_id: str = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    q = db.query(
        ExpenseCategory.name,
        func.count(ExpenseRequest.id).label("count"),
        func.coalesce(func.sum(ExpenseRequest.amount), 0).label("total"),
        func.coalesce(func.avg(ExpenseRequest.amount), 0).label("average"),
    ).outerjoin(ExpenseRequest, ExpenseRequest.category_id == ExpenseCategory.id)

    q = q.filter(ExpenseCategory.deleted_at.is_(None))

    if date_from:
        q = q.filter(ExpenseRequest.created_at >= datetime.fromisoformat(date_from))
    if date_to:
        q = q.filter(ExpenseRequest.created_at <= datetime.fromisoformat(date_to))
    if department_id:
        q = q.join(User, ExpenseRequest.employee_id == User.id).filter(
            User.department_id == department_id
        )

    rows = q.group_by(ExpenseCategory.id, ExpenseCategory.name).order_by(func.sum(ExpenseRequest.amount).desc().nullslast()).all()

    return [
        {
            "category": row.name,
            "count": row.count,
            "total": float(row.total),
            "average": round(float(row.average), 2),
        }
        for row in rows
    ]


@router.get("/by-department")
def get_by_department(
    date_from: str = Query(None),
    date_to: str = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    q = db.query(
        Department.name,
        func.count(ExpenseRequest.id).label("count"),
        func.coalesce(func.sum(ExpenseRequest.amount), 0).label("total"),
        func.coalesce(func.avg(ExpenseRequest.amount), 0).label("average"),
    ).outerjoin(User, User.department_id == Department.id).outerjoin(
        ExpenseRequest, ExpenseRequest.employee_id == User.id
    )

    q = q.filter(Department.deleted_at.is_(None))

    if date_from:
        q = q.filter(ExpenseRequest.created_at >= datetime.fromisoformat(date_from))
    if date_to:
        q = q.filter(ExpenseRequest.created_at <= datetime.fromisoformat(date_to))

    rows = q.group_by(Department.id, Department.name).order_by(func.sum(ExpenseRequest.amount).desc().nullslast()).all()

    return [
        {
            "department": row.name,
            "count": row.count,
            "total": float(row.total),
            "average": round(float(row.average), 2),
        }
        for row in rows
    ]


@router.get("/by-month")
def get_by_month(
    date_from: str = Query(None),
    date_to: str = Query(None),
    department_id: str = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    year_col = extract("year", ExpenseRequest.created_at).label("year")
    month_col = extract("month", ExpenseRequest.created_at).label("month")

    q = db.query(
        year_col,
        month_col,
        func.count(ExpenseRequest.id).label("count"),
        func.coalesce(func.sum(ExpenseRequest.amount), 0).label("total"),
    ).filter(ExpenseRequest.deleted_at.is_(None))

    if date_from:
        q = q.filter(ExpenseRequest.created_at >= datetime.fromisoformat(date_from))
    if date_to:
        q = q.filter(ExpenseRequest.created_at <= datetime.fromisoformat(date_to))
    if department_id:
        q = q.join(User, ExpenseRequest.employee_id == User.id).filter(
            User.department_id == department_id
        )

    rows = q.group_by(year_col, month_col).order_by(year_col, month_col).all()

    return [
        {
            "year": int(row.year),
            "month": int(row.month),
            "count": row.count,
            "total": float(row.total),
        }
        for row in rows
    ]


@router.get("/export/csv")
def export_csv(
    date_from: str = Query(None),
    date_to: str = Query(None),
    department_id: str = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    q = db.query(
        ExpenseRequest,
        User.full_name.label("employee_name"),
        ExpenseCategory.name.label("category_name"),
    ).outerjoin(User, ExpenseRequest.employee_id == User.id).outerjoin(
        ExpenseCategory, ExpenseRequest.category_id == ExpenseCategory.id
    ).filter(ExpenseRequest.deleted_at.is_(None))

    if date_from:
        q = q.filter(ExpenseRequest.created_at >= datetime.fromisoformat(date_from))
    if date_to:
        q = q.filter(ExpenseRequest.created_at <= datetime.fromisoformat(date_to))
    if department_id:
        q = q.filter(User.department_id == department_id)

    rows = q.order_by(ExpenseRequest.created_at.desc()).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "ID", "Title", "Employee", "Category", "Amount", "Currency",
        "Status", "Risk Score", "Risk Level", "Submitted At", "Created At",
    ])
    for req, employee_name, category_name in rows:
        writer.writerow([
            str(req.id),
            req.title,
            employee_name or "",
            category_name or "",
            req.amount,
            req.currency,
            req.status,
            req.ai_risk_score or "",
            req.ai_risk_level or "",
            str(req.submitted_at or ""),
            str(req.created_at),
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=expenses_report.csv"},
    )


@router.get("/export/pdf")
def export_pdf(
    date_from: str = Query(None),
    date_to: str = Query(None),
    department_id: str = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    q = _base_query(db, date_from, date_to, department_id)
    total = q.count()
    total_amount = q.with_entities(func.coalesce(func.sum(ExpenseRequest.amount), 0)).scalar()

    html = f"""
    <html><head><style>
    body {{ font-family: sans-serif; padding: 40px; }}
    h1 {{ color: #1a1a2e; }}
    table {{ border-collapse: collapse; width: 100%; margin-top: 20px; }}
    th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
    th {{ background: #f5f5f5; }}
    .summary {{ margin: 20px 0; }}
    </style></head><body>
    <h1>Expense Report</h1>
    <div class="summary">
    <p><strong>Total Requests:</strong> {total}</p>
    <p><strong>Total Amount:</strong> {float(total_amount):,.2f}</p>
    <p><strong>Generated:</strong> {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}</p>
    </div>
    """

    rows = (
        q.with_entities(
            ExpenseRequest.title,
            ExpenseRequest.amount,
            ExpenseRequest.status,
            ExpenseRequest.created_at,
        )
        .order_by(ExpenseRequest.created_at.desc())
        .limit(500)
        .all()
    )

    html += "<table><thead><tr><th>Title</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead><tbody>"
    for title, amount, status, created_at in rows:
        html += f"<tr><td>{title}</td><td>{amount:,.2f}</td><td>{status}</td><td>{created_at.strftime('%Y-%m-%d')}</td></tr>"
    html += "</tbody></table></body></html>"

    return StreamingResponse(
        iter([html.encode("utf-8")]),
        media_type="text/html",
        headers={"Content-Disposition": "attachment; filename=expenses_report.html"},
    )
