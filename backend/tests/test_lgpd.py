"""Tests for LGPD endpoints — data export, account deletion, anonymization."""

import json
import uuid
import zipfile
from io import BytesIO

from app.models.expense_request import ExpenseRequest
from app.models.notification import Notification
from app.models.user import User


class TestDataExport:
    """Tests for GET /api/v1/users/me/data-export."""

    def test_data_export_returns_processing_or_zip(self, client, employee_headers):
        """Data export endpoint returns either processing status or zip file."""
        resp = client.get("/api/v1/users/me/data-export", headers=employee_headers)
        assert resp.status_code == 200

        content_type = resp.headers.get("content-type", "")
        if "application/zip" in content_type:
            # Synchronous fallback — returned a zip file
            assert len(resp.content) > 0
        else:
            # Celery task dispatched — returns JSON status
            data = resp.json()
            assert data["status"] == "processing"
            assert "message" in data


class TestDeleteAccount:
    """Tests for DELETE /api/v1/users/me."""

    def test_wrong_password_returns_400(self, client, employee_headers):
        """DELETE with wrong password returns 400."""
        resp = client.request(
            "DELETE",
            "/api/v1/users/me",
            headers=employee_headers,
            json={"current_password": "wrong-password"},
        )
        assert resp.status_code == 400
        assert "incorrect" in resp.json()["detail"].lower()

    def test_manager_cannot_self_delete(self, client, manager_headers):
        """Managers cannot self-delete — returns 403."""
        resp = client.request(
            "DELETE",
            "/api/v1/users/me",
            headers=manager_headers,
            json={"current_password": "password123"},
        )
        assert resp.status_code == 403

    def test_finance_cannot_self_delete(self, client, finance_headers):
        """Finance users cannot self-delete — returns 403."""
        resp = client.request(
            "DELETE",
            "/api/v1/users/me",
            headers=finance_headers,
            json={"current_password": "password123"},
        )
        assert resp.status_code == 403

    def test_admin_cannot_self_delete(self, client, admin_headers):
        """Admins cannot self-delete — returns 403."""
        resp = client.request(
            "DELETE",
            "/api/v1/users/me",
            headers=admin_headers,
            json={"current_password": "password123"},
        )
        assert resp.status_code == 403

    def test_employee_self_delete_anonymizes(self, client, db, employee_user, employee_headers):
        """Employee self-delete anonymizes user data."""
        original_email = employee_user.email

        resp = client.request(
            "DELETE",
            "/api/v1/users/me",
            headers=employee_headers,
            json={"current_password": "password123"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "deleted"

        # Verify anonymization in DB
        db.expire_all()
        user = db.query(User).filter(User.id == employee_user.id).first()
        assert user is not None
        assert user.full_name == "Deleted User"
        assert user.email != original_email
        assert user.email.endswith("@deleted.expenso.io")
        assert user.password_hash == "DELETED"
        assert user.status == "INACTIVE"
        assert user.deleted_at is not None
        assert user.pix_key is None

    def test_employee_self_delete_cancels_active_requests(
        self, client, db, employee_user, employee_headers, category
    ):
        """Employee self-delete cancels all active (non-terminal) requests."""
        # Create active requests
        for req_status in ("DRAFT", "PENDING_AI", "PENDING_MANAGER"):
            req = ExpenseRequest(
                id=uuid.uuid4(),
                employee_id=employee_user.id,
                category_id=category.id,
                title=f"Active {req_status}",
                amount=100.0,
                currency="BRL",
                status=req_status,
            )
            db.add(req)

        # Create a terminal request that should NOT be cancelled
        paid_req = ExpenseRequest(
            id=uuid.uuid4(),
            employee_id=employee_user.id,
            category_id=category.id,
            title="Already Paid",
            amount=500.0,
            currency="BRL",
            status="PAID",
        )
        db.add(paid_req)
        db.commit()

        resp = client.request(
            "DELETE",
            "/api/v1/users/me",
            headers=employee_headers,
            json={"current_password": "password123"},
        )
        assert resp.status_code == 200

        # Verify active requests are cancelled
        db.expire_all()
        cancelled = (
            db.query(ExpenseRequest)
            .filter(
                ExpenseRequest.employee_id == employee_user.id,
                ExpenseRequest.status == "CANCELLED",
            )
            .count()
        )
        assert cancelled == 3

        # Verify PAID request is NOT cancelled
        db.expire_all()
        paid = db.query(ExpenseRequest).filter(ExpenseRequest.id == paid_req.id).first()
        assert paid.status == "PAID"


class TestDataExportService:
    """Tests for data_export_service.build_user_data_zip."""

    def test_builds_valid_zip(self, db, employee_user, category):
        """build_user_data_zip produces a valid zip archive with expected files."""
        # Create some data for the user
        req = ExpenseRequest(
            id=uuid.uuid4(),
            employee_id=employee_user.id,
            category_id=category.id,
            title="Test Expense",
            amount=200.0,
            currency="BRL",
            status="PAID",
        )
        db.add(req)

        notif = Notification(
            id=uuid.uuid4(),
            user_id=employee_user.id,
            type="STATUS_CHANGE",
            title="Request Approved",
            body="Your request was approved",
        )
        db.add(notif)
        db.commit()

        from app.services.data_export_service import build_user_data_zip

        zip_bytes = build_user_data_zip(str(employee_user.id), db)
        assert isinstance(zip_bytes, bytes)
        assert len(zip_bytes) > 0

        # Verify it is a valid zip
        buf = BytesIO(zip_bytes)
        with zipfile.ZipFile(buf, "r") as zf:
            names = zf.namelist()
            assert "profile.json" in names
            assert "expense_requests.json" in names
            assert "audit_logs.json" in names
            assert "notifications.json" in names

            # Verify profile content
            profile = json.loads(zf.read("profile.json"))
            assert profile["email"] == employee_user.email
            assert profile["full_name"] == employee_user.full_name

            # Verify expense requests content
            requests_data = json.loads(zf.read("expense_requests.json"))
            assert len(requests_data) == 1
            assert requests_data[0]["title"] == "Test Expense"

    def test_builds_zip_for_user_with_no_data(self, db, employee_user):
        """build_user_data_zip works for a user with no expenses/notifications."""
        from app.services.data_export_service import build_user_data_zip

        zip_bytes = build_user_data_zip(str(employee_user.id), db)
        assert isinstance(zip_bytes, bytes)
        assert len(zip_bytes) > 0

        buf = BytesIO(zip_bytes)
        with zipfile.ZipFile(buf, "r") as zf:
            names = zf.namelist()
            assert "profile.json" in names

            requests_data = json.loads(zf.read("expense_requests.json"))
            assert requests_data == []
