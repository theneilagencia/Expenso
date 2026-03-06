import uuid
from typing import Optional

from fastapi import APIRouter, Depends, File, Query, UploadFile
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError, ValidationError
from app.core.permissions import require_role
from app.core.security import create_access_token, hash_password
from app.dependencies import get_db
from app.models.audit_log import AuditLog
from app.models.user import User

router = APIRouter()


class AdminUserCreate(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    password: str = Field(..., min_length=8)
    role: str = Field(..., pattern="^(EMPLOYEE|MANAGER|FINANCE|ADMIN)$")
    department_id: Optional[str] = None
    cost_center_id: Optional[str] = None
    manager_id: Optional[str] = None
    locale: str = "en-US"


class AdminUserUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[str] = None
    status: Optional[str] = None
    department_id: Optional[str] = None
    cost_center_id: Optional[str] = None
    manager_id: Optional[str] = None
    locale: Optional[str] = None


@router.get("", summary="List all users")
async def list_users(
    status: Optional[str] = Query(None),
    role: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    current_user=Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
):
    query = db.query(User).filter(User.deleted_at.is_(None))
    if status:
        query = query.filter(User.status == status)
    if role:
        query = query.filter(User.role == role)
    total = query.count()
    users = query.order_by(User.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()
    return {
        "data": [
            {
                "id": str(u.id), "full_name": u.full_name, "email": u.email,
                "role": u.role, "status": u.status, "locale": u.locale,
                "department_id": str(u.department_id) if u.department_id else None,
                "created_at": u.created_at.isoformat() if u.created_at else None,
            }
            for u in users
        ],
        "total": total, "page": page, "per_page": per_page,
    }


@router.post("", status_code=201, summary="Create user")
async def create_user(
    data: AdminUserCreate,
    current_user=Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
):
    exists = db.query(User).filter(User.email == data.email).first()
    if exists:
        raise ValidationError("Email already registered")

    user = User(
        id=uuid.uuid4(),
        full_name=data.full_name,
        email=data.email,
        password_hash=hash_password(data.password),
        role=data.role,
        locale=data.locale,
        force_password_reset=True,
        created_by=current_user.id,
    )
    db.add(user)

    db.add(AuditLog(
        id=uuid.uuid4(),
        actor_id=current_user.id,
        actor_role=current_user.role,
        action="CREATE_USER",
        justification=f"Created user {data.email}",
    ))

    db.commit()
    return {"id": str(user.id), "email": user.email, "role": user.role}


@router.patch("/{user_id}", summary="Update user")
async def update_user(
    user_id: str,
    data: AdminUserUpdate,
    current_user=Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == uuid.UUID(user_id), User.deleted_at.is_(None)).first()
    if not user:
        raise NotFoundError("User")

    changes = {}
    for field, value in data.model_dump(exclude_unset=True).items():
        if value is not None:
            old_val = getattr(user, field)
            setattr(user, field, value)
            changes[field] = {"old": str(old_val), "new": str(value)}

    db.add(AuditLog(
        id=uuid.uuid4(),
        actor_id=current_user.id,
        actor_role=current_user.role,
        action="UPDATE_USER",
        diff=changes,
        justification=f"Updated user {user.email}",
    ))

    db.commit()
    return {"id": str(user.id), "email": user.email, "status": "updated"}


@router.delete("/{user_id}", summary="Soft delete user")
async def delete_user(
    user_id: str,
    current_user=Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
):
    from datetime import datetime, timezone
    user = db.query(User).filter(User.id == uuid.UUID(user_id), User.deleted_at.is_(None)).first()
    if not user:
        raise NotFoundError("User")

    user.deleted_at = datetime.now(timezone.utc)
    user.status = "INACTIVE"

    db.add(AuditLog(
        id=uuid.uuid4(),
        actor_id=current_user.id,
        actor_role=current_user.role,
        action="DELETE_USER",
        justification=f"Soft deleted user {user.email}",
    ))

    db.commit()
    return {"id": str(user.id), "status": "deleted"}


@router.post("/import", status_code=200, summary="Bulk import users from XLSX")
async def import_users(
    file: UploadFile = File(...),
    current_user=Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
):
    from app.services.user_import_service import UserImportService

    contents = await file.read()
    result = UserImportService.parse_xlsx(contents, db)
    return result


@router.post("/{user_id}/impersonate", summary="Start impersonation session")
async def impersonate_user(
    user_id: str,
    current_user=Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
):
    target = db.query(User).filter(
        User.id == uuid.UUID(user_id), User.deleted_at.is_(None)
    ).first()
    if not target:
        raise NotFoundError("User")

    # Create special impersonation token
    token = create_access_token({
        "sub": str(target.id),
        "role": target.role,
        "impersonated_by": str(current_user.id),
        "read_only": True,
    })

    # Audit log
    audit = AuditLog(
        id=uuid.uuid4(),
        actor_id=current_user.id,
        actor_role=current_user.role,
        action="IMPERSONATION_START",
        justification=f"Impersonating user {target.email}",
    )
    db.add(audit)
    db.commit()

    return {
        "access_token": token,
        "token_type": "bearer",
        "impersonating": {
            "id": str(target.id),
            "full_name": target.full_name,
            "email": target.email,
            "role": target.role,
        },
    }
