from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.dependencies import get_db
from app.models.audit_log import AuditLog
from app.models.user import User

router = APIRouter()


@router.get("")
def list_audit_logs(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    action: str = Query(None),
    actor_id: str = Query(None),
    request_id: str = Query(None),
    date_from: str = Query(None),
    date_to: str = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.role != "ADMIN":
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")

    q = db.query(AuditLog)

    if action:
        q = q.filter(AuditLog.action == action)
    if actor_id:
        q = q.filter(AuditLog.actor_id == UUID(actor_id))
    if request_id:
        q = q.filter(AuditLog.request_id == UUID(request_id))
    if date_from:
        from datetime import datetime
        q = q.filter(AuditLog.created_at >= datetime.fromisoformat(date_from))
    if date_to:
        from datetime import datetime
        q = q.filter(AuditLog.created_at <= datetime.fromisoformat(date_to))

    total = q.count()
    logs = (
        q.order_by(AuditLog.created_at.desc())
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )

    actor_ids = {log.actor_id for log in logs if log.actor_id}
    actors = {}
    if actor_ids:
        users = db.query(User).filter(User.id.in_(actor_ids)).all()
        actors = {u.id: u.full_name for u in users}

    return {
        "data": [
            {
                "id": str(log.id),
                "request_id": str(log.request_id) if log.request_id else None,
                "actor_id": str(log.actor_id) if log.actor_id else None,
                "actor_name": actors.get(log.actor_id),
                "actor_role": log.actor_role,
                "action": log.action,
                "previous_status": log.previous_status,
                "new_status": log.new_status,
                "justification": log.justification,
                "diff": log.diff,
                "ai_snapshot": log.ai_snapshot,
                "ip_address": log.ip_address,
                "created_at": log.created_at.isoformat() if log.created_at else None,
            }
            for log in logs
        ],
        "meta": {
            "page": page,
            "per_page": per_page,
            "total": total,
            "total_pages": (total + per_page - 1) // per_page,
        },
    }


@router.get("/{log_id}")
def get_audit_log(
    log_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.role != "ADMIN":
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")

    log = db.query(AuditLog).filter(AuditLog.id == log_id).first()
    if not log:
        from fastapi import HTTPException, status
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Audit log not found")

    actor_name = None
    if log.actor_id:
        actor = db.query(User).filter(User.id == log.actor_id).first()
        actor_name = actor.full_name if actor else None

    return {
        "id": str(log.id),
        "request_id": str(log.request_id) if log.request_id else None,
        "actor_id": str(log.actor_id) if log.actor_id else None,
        "actor_name": actor_name,
        "actor_role": log.actor_role,
        "action": log.action,
        "previous_status": log.previous_status,
        "new_status": log.new_status,
        "justification": log.justification,
        "diff": log.diff,
        "ai_snapshot": log.ai_snapshot,
        "ip_address": log.ip_address,
        "user_agent": log.user_agent,
        "created_at": log.created_at.isoformat() if log.created_at else None,
    }
