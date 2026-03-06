"""Tests for batch payment processing — service and endpoint."""

import uuid
from unittest.mock import MagicMock, patch

from app.models.expense_request import ExpenseRequest
from app.models.payment import Payment
from app.services.payment_service import PaymentService


class TestBatchPaymentService:
    """Tests for PaymentService.batch_process."""

    def _make_request(self, db, employee_user, category, status="PENDING_FINANCE"):
        req = ExpenseRequest(
            id=uuid.uuid4(), employee_id=employee_user.id, category_id=category.id,
            title="Batch Test", amount=500.0, currency="BRL", status=status,
            current_version=1,
        )
        db.add(req)
        db.commit()
        db.refresh(req)
        return req

    def test_batch_pix_marks_paid_immediately(self, db, employee_user, finance_user, category):
        """PIX batch payments complete immediately."""
        req = self._make_request(db, employee_user, category, status="IN_PAYMENT")

        service = PaymentService(db)
        result = service.batch_process(
            request_ids=[str(req.id)],
            processed_by=finance_user.id,
            method="PIX",
        )

        assert len(result["processed"]) == 1
        assert len(result["failed"]) == 0
        assert result["total_amount"] == 500.0

        payment = db.query(Payment).filter(Payment.request_id == req.id).first()
        assert payment is not None
        assert payment.revolut_status == "completed"
        assert payment.method == "PIX"

    def test_batch_revolut_dispatches_tasks(self, db, employee_user, finance_user, category):
        """REVOLUT batch creates PROCESSING payments and dispatches tasks."""
        req = self._make_request(db, employee_user, category, status="IN_PAYMENT")

        mock_task = MagicMock()
        with patch.dict("sys.modules", {
            "app.workers.tasks.payment_tasks": MagicMock(process_payment=mock_task),
        }):
            service = PaymentService(db)
            result = service.batch_process(
                request_ids=[str(req.id)],
                processed_by=finance_user.id,
                method="REVOLUT",
            )

        assert len(result["processed"]) == 1
        payment = db.query(Payment).filter(Payment.request_id == req.id).first()
        assert payment is not None
        assert payment.revolut_status == "PROCESSING"

    def test_batch_invalid_request_reported_as_failed(self, db, finance_user):
        """Non-existent request_ids are reported as failed."""
        service = PaymentService(db)
        result = service.batch_process(
            request_ids=[str(uuid.uuid4())],
            processed_by=finance_user.id,
            method="PIX",
        )

        assert len(result["processed"]) == 0
        assert len(result["failed"]) == 1
        assert "not found" in result["failed"][0]["error"].lower()

    def test_batch_wrong_status_reported(self, db, employee_user, finance_user, category):
        """Requests in wrong status are reported as failed."""
        req = self._make_request(db, employee_user, category, status="DRAFT")

        service = PaymentService(db)
        result = service.batch_process(
            request_ids=[str(req.id)],
            processed_by=finance_user.id,
            method="PIX",
        )

        assert len(result["failed"]) == 1
        assert "invalid status" in result["failed"][0]["error"].lower()

    def test_batch_duplicate_payment_reported(self, db, employee_user, finance_user, category):
        """If a payment already exists, it's reported as failed."""
        req = self._make_request(db, employee_user, category, status="IN_PAYMENT")
        db.add(Payment(
            id=uuid.uuid4(), request_id=req.id, processed_by=finance_user.id,
            method="PIX", amount_paid=500.0, currency_paid="BRL",
        ))
        db.commit()

        service = PaymentService(db)
        result = service.batch_process(
            request_ids=[str(req.id)],
            processed_by=finance_user.id,
            method="PIX",
        )

        assert len(result["failed"]) == 1
        assert "already exists" in result["failed"][0]["error"].lower()


class TestBatchPaymentEndpoint:
    """Tests for POST /api/v1/payments/batch."""

    def test_batch_requires_finance(self, client, employee_headers):
        """Employees cannot batch process payments."""
        resp = client.post(
            "/api/v1/payments/batch",
            json={"request_ids": [], "method": "PIX"},
            headers=employee_headers,
        )
        assert resp.status_code == 403

    def test_batch_empty_ids_rejected(self, client, finance_headers):
        """Empty request_ids returns validation error."""
        resp = client.post(
            "/api/v1/payments/batch",
            json={"request_ids": [], "method": "PIX"},
            headers=finance_headers,
        )
        assert resp.status_code == 422
