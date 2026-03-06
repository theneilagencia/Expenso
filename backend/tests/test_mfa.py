"""Tests for MFA (Multi-Factor Authentication) flow."""

import uuid
from unittest.mock import patch

from app.core.security import create_mfa_token, hash_password
from app.models.user import User


class TestMFASetup:
    def test_mfa_setup_success(self, client, employee_user, employee_headers):
        """POST /auth/mfa/setup returns secret + qr_data_uri for user without MFA."""
        with patch("app.api.v1.routers.auth.MFAService.generate_secret", return_value="JBSWY3DPEHPK3PXP"):
            with patch("app.api.v1.routers.auth.MFAService.generate_qr_data_uri", return_value="data:image/png;base64,AAAA"):
                resp = client.post("/api/v1/auth/mfa/setup", headers=employee_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert "secret" in data
        assert "qr_data_uri" in data
        assert data["secret"] == "JBSWY3DPEHPK3PXP"
        assert data["qr_data_uri"].startswith("data:image/png;base64,")

    def test_mfa_setup_already_enabled(self, client, db, employee_user, employee_headers):
        """Returns 400 when MFA is already enabled."""
        employee_user.mfa_enabled = True
        employee_user.mfa_secret = "EXISTINGSECRET"
        db.commit()

        resp = client.post("/api/v1/auth/mfa/setup", headers=employee_headers)
        assert resp.status_code == 400
        data = resp.json()
        assert data["detail"]["error"] == "MFA_ALREADY_ENABLED"

    def test_mfa_setup_requires_auth(self, client):
        """Returns 403 without authentication token."""
        resp = client.post("/api/v1/auth/mfa/setup")
        assert resp.status_code == 403


class TestMFAConfirm:
    def test_mfa_confirm_success(self, client, db, employee_user, employee_headers):
        """Validate first TOTP code enables MFA."""
        # First, store a secret (simulating setup)
        employee_user.mfa_secret = "JBSWY3DPEHPK3PXP"
        db.commit()

        with patch("app.api.v1.routers.auth.MFAService.verify_totp", return_value=True):
            resp = client.post(
                "/api/v1/auth/mfa/confirm",
                json={"code": "123456"},
                headers=employee_headers,
            )
        assert resp.status_code == 200
        assert resp.json()["message"] == "MFA enabled successfully"

        # Verify MFA is now enabled in DB
        db.refresh(employee_user)
        assert employee_user.mfa_enabled is True

    def test_mfa_confirm_invalid_code(self, client, db, employee_user, employee_headers):
        """Invalid TOTP code returns 400."""
        employee_user.mfa_secret = "JBSWY3DPEHPK3PXP"
        db.commit()

        with patch("app.api.v1.routers.auth.MFAService.verify_totp", return_value=False):
            resp = client.post(
                "/api/v1/auth/mfa/confirm",
                json={"code": "000000"},
                headers=employee_headers,
            )
        assert resp.status_code == 400
        assert resp.json()["detail"]["error"] == "INVALID_MFA_CODE"

    def test_mfa_confirm_not_setup(self, client, employee_user, employee_headers):
        """Returns 400 when no secret stored (setup not called)."""
        resp = client.post(
            "/api/v1/auth/mfa/confirm",
            json={"code": "123456"},
            headers=employee_headers,
        )
        assert resp.status_code == 400
        assert resp.json()["detail"]["error"] == "MFA_NOT_SETUP"

    def test_mfa_confirm_already_enabled(self, client, db, employee_user, employee_headers):
        """Returns 400 when MFA is already enabled."""
        employee_user.mfa_enabled = True
        employee_user.mfa_secret = "EXISTINGSECRET"
        db.commit()

        resp = client.post(
            "/api/v1/auth/mfa/confirm",
            json={"code": "123456"},
            headers=employee_headers,
        )
        assert resp.status_code == 400
        assert resp.json()["detail"]["error"] == "MFA_ALREADY_ENABLED"


class TestMFALoginFlow:
    def test_mfa_login_flow(self, client, db, department):
        """Login with MFA enabled returns mfa_required+mfa_token, then verify returns full tokens."""
        # Create user with MFA enabled
        user = User(
            id=uuid.uuid4(),
            full_name="MFA User",
            email="mfa@test.com",
            password_hash=hash_password("password123"),
            role="EMPLOYEE",
            department_id=department.id,
            mfa_enabled=True,
            mfa_secret="JBSWY3DPEHPK3PXP",
        )
        db.add(user)
        db.commit()

        # Step 1: Login returns MFA challenge
        resp = client.post("/api/v1/auth/login", json={
            "email": "mfa@test.com",
            "password": "password123",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["mfa_required"] is True
        assert "mfa_token" in data
        assert "access_token" not in data

        mfa_token = data["mfa_token"]

        # Step 2: Verify MFA code returns full tokens
        with patch("app.api.v1.routers.auth.MFAService.verify_totp", return_value=True):
            resp = client.post("/api/v1/auth/mfa/verify", json={
                "mfa_token": mfa_token,
                "code": "123456",
            })
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["email"] == "mfa@test.com"

    def test_mfa_verify_invalid_code(self, client, db, department):
        """Returns 401 with wrong MFA code."""
        user = User(
            id=uuid.uuid4(),
            full_name="MFA User2",
            email="mfa2@test.com",
            password_hash=hash_password("password123"),
            role="EMPLOYEE",
            department_id=department.id,
            mfa_enabled=True,
            mfa_secret="JBSWY3DPEHPK3PXP",
        )
        db.add(user)
        db.commit()

        mfa_token = create_mfa_token(str(user.id))

        with patch("app.api.v1.routers.auth.MFAService.verify_totp", return_value=False):
            resp = client.post("/api/v1/auth/mfa/verify", json={
                "mfa_token": mfa_token,
                "code": "000000",
            })
        assert resp.status_code == 401
        assert resp.json()["detail"]["error"] == "INVALID_MFA_CODE"


class TestMFADisable:
    def test_mfa_disable_success(self, client, db, employee_user, employee_headers):
        """DELETE /auth/mfa with correct password disables MFA."""
        employee_user.mfa_enabled = True
        employee_user.mfa_secret = "JBSWY3DPEHPK3PXP"
        db.commit()

        resp = client.request(
            "DELETE",
            "/api/v1/auth/mfa",
            json={"current_password": "password123"},
            headers=employee_headers,
        )
        assert resp.status_code == 200
        assert resp.json()["message"] == "MFA disabled successfully"

        db.refresh(employee_user)
        assert employee_user.mfa_enabled is False
        assert employee_user.mfa_secret is None

    def test_mfa_disable_wrong_password(self, client, db, employee_user, employee_headers):
        """Returns 400 with wrong password."""
        employee_user.mfa_enabled = True
        employee_user.mfa_secret = "JBSWY3DPEHPK3PXP"
        db.commit()

        resp = client.request(
            "DELETE",
            "/api/v1/auth/mfa",
            json={"current_password": "wrongpassword"},
            headers=employee_headers,
        )
        assert resp.status_code == 400
        assert resp.json()["detail"]["error"] == "INVALID_PASSWORD"

    def test_mfa_disable_not_enabled(self, client, employee_user, employee_headers):
        """Returns 400 when MFA is not enabled."""
        resp = client.request(
            "DELETE",
            "/api/v1/auth/mfa",
            json={"current_password": "password123"},
            headers=employee_headers,
        )
        assert resp.status_code == 400
        assert resp.json()["detail"]["error"] == "MFA_NOT_ENABLED"


class TestLoginWithoutMFA:
    def test_login_without_mfa(self, client, employee_user):
        """Normal login still works for users without MFA enabled."""
        resp = client.post("/api/v1/auth/login", json={
            "email": "employee@test.com",
            "password": "password123",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert "mfa_required" not in data
