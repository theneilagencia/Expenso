import sqlite3
import uuid
from datetime import datetime, timezone

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event, String, Text, TypeDecorator
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.base import Base
from app.dependencies import get_db
from app.main import app
from app.core.security import hash_password, create_access_token

# Import all models so Base.metadata knows every table
from app.models.user import User
from app.models.department import Department
from app.models.cost_center import CostCenter
from app.models.expense_category import ExpenseCategory
from app.models.expense_request import ExpenseRequest
from app.models.request_version import RequestVersion
from app.models.audit_log import AuditLog
from app.models.request_comment import RequestComment
from app.models.attachment import Attachment
from app.models.payment import Payment
from app.models.sla_config import SLAConfig
from app.models.approval_policy import ApprovalPolicy
from app.models.integration import Integration
from app.models.ai_analysis_log import AIAnalysisLog
from app.models.vendor_list import VendorList
from app.models.notification import Notification
from app.models.corporate_calendar import CorporateCalendar

# --- SQLite compatibility: map PostgreSQL types to SQLite-compatible types ---
from sqlalchemy.dialects.postgresql import UUID as PG_UUID, JSONB as PG_JSONB

# Register UUID adapter for sqlite3 so it stores as string
sqlite3.register_adapter(uuid.UUID, lambda u: str(u))
sqlite3.register_converter("UUID", lambda b: uuid.UUID(b.decode()))


def _patch_pg_types():
    """Patch PostgreSQL-specific column types for SQLite compatibility."""
    for table in Base.metadata.tables.values():
        for column in table.columns:
            col_type = column.type
            if isinstance(col_type, PG_UUID):
                column.type = String(36)
            elif isinstance(col_type, PG_JSONB):
                column.type = Text()


# Patch once at import time
_patch_pg_types()

TEST_DB_URL = "sqlite://"

engine = create_engine(
    TEST_DB_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


# Override get_current_user for SQLite compatibility (UUID stored as string)
from fastapi import HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from fastapi import Depends
from jose import JWTError, jwt
from app.config import settings
from app.core.security import security_scheme, get_current_user as _orig_get_current_user


def _test_get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
    db=Depends(override_get_db),
):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    # Compare as string for SQLite compatibility
    user = db.query(User).filter(User.id == user_id, User.deleted_at.is_(None)).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


app.dependency_overrides[_orig_get_current_user] = _test_get_current_user


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def department(db):
    dept = Department(id=uuid.uuid4(), name="Engineering", code="ENG")
    db.add(dept)
    db.commit()
    db.refresh(dept)
    return dept


@pytest.fixture
def category(db):
    cat = ExpenseCategory(
        id=uuid.uuid4(),
        name="Travel",
        limit_per_request=5000.0,
        is_active=True,
    )
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


@pytest.fixture
def admin_user(db, department):
    user = User(
        id=uuid.uuid4(),
        full_name="Admin User",
        email="admin@test.com",
        password_hash=hash_password("password123"),
        role="ADMIN",
        department_id=department.id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def manager_user(db, department):
    user = User(
        id=uuid.uuid4(),
        full_name="Manager User",
        email="manager@test.com",
        password_hash=hash_password("password123"),
        role="MANAGER",
        department_id=department.id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def employee_user(db, department, manager_user):
    user = User(
        id=uuid.uuid4(),
        full_name="Employee User",
        email="employee@test.com",
        password_hash=hash_password("password123"),
        role="EMPLOYEE",
        department_id=department.id,
        manager_id=manager_user.id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def finance_user(db, department):
    user = User(
        id=uuid.uuid4(),
        full_name="Finance User",
        email="finance@test.com",
        password_hash=hash_password("password123"),
        role="FINANCE",
        department_id=department.id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def auth_headers(user):
    token = create_access_token({"sub": str(user.id)})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def admin_headers(admin_user):
    return auth_headers(admin_user)


@pytest.fixture
def manager_headers(manager_user):
    return auth_headers(manager_user)


@pytest.fixture
def employee_headers(employee_user):
    return auth_headers(employee_user)


@pytest.fixture
def finance_headers(finance_user):
    return auth_headers(finance_user)


@pytest.fixture
def sample_requests(db, employee_user, category):
    requests_list = []
    statuses = [
        "DRAFT",
        "PENDING_AI",
        "PENDING_MANAGER",
        "PENDING_FINANCE",
        "PAID",
        "REJECTED",
    ]
    for i, status in enumerate(statuses):
        req = ExpenseRequest(
            id=uuid.uuid4(),
            employee_id=employee_user.id,
            category_id=category.id,
            title=f"Expense {i + 1}",
            amount=100.0 * (i + 1),
            currency="BRL",
            status=status,
            ai_risk_score=20 * (i + 1) if i < 5 else None,
            ai_risk_level="LOW" if i < 2 else "MEDIUM" if i < 4 else "HIGH",
        )
        db.add(req)
        requests_list.append(req)
    db.commit()
    return requests_list


@pytest.fixture
def audit_logs(db, admin_user, sample_requests):
    logs = []
    for req in sample_requests[:3]:
        log = AuditLog(
            id=uuid.uuid4(),
            request_id=req.id,
            actor_id=admin_user.id,
            actor_role="ADMIN",
            action="STATUS_CHANGE",
            previous_status="DRAFT",
            new_status=req.status,
        )
        db.add(log)
        logs.append(log)
    db.commit()
    return logs
