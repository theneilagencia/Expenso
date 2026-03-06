"""Tests for admin user impersonation."""

import uuid

from app.core.security import hash_password
from app.models.user import User


class TestImpersonateUser:
    def test_impersonate_user(self, client, db, admin_user, admin_headers, employee_user):
        """Admin can create impersonation token for a target user."""
        resp = client.post(
            f"/api/v1/admin/users/{employee_user.id}/impersonate",
            headers=admin_headers,
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["impersonating"]["email"] == "employee@test.com"
        assert data["impersonating"]["role"] == "EMPLOYEE"
        assert data["impersonating"]["id"] == str(employee_user.id)

    def test_impersonate_creates_audit_log(self, client, db, admin_user, admin_headers, employee_user):
        """Impersonation creates an audit log entry."""
        from app.models.audit_log import AuditLog

        resp = client.post(
            f"/api/v1/admin/users/{employee_user.id}/impersonate",
            headers=admin_headers,
        )
        assert resp.status_code == 200

        log = db.query(AuditLog).filter(
            AuditLog.action == "IMPERSONATION_START",
            AuditLog.actor_id == admin_user.id,
        ).first()
        assert log is not None
        assert "employee@test.com" in log.justification

    def test_impersonate_requires_admin(self, client, employee_user, employee_headers):
        """Non-admin gets 403."""
        resp = client.post(
            f"/api/v1/admin/users/{employee_user.id}/impersonate",
            headers=employee_headers,
        )
        assert resp.status_code == 403

    def test_impersonate_nonexistent_user(self, client, admin_headers):
        """Returns 404 for nonexistent user ID."""
        fake_id = str(uuid.uuid4())
        resp = client.post(
            f"/api/v1/admin/users/{fake_id}/impersonate",
            headers=admin_headers,
        )
        assert resp.status_code == 404

    def test_impersonate_deleted_user(self, client, db, admin_headers, department):
        """Returns 404 for a soft-deleted user."""
        from datetime import datetime, timezone

        deleted_user = User(
            id=uuid.uuid4(),
            full_name="Deleted User",
            email="deleted@test.com",
            password_hash=hash_password("password123"),
            role="EMPLOYEE",
            department_id=department.id,
            deleted_at=datetime.now(timezone.utc),
        )
        db.add(deleted_user)
        db.commit()

        resp = client.post(
            f"/api/v1/admin/users/{deleted_user.id}/impersonate",
            headers=admin_headers,
        )
        assert resp.status_code == 404

    def test_impersonate_manager_role(self, client, admin_headers, manager_user):
        """Admin can impersonate a manager user."""
        resp = client.post(
            f"/api/v1/admin/users/{manager_user.id}/impersonate",
            headers=admin_headers,
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["impersonating"]["role"] == "MANAGER"
