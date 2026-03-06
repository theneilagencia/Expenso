from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.dependencies import get_db
from app.schemas.request import (
    ActionRequest,
    RequestCreate,
    RequestListResponse,
    RequestResponse,
    RequestUpdate,
)
from app.services.ai_service import AIService
from app.services.request_service import RequestService

router = APIRouter()


@router.post("", response_model=RequestResponse, status_code=201, summary="Create expense request")
async def create_request(
    data: RequestCreate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = RequestService(db)
    req = service.create(current_user.id, data.model_dump())
    return req


@router.get("", response_model=RequestListResponse, summary="List expense requests")
async def list_requests(
    status: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = RequestService(db)
    requests, total = service.list_requests(
        user_id=current_user.id,
        role=current_user.role,
        status=status,
        page=page,
        per_page=per_page,
    )
    return RequestListResponse(data=requests, total=total, page=page, per_page=per_page)


@router.get("/options/categories", summary="List active expense categories")
async def list_categories(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    from app.models.expense_category import ExpenseCategory
    categories = (
        db.query(ExpenseCategory)
        .filter(ExpenseCategory.is_active.is_(True), ExpenseCategory.deleted_at.is_(None))
        .order_by(ExpenseCategory.sort_order.asc())
        .all()
    )
    return [
        {
            "id": str(c.id),
            "name": c.name,
            "icon": c.icon,
            "limit_per_request": c.limit_per_request,
            "min_justification_chars": c.min_justification_chars,
        }
        for c in categories
    ]


@router.get("/options/cost-centers", summary="List active cost centers")
async def list_cost_centers(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    from app.models.cost_center import CostCenter
    centers = (
        db.query(CostCenter)
        .filter(CostCenter.is_active.is_(True), CostCenter.deleted_at.is_(None))
        .all()
    )
    return [
        {
            "id": str(c.id),
            "name": c.name,
            "code": c.code,
        }
        for c in centers
    ]


@router.get("/{request_id}", response_model=RequestResponse, summary="Get expense request by ID")
async def get_request(
    request_id: UUID,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = RequestService(db)
    return service.get_by_id(request_id)


@router.patch("/{request_id}", response_model=RequestResponse, summary="Update expense request")
async def update_request(
    request_id: UUID,
    data: RequestUpdate,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = RequestService(db)
    return service.update(request_id, current_user.id, data.model_dump(exclude_unset=True))


@router.post("/{request_id}/submit", response_model=RequestResponse, summary="Submit request for approval")
async def submit_request(
    request_id: UUID,
    http_request: Request,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = RequestService(db)
    return service.perform_action(
        request_id=request_id,
        action="submit",
        actor_id=current_user.id,
        actor_role=current_user.role,
        ip_address=http_request.client.host,
        user_agent=http_request.headers.get("user-agent"),
    )


@router.post("/{request_id}/approve", response_model=RequestResponse, summary="Approve request")
async def approve_request(
    request_id: UUID,
    body: ActionRequest,
    http_request: Request,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = RequestService(db)
    return service.perform_action(
        request_id=request_id,
        action="approve",
        actor_id=current_user.id,
        actor_role=current_user.role,
        justification=body.justification,
        ip_address=http_request.client.host,
        user_agent=http_request.headers.get("user-agent"),
    )


@router.post("/{request_id}/reject", response_model=RequestResponse, summary="Reject request")
async def reject_request(
    request_id: UUID,
    body: ActionRequest,
    http_request: Request,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = RequestService(db)
    return service.perform_action(
        request_id=request_id,
        action="reject",
        actor_id=current_user.id,
        actor_role=current_user.role,
        justification=body.justification,
        comment=body.justification,
        ip_address=http_request.client.host,
        user_agent=http_request.headers.get("user-agent"),
    )


@router.post("/{request_id}/request-edit", response_model=RequestResponse, summary="Request correction")
async def request_edit(
    request_id: UUID,
    body: ActionRequest,
    http_request: Request,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = RequestService(db)
    return service.perform_action(
        request_id=request_id,
        action="request_edit",
        actor_id=current_user.id,
        actor_role=current_user.role,
        comment=body.comment,
        ip_address=http_request.client.host,
        user_agent=http_request.headers.get("user-agent"),
    )


@router.post("/{request_id}/cancel", response_model=RequestResponse, summary="Cancel request")
async def cancel_request(
    request_id: UUID,
    http_request: Request,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = RequestService(db)
    return service.perform_action(
        request_id=request_id,
        action="cancel",
        actor_id=current_user.id,
        actor_role=current_user.role,
        ip_address=http_request.client.host,
        user_agent=http_request.headers.get("user-agent"),
    )


@router.get("/{request_id}/audit-log", summary="Get audit log for request")
async def get_audit_log(
    request_id: UUID,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    from app.models.audit_log import AuditLog
    logs = db.query(AuditLog).filter(AuditLog.request_id == request_id).order_by(AuditLog.created_at.asc()).all()
    return [
        {
            "id": str(log.id),
            "action": log.action,
            "actor_id": str(log.actor_id) if log.actor_id else None,
            "actor_role": log.actor_role,
            "previous_status": log.previous_status,
            "new_status": log.new_status,
            "justification": log.justification,
            "created_at": log.created_at.isoformat() if log.created_at else None,
        }
        for log in logs
    ]


@router.get("/{request_id}/versions", summary="Get version history for request")
async def get_versions(
    request_id: UUID,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    from app.models.request_version import RequestVersion
    versions = db.query(RequestVersion).filter(
        RequestVersion.request_id == request_id
    ).order_by(RequestVersion.version_number.asc()).all()
    return [
        {
            "id": str(v.id),
            "version_number": v.version_number,
            "snapshot": v.snapshot,
            "changed_by": str(v.changed_by) if v.changed_by else None,
            "change_reason": v.change_reason,
            "created_at": v.created_at.isoformat() if v.created_at else None,
        }
        for v in versions
    ]


@router.post("/{request_id}/ai-summary")
async def generate_ai_summary(
    request_id: UUID,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Generate an AI summary for an expense request."""
    result = AIService.generate_summary(request_id, db)
    if not result:
        return {"message": "Summary generation failed"}
    return result
