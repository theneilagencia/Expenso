"""Tests for enhanced payment endpoints — filters, webhook HMAC, status poll, XLSX."""

import hashlib
import hmac
import json
import uuid
from unittest.mock import patch

from app.models.expense_request import ExpenseRequest
from app.models.payment import Payment


class TestPaymentListFilters:
    """Tests for GET /api/v1/payments with filters."""

    def _make_payment(self, db, employee_user, category, status="completed", method="PIX"):
        req = ExpenseRequest(
            id=uuid.uuid4(), employee_id=employee_user.id, category_id=category.id,
            title="Filtered Test", amount=300.0, currency="BRL", status="PAID",
        )
        db.add(req)
        db.commit()

        payment = Payment(
            id=uuid.uuid4(), request_id=req.id,
            method=method, amount_paid=300.0, currency_paid="BRL",
            revolut_status=status,
        )
        db.add(payment)
        db.commit()
        return payment

    def test_filter_by_status(self, client, db, employee_user, category, finance_headers):
        """Filtering payments by status works."""
        self._make_payment(db, employee_user, category, status="FAILED")
        self._make_payment(db, employee_user, category, status="completed")

        resp = client.get("/api/v1/payments?status=FAILED", headers=finance_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert all(p["status"] == "FAILED" for p in data["data"])

    def test_filter_by_method(self, client, db, employee_user, category, finance_headers):
        """Filtering payments by method works."""
        self._make_payment(db, employee_user, category, method="REVOLUT")
        self._make_payment(db, employee_user, category, method="PIX")

        resp = client.get("/api/v1/payments?method=REVOLUT", headers=finance_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert all(p["method"] == "REVOLUT" for p in data["data"])

    def test_enriched_response_fields(self, client, db, employee_user, category, finance_headers):
        """Response includes enriched fields like request_title and requester_name."""
        self._make_payment(db, employee_user, category)

        resp = client.get("/api/v1/payments", headers=finance_headers)
        assert resp.status_code == 200
        data = resp.json()
        if data["data"]:
            p = data["data"][0]
            assert "request_title" in p
            assert "requester_name" in p
            assert "department" in p
            assert "category" in p


class TestWebhookHMAC:
    """Tests for webhook HMAC validation."""

    def test_webhook_with_valid_signature(self, client, db, employee_user, category):
        """Webhook with valid HMAC signature is accepted."""
        req = ExpenseRequest(
            id=uuid.uuid4(), employee_id=employee_user.id, category_id=category.id,
            title="Webhook Test", amount=100.0, currency="BRL", status="IN_PAYMENT",
        )
        db.add(req)
        db.commit()

        payment = Payment(
            id=uuid.uuid4(), request_id=req.id,
            method="REVOLUT", amount_paid=100.0, currency_paid="BRL",
            revolut_payment_id="rev_123", revolut_status="PROCESSING",
        )
        db.add(payment)
        db.commit()

        secret = "test-secret"
        body = json.dumps({"id": "rev_123", "state": "completed"}).encode()
        sig = hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()

        with patch("app.api.v1.routers.payments.settings") as mock_settings:
            mock_settings.REVOLUT_WEBHOOK_SECRET = secret
            mock_settings.PAYMENT_MAX_RETRIES = 3
            mock_settings.PAYMENT_RETRY_DELAY_MINUTES = 15

            with patch("app.services.request_service.RequestService.perform_action"):
                resp = client.post(
                    "/api/v1/payments/webhook/revolut",
                    content=body,
                    headers={"Content-Type": "application/json", "Revolut-Signature": sig},
                )

        assert resp.status_code == 200
        data = resp.json()
        assert data.get("status") == "ok"

    def test_webhook_invalid_signature_rejected(self, client):
        """Webhook with invalid signature is rejected."""
        body = json.dumps({"id": "rev_123", "state": "completed"}).encode()

        with patch("app.api.v1.routers.payments.settings") as mock_settings:
            mock_settings.REVOLUT_WEBHOOK_SECRET = "real-secret"

            resp = client.post(
                "/api/v1/payments/webhook/revolut",
                content=body,
                headers={"Content-Type": "application/json", "Revolut-Signature": "wrong-sig"},
            )

        assert resp.status_code == 200
        data = resp.json()
        assert "error" in data


class TestPaymentStatusPoll:
    """Tests for Celery beat schedule entry."""

    def test_beat_schedule_contains_status_poll(self):
        """Payment status poll is registered in the Celery beat schedule."""
        from pathlib import Path

        celery_app_path = Path(__file__).resolve().parent.parent / "app" / "workers" / "celery_app.py"
        source = celery_app_path.read_text()

        assert "payment-status-poll-10min" in source
        assert "poll_payment_status" in source
        assert "600" in source


class TestXlsxExport:
    """Tests for XLSX payment export."""

    def test_xlsx_export_returns_xlsx_content_type(self, client, finance_headers):
        """GET /api/v1/payments/export/xlsx returns XLSX content-type."""
        resp = client.get("/api/v1/payments/export/xlsx", headers=finance_headers)
        assert resp.status_code == 200
        ct = resp.headers.get("content-type", "")
        assert "spreadsheetml" in ct or "application/" in ct

    def test_xlsx_export_requires_finance(self, client, employee_headers):
        """Employees cannot export XLSX."""
        resp = client.get("/api/v1/payments/export/xlsx", headers=employee_headers)
        assert resp.status_code == 403
