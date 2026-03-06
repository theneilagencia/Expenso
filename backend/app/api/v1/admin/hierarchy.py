import uuid

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundError
from app.core.permissions import require_role
from app.dependencies import get_db
from app.models.department import Department
from app.models.user import User

router = APIRouter()


class HierarchyUpdate(BaseModel):
    parent_department_id: str | None = None


def _build_dept_dict(dept: Department, users_by_dept: dict) -> dict:
    dept_users = users_by_dept.get(str(dept.id), [])
    return {
        "id": str(dept.id),
        "name": dept.name,
        "code": dept.code,
        "head_user_id": str(dept.head_user_id) if dept.head_user_id else None,
        "parent_department_id": str(dept.parent_department_id) if dept.parent_department_id else None,
        "users": [
            {
                "id": str(u.id),
                "full_name": u.full_name,
                "email": u.email,
                "role": u.role,
            }
            for u in dept_users
        ],
        "children": [],
    }


def _build_tree(departments: list, users_by_dept: dict) -> list:
    dept_map = {}
    for dept in departments:
        dept_map[str(dept.id)] = _build_dept_dict(dept, users_by_dept)

    roots = []
    for dept in departments:
        dept_dict = dept_map[str(dept.id)]
        parent_id = str(dept.parent_department_id) if dept.parent_department_id else None
        if parent_id and parent_id in dept_map:
            dept_map[parent_id]["children"].append(dept_dict)
        else:
            roots.append(dept_dict)

    return roots


@router.get("", summary="Get department hierarchy tree")
async def get_hierarchy(
    current_user=Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
):
    departments = (
        db.query(Department)
        .filter(Department.deleted_at.is_(None))
        .order_by(Department.name)
        .all()
    )

    users = (
        db.query(User)
        .filter(User.deleted_at.is_(None), User.department_id.isnot(None))
        .all()
    )

    users_by_dept: dict[str, list] = {}
    for user in users:
        dept_key = str(user.department_id)
        if dept_key not in users_by_dept:
            users_by_dept[dept_key] = []
        users_by_dept[dept_key].append(user)

    return _build_tree(departments, users_by_dept)


@router.patch("/{department_id}", summary="Update department parent")
async def update_department_parent(
    department_id: str,
    data: HierarchyUpdate,
    current_user=Depends(require_role("ADMIN")),
    db: Session = Depends(get_db),
):
    dept = (
        db.query(Department)
        .filter(
            Department.id == uuid.UUID(department_id),
            Department.deleted_at.is_(None),
        )
        .first()
    )
    if not dept:
        raise NotFoundError("Department")

    if data.parent_department_id is not None:
        dept.parent_department_id = uuid.UUID(data.parent_department_id)
    else:
        dept.parent_department_id = None

    db.commit()
    return {
        "id": str(dept.id),
        "name": dept.name,
        "parent_department_id": str(dept.parent_department_id) if dept.parent_department_id else None,
        "status": "updated",
    }
