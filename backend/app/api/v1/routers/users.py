import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.core.security import get_current_user, verify_password
from app.dependencies import get_db
from app.models.user import User
from app.schemas.auth import DeleteAccountRequest
from app.schemas.user import UserResponse, UserUpdateRequest

router = APIRouter()


@router.get("/me", response_model=UserResponse, summary="Get current user profile")
async def get_me(current_user=Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserResponse, summary="Update current user profile")
async def update_me(
    request: UserUpdateRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Re-fetch user from the route's db session to avoid cross-session issues
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if request.locale is not None:
        if request.locale not in ("en-US", "pt-BR"):
            raise HTTPException(status_code=400, detail="Invalid locale")
        user.locale = request.locale

    if request.full_name is not None:
        if len(request.full_name.strip()) < 2:
            raise HTTPException(status_code=400, detail="Name must be at least 2 characters")
        user.full_name = request.full_name.strip()

    db.commit()
    db.refresh(user)
    return user


@router.get("/me/data-export", summary="LGPD: request personal data export")
async def request_data_export(
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Dispatch async data export task (LGPD right to data portability)."""
    try:
        from app.workers.tasks.lgpd_tasks import generate_data_export
        generate_data_export.delay(str(current_user.id))
        return {"status": "processing", "message": "Data export is being generated"}
    except Exception:
        # Synchronous fallback if Celery unavailable
        import io

        from app.services.data_export_service import build_user_data_zip

        zip_bytes = build_user_data_zip(str(current_user.id), db)
        return StreamingResponse(
            io.BytesIO(zip_bytes),
            media_type="application/zip",
            headers={"Content-Disposition": "attachment; filename=data_export.zip"},
        )


@router.delete("/me", summary="LGPD: delete/anonymize account")
async def delete_account(
    body: DeleteAccountRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Anonymize user data (LGPD right to erasure). Only EMPLOYEE role."""
    if current_user.role != "EMPLOYEE":
        raise HTTPException(
            status_code=403,
            detail="Only employees can self-delete. Managers/Finance/Admins must contact admin.",
        )

    if not verify_password(body.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    # Re-fetch from route's db session
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Create audit log BEFORE anonymization
    from app.models.audit_log import AuditLog
    audit = AuditLog(
        id=uuid.uuid4(),
        actor_id=user.id,
        actor_role=user.role,
        action="ACCOUNT_DELETED",
        justification=f"Self-deletion by {user.email}",
    )
    db.add(audit)

    # Cancel in-progress requests
    from app.models.expense_request import ExpenseRequest
    active_statuses = ("DRAFT", "PENDING_AI", "PENDING_MANAGER", "PENDING_FINANCE", "IN_CORRECTION")
    active_requests = db.query(ExpenseRequest).filter(
        ExpenseRequest.employee_id == user.id,
        ExpenseRequest.status.in_(active_statuses),
        ExpenseRequest.deleted_at.is_(None),
    ).all()
    for req in active_requests:
        req.status = "CANCELLED"

    # Anonymize user
    anon_id = uuid.uuid4().hex[:12]
    user.full_name = "Deleted User"
    user.email = f"{anon_id}@deleted.expenso.io"
    user.password_hash = "DELETED"
    user.pix_key = None
    user.revolut_counterparty_id = None
    user.mfa_secret = None
    user.status = "INACTIVE"
    user.deleted_at = datetime.now(timezone.utc)

    db.commit()
    return {"status": "deleted", "message": "Account has been anonymized"}
