"""Tests for payment service — initiate, gateway processing, retries, and endpoints."""

import uuid
from datetime import datetime, timedelta, timezone
from unittest.mock import MagicMock, patch

import pytest

from app.core.exceptions import NotFoundError, ValidationError
from app.models.expense_request import ExpenseRequest
from app.models.payment import Payment
from app.services.payment_service import PaymentService


class TestPaymentService:
    """Tests for PaymentService."""

    def _make_in_payment_request(self, db, employee_user, category):
        req = ExpenseRequest(
            id=uuid.uuid4(), employee_id=employee_user.id, category_id=category.id,
            title="Payment Test", amount=1000.0, currency="BRL", status="IN_PAYMENT",
            current_version=1,
        )
        db.add(req)
        db.commit()
        db.refresh(req)
        return req

    def test_initiate_payment_creates_processing_record(self, db, employee_user, finance_user, category):
        """Initiating a payment creates a PROCESSING record and dispatches task."""
        req = self._make_in_payment_request(db, employee_user, category)

        mock_task = MagicMock()
        with patch.dict("sys.modules", {
            "app.workers.tasks.payment_tasks": MagicMock(process_payment=mock_task),
        }):
            service = PaymentService(db)
            payment = service.initiate_payment(
                request_id=req.id, processed_by=finance_user.id,
                method="bank_transfer", notes="Test payment"
            )

        assert payment is not None
        assert payment.revolut_status == "PROCESSING"
        assert payment.amount_paid == 1000.0
        assert payment.method == "bank_transfer"
        assert payment.currency_paid == "BRL"

    def test_initiate_payment_wrong_status(self, db, employee_user, finance_user, category):
        """Cannot initiate payment on a request that is not IN_PAYMENT."""
        req = ExpenseRequest(
            id=uuid.uuid4(), employee_id=employee_user.id, category_id=category.id,
            title="Wrong Status", amount=500.0, currency="BRL", status="DRAFT",
        )
        db.add(req)
        db.commit()

        service = PaymentService(db)
        with pytest.raises(ValidationError):
            service.initiate_payment(req.id, finance_user.id, "bank_transfer")

    def test_initiate_payment_duplicate(self, db, employee_user, finance_user, category):
        """Cannot create a second payment for the same request."""
        req = self._make_in_payment_request(db, employee_user, category)
        db.add(Payment(
            id=uuid.uuid4(), request_id=req.id, processed_by=finance_user.id,
            method="bank_transfer", amount_paid=1000.0, currency_paid="BRL",
        ))
        db.commit()

        service = PaymentService(db)
        with pytest.raises(ValidationError, match="already exists"):
            service.initiate_payment(req.id, finance_user.id, "bank_transfer")

    def test_initiate_payment_not_found(self, db, finance_user):
        """Cannot initiate payment for a non-existent request."""
        service = PaymentService(db)
        with pytest.raises(NotFoundError):
            service.initiate_payment(uuid.uuid4(), finance_user.id, "bank_transfer")

    def test_initiate_payment_sets_currency_from_request(self, db, employee_user, finance_user, category):
        """Payment inherits currency from the expense request."""
        req = ExpenseRequest(
            id=uuid.uuid4(), employee_id=employee_user.id, category_id=category.id,
            title="USD Payment", amount=250.0, currency="USD", status="IN_PAYMENT",
            current_version=1,
        )
        db.add(req)
        db.commit()
        db.refresh(req)

        mock_task = MagicMock()
        with patch.dict("sys.modules", {
            "app.workers.tasks.payment_tasks": MagicMock(process_payment=mock_task),
        }):
            service = PaymentService(db)
            payment = service.initiate_payment(req.id, finance_user.id, "pix")

        assert payment.currency_paid == "USD"
        assert payment.amount_paid == 250.0

    def test_process_via_gateway_success(self, db, employee_user, finance_user, category):
        """Successful gateway processing updates payment and transitions request."""
        req = self._make_in_payment_request(db, employee_user, category)
        payment = Payment(
            id=uuid.uuid4(), request_id=req.id, processed_by=finance_user.id,
            method="bank_transfer", amount_paid=1000.0, currency_paid="BRL",
            revolut_status="PROCESSING",
        )
        db.add(payment)
        db.commit()
        db.refresh(payment)

        mock_gateway = MagicMock()
        mock_gateway.send_payment.return_value = {
            "provider_id": "mock_abc123",
            "status": "completed",
            "raw_response": {"id": "mock_abc123", "state": "completed"},
        }

        with patch("app.services.payment_service.get_gateway", return_value=mock_gateway), \
             patch("app.services.request_service.RequestService.perform_action"):
            service = PaymentService(db)
            # Use string payment.id (after refresh, SQLite stores as string)
            result = service.process_via_gateway(payment.id)

        assert result.revolut_payment_id == "mock_abc123"
        assert result.revolut_status == "completed"
        assert result.payment_date is not None

    def test_process_via_gateway_failure_increments_retry(self, db, employee_user, finance_user, category):
        """Gateway failure increments retry count and stores error."""
        req = self._make_in_payment_request(db, employee_user, category)
        payment = Payment(
            id=uuid.uuid4(), request_id=req.id, processed_by=finance_user.id,
            method="bank_transfer", amount_paid=1000.0, currency_paid="BRL",
            revolut_status="PROCESSING", retry_count=0,
        )
        db.add(payment)
        db.commit()
        db.refresh(payment)

        mock_gateway = MagicMock()
        mock_gateway.send_payment.side_effect = Exception("Gateway error")

        with patch("app.services.payment_service.get_gateway", return_value=mock_gateway), \
             pytest.raises(Exception, match="Gateway error"):
            service = PaymentService(db)
            service.process_via_gateway(payment.id)

        db.refresh(payment)
        assert payment.retry_count == 1
        assert payment.last_error == "Gateway error"
        assert payment.revolut_status == "FAILED"
        assert payment.next_retry_at is not None

    def test_retry_failed_picks_eligible(self, db, employee_user, finance_user, category):
        """retry_failed dispatches tasks for eligible failed payments."""
        req = self._make_in_payment_request(db, employee_user, category)
        payment = Payment(
            id=uuid.uuid4(), request_id=req.id, processed_by=finance_user.id,
            method="bank_transfer", amount_paid=1000.0, currency_paid="BRL",
            revolut_status="FAILED", retry_count=1,
            next_retry_at=datetime.now(timezone.utc) - timedelta(minutes=1),
        )
        db.add(payment)
        db.commit()

        mock_task = MagicMock()
        with patch.dict("sys.modules", {
            "app.workers.tasks.payment_tasks": MagicMock(process_payment=mock_task),
        }):
            service = PaymentService(db)
            count = service.retry_failed()

        assert count == 1

    def test_retry_failed_skips_max_retries(self, db, employee_user, finance_user, category):
        """retry_failed does not dispatch payments that exceeded max retries."""
        req = self._make_in_payment_request(db, employee_user, category)
        payment = Payment(
            id=uuid.uuid4(), request_id=req.id, processed_by=finance_user.id,
            method="bank_transfer", amount_paid=1000.0, currency_paid="BRL",
            revolut_status="FAILED", retry_count=10,
            next_retry_at=datetime.now(timezone.utc) - timedelta(minutes=1),
        )
        db.add(payment)
        db.commit()

        mock_task = MagicMock()
        with patch.dict("sys.modules", {
            "app.workers.tasks.payment_tasks": MagicMock(process_payment=mock_task),
        }):
            service = PaymentService(db)
            count = service.retry_failed()

        assert count == 0
        mock_task.delay.assert_not_called()

    def test_retry_failed_skips_not_yet_due(self, db, employee_user, finance_user, category):
        """retry_failed does not dispatch payments whose next_retry_at is in the future."""
        req = self._make_in_payment_request(db, employee_user, category)
        payment = Payment(
            id=uuid.uuid4(), request_id=req.id, processed_by=finance_user.id,
            method="bank_transfer", amount_paid=1000.0, currency_paid="BRL",
            revolut_status="FAILED", retry_count=1,
            next_retry_at=datetime.now(timezone.utc) + timedelta(hours=1),
        )
        db.add(payment)
        db.commit()

        mock_task = MagicMock()
        with patch.dict("sys.modules", {
            "app.workers.tasks.payment_tasks": MagicMock(process_payment=mock_task),
        }):
            service = PaymentService(db)
            count = service.retry_failed()

        assert count == 0
        mock_task.delay.assert_not_called()


class TestPaymentEndpoints:
    """Tests for payment API endpoints (role / auth checks)."""

    def _make_in_payment_request(self, db, employee_user, category):
        req = ExpenseRequest(
            id=uuid.uuid4(), employee_id=employee_user.id, category_id=category.id,
            title="Payment Test", amount=1000.0, currency="BRL", status="IN_PAYMENT",
            current_version=1,
        )
        db.add(req)
        db.commit()
        db.refresh(req)
        return req

    def test_employee_cannot_create_payment(self, db, client, employee_user, employee_headers, category):
        """Employees are forbidden from creating payments."""
        req = self._make_in_payment_request(db, employee_user, category)
        resp = client.post(
            f"/api/v1/payments/{req.id}",
            json={"method": "bank_transfer"},
            headers=employee_headers,
        )
        assert resp.status_code == 403

    def test_unauthenticated_cannot_create_payment(self, db, client, employee_user, category):
        """Unauthenticated request is rejected."""
        req = self._make_in_payment_request(db, employee_user, category)
        resp = client.post(
            f"/api/v1/payments/{req.id}",
            json={"method": "bank_transfer"},
        )
        assert resp.status_code == 403

    def test_list_payments_requires_finance_role(self, client, employee_headers):
        """Only FINANCE/ADMIN can list payments."""
        resp = client.get("/api/v1/payments", headers=employee_headers)
        assert resp.status_code == 403

    def test_list_payments_finance_allowed(self, client, finance_headers):
        """FINANCE users can list payments (empty list is OK)."""
        resp = client.get("/api/v1/payments", headers=finance_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert "data" in data
        assert "total" in data
