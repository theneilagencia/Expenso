import uuid

from app.core.security import (
    create_access_token,
    create_password_reset_token,
    create_refresh_token,
    hash_password,
)


class TestLogin:
    def test_login_success(self, client, employee_user):
        resp = client.post("/api/v1/auth/login", json={
            "email": "employee@test.com",
            "password": "password123",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["email"] == "employee@test.com"
        assert data["user"]["role"] == "EMPLOYEE"

    def test_login_wrong_password(self, client, employee_user):
        resp = client.post("/api/v1/auth/login", json={
            "email": "employee@test.com",
            "password": "wrongpassword",
        })
        assert resp.status_code == 401

    def test_login_nonexistent_email(self, client):
        resp = client.post("/api/v1/auth/login", json={
            "email": "nobody@test.com",
            "password": "password123",
        })
        assert resp.status_code == 401

    def test_login_inactive_user(self, client, db, department):
        from app.models.user import User

        user = User(
            id=uuid.uuid4(),
            full_name="Inactive User",
            email="inactive@test.com",
            password_hash=hash_password("password123"),
            role="EMPLOYEE",
            department_id=department.id,
            status="INACTIVE",
        )
        db.add(user)
        db.commit()

        resp = client.post("/api/v1/auth/login", json={
            "email": "inactive@test.com",
            "password": "password123",
        })
        assert resp.status_code == 403

    def test_login_returns_all_user_fields(self, client, employee_user):
        resp = client.post("/api/v1/auth/login", json={
            "email": "employee@test.com",
            "password": "password123",
        })
        data = resp.json()
        user = data["user"]
        assert "id" in user
        assert "full_name" in user
        assert "email" in user
        assert "role" in user
        assert "locale" in user


class TestRefreshToken:
    def test_refresh_success(self, client, employee_user):
        refresh_token = create_refresh_token({"sub": str(employee_user.id)})
        resp = client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert "refresh_token" in data

    def test_refresh_invalid_token(self, client):
        resp = client.post("/api/v1/auth/refresh", json={"refresh_token": "invalid.token.here"})
        assert resp.status_code == 401

    def test_refresh_with_access_token_fails(self, client, employee_user):
        access_token = create_access_token({"sub": str(employee_user.id)})
        resp = client.post("/api/v1/auth/refresh", json={"refresh_token": access_token})
        assert resp.status_code == 401

    def test_refresh_deleted_user(self, client, db, employee_user):
        from datetime import datetime, timezone

        refresh_token = create_refresh_token({"sub": str(employee_user.id)})
        employee_user.deleted_at = datetime.now(timezone.utc)
        db.commit()
        resp = client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
        assert resp.status_code == 401


class TestLogout:
    def test_logout(self, client):
        resp = client.post("/api/v1/auth/logout")
        assert resp.status_code == 200
        assert resp.json()["message"] == "Logged out successfully"


class TestPasswordResetRequest:
    def test_request_reset_existing_user(self, client, employee_user):
        resp = client.post("/api/v1/auth/password-reset/request", json={
            "email": "employee@test.com",
        })
        assert resp.status_code == 200
        assert "reset link" in resp.json()["message"].lower() or "sent" in resp.json()["message"].lower()

    def test_request_reset_nonexistent_email(self, client):
        resp = client.post("/api/v1/auth/password-reset/request", json={
            "email": "nobody@test.com",
        })
        # Should return success to prevent email enumeration
        assert resp.status_code == 200


class TestPasswordResetConfirm:
    def test_reset_password_success(self, client, db, employee_user):
        token = create_password_reset_token(str(employee_user.id))
        resp = client.post("/api/v1/auth/password-reset/confirm", json={
            "token": token,
            "new_password": "newpassword456",
        })
        assert resp.status_code == 200

        # Verify we can login with new password
        resp = client.post("/api/v1/auth/login", json={
            "email": "employee@test.com",
            "password": "newpassword456",
        })
        assert resp.status_code == 200

    def test_reset_password_invalid_token(self, client):
        resp = client.post("/api/v1/auth/password-reset/confirm", json={
            "token": "invalid.token.here",
            "new_password": "newpassword456",
        })
        assert resp.status_code == 400

    def test_reset_password_short_password(self, client, employee_user):
        token = create_password_reset_token(str(employee_user.id))
        resp = client.post("/api/v1/auth/password-reset/confirm", json={
            "token": token,
            "new_password": "short",
        })
        assert resp.status_code == 422  # validation error


class TestChangePassword:
    def test_change_password_success(self, client, employee_user, employee_headers):
        resp = client.post("/api/v1/auth/change-password", json={
            "current_password": "password123",
            "new_password": "newpassword456",
        }, headers=employee_headers)
        assert resp.status_code == 200

        # Verify login with new password
        resp = client.post("/api/v1/auth/login", json={
            "email": "employee@test.com",
            "password": "newpassword456",
        })
        assert resp.status_code == 200

    def test_change_password_wrong_current(self, client, employee_headers):
        resp = client.post("/api/v1/auth/change-password", json={
            "current_password": "wrongpassword",
            "new_password": "newpassword456",
        }, headers=employee_headers)
        assert resp.status_code == 400

    def test_change_password_unauthenticated(self, client):
        resp = client.post("/api/v1/auth/change-password", json={
            "current_password": "password123",
            "new_password": "newpassword456",
        })
        assert resp.status_code == 403


class TestSSOConfig:
    def test_sso_config_empty(self, client):
        resp = client.get("/api/v1/auth/sso/config")
        assert resp.status_code == 200
        data = resp.json()
        assert "providers" in data
        assert isinstance(data["providers"], list)

    def test_sso_login_azure_not_configured(self, client):
        resp = client.post("/api/v1/auth/sso/login", json={
            "provider": "azure_ad",
            "code": "test-code",
        })
        assert resp.status_code == 501

    def test_sso_login_google_not_configured(self, client):
        resp = client.post("/api/v1/auth/sso/login", json={
            "provider": "google",
            "code": "test-code",
        })
        assert resp.status_code == 501

    def test_sso_login_invalid_provider(self, client):
        resp = client.post("/api/v1/auth/sso/login", json={
            "provider": "facebook",
            "code": "test-code",
        })
        assert resp.status_code == 422  # validation error


class TestUsersMe:
    def test_get_me(self, client, employee_user, employee_headers):
        resp = client.get("/api/v1/users/me", headers=employee_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["email"] == "employee@test.com"
        assert data["role"] == "EMPLOYEE"

    def test_get_me_unauthenticated(self, client):
        resp = client.get("/api/v1/users/me")
        assert resp.status_code == 403

    def test_update_locale(self, client, employee_headers):
        resp = client.patch("/api/v1/users/me", json={"locale": "pt-BR"}, headers=employee_headers)
        assert resp.status_code == 200
        assert resp.json()["locale"] == "pt-BR"

    def test_update_locale_invalid(self, client, employee_headers):
        resp = client.patch("/api/v1/users/me", json={"locale": "fr-FR"}, headers=employee_headers)
        assert resp.status_code == 400

    def test_update_full_name(self, client, employee_headers):
        resp = client.patch("/api/v1/users/me", json={"full_name": "New Name"}, headers=employee_headers)
        assert resp.status_code == 200
        assert resp.json()["full_name"] == "New Name"

    def test_update_full_name_too_short(self, client, employee_headers):
        resp = client.patch("/api/v1/users/me", json={"full_name": "A"}, headers=employee_headers)
        assert resp.status_code == 400


class TestRBACPermissions:
    def test_admin_can_access_audit(self, client, admin_headers):
        resp = client.get("/api/v1/audit", headers=admin_headers)
        assert resp.status_code == 200

    def test_employee_cannot_access_audit(self, client, employee_headers):
        resp = client.get("/api/v1/audit", headers=employee_headers)
        assert resp.status_code == 403

    def test_manager_cannot_access_audit(self, client, manager_headers):
        resp = client.get("/api/v1/audit", headers=manager_headers)
        assert resp.status_code == 403

    def test_finance_cannot_access_audit(self, client, finance_headers):
        resp = client.get("/api/v1/audit", headers=finance_headers)
        assert resp.status_code == 403

    def test_admin_can_access_admin_users(self, client, admin_headers):
        resp = client.get("/api/v1/admin/users", headers=admin_headers)
        assert resp.status_code == 200

    def test_employee_cannot_access_admin_users(self, client, employee_headers):
        resp = client.get("/api/v1/admin/users", headers=employee_headers)
        assert resp.status_code == 403
