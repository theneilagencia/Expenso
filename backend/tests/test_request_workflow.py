"""Comprehensive tests for request workflow: create, update, submit, approve, reject, etc."""

import uuid
from unittest.mock import patch

import pytest

from app.models.audit_log import AuditLog
from app.models.expense_request import ExpenseRequest
from app.models.notification import Notification
from app.models.request_version import RequestVersion
from app.models.sla_config import SLAConfig
from app.services.request_service import RequestService
from tests.conftest import TestingSessionLocal


@pytest.fixture
def sla_configs(db):
    configs = []
    for stage, value in [("PENDING_MANAGER", 48), ("PENDING_FINANCE", 24), ("IN_CORRECTION", 72)]:
        c = SLAConfig(
            id=uuid.uuid4(),
            stage=stage,
            value=value,
            unit="hours",
            reminder_1_pct=75,
            is_active=True,
        )
        db.add(c)
        configs.append(c)
    db.commit()
    return configs


@pytest.fixture
def draft_request(db, employee_user, category):
    req = ExpenseRequest(
        id=uuid.uuid4(),
        employee_id=employee_user.id,
        category_id=category.id,
        title="Test Expense",
        description="Business trip expenses",
        justification="Required for client meeting in São Paulo with the project team",
        amount=500.0,
        currency="BRL",
        vendor_name="Hotel ABC",
        status="DRAFT",
    )
    db.add(req)
    db.commit()
    db.refresh(req)
    return req


@pytest.fixture
def usd_draft(db, employee_user, category):
    req = ExpenseRequest(
        id=uuid.uuid4(),
        employee_id=employee_user.id,
        category_id=category.id,
        title="USD Expense",
        description="International purchase",
        justification="Required for cloud infrastructure services and tools renewal",
        amount=100.0,
        currency="USD",
        status="DRAFT",
    )
    db.add(req)
    db.commit()
    db.refresh(req)
    return req


@pytest.fixture
def short_justification_draft(db, employee_user, category):
    req = ExpenseRequest(
        id=uuid.uuid4(),
        employee_id=employee_user.id,
        category_id=category.id,
        title="Bad Justification",
        justification="short",
        amount=200.0,
        currency="BRL",
        status="DRAFT",
    )
    db.add(req)
    db.commit()
    db.refresh(req)
    return req


def _get_service():
    """Get a RequestService with its own session."""
    db = TestingSessionLocal()
    return RequestService(db), db


class TestCreateRequest:
    def test_create_draft(self, db, employee_user, category):
        service = RequestService(db)
        req = service.create(employee_user.id, {
            "title": "New Expense",
            "amount": 100.0,
            "currency": "BRL",
        })
        assert req.status == "DRAFT"
        assert req.employee_id == employee_user.id

    def test_create_with_category(self, db, employee_user, category):
        service = RequestService(db)
        req = service.create(employee_user.id, {
            "title": "Categorized",
            "amount": 250.0,
            "category_id": category.id,
        })
        assert str(req.category_id) == str(category.id)


class TestUpdateRequest:
    def test_update_draft(self, db, employee_user, draft_request):
        service = RequestService(db)
        updated = service.update(draft_request.id, employee_user.id, {"title": "Updated Title"})
        assert updated.title == "Updated Title"

    def test_cannot_update_others_request(self, db, manager_user, draft_request):
        service = RequestService(db)
        with pytest.raises(Exception):
            service.update(draft_request.id, manager_user.id, {"title": "Hacked"})

    def test_cannot_update_submitted_request(self, db, employee_user, draft_request):
        draft_request.status = "PENDING_AI"
        db.commit()
        service = RequestService(db)
        with pytest.raises(Exception):
            service.update(draft_request.id, employee_user.id, {"title": "Too late"})


class TestSubmitRequest:
    @patch("app.services.request_service.RequestService._dispatch_ai_task")
    def test_submit_validates_justification(self, mock_ai, db, employee_user, short_justification_draft, sla_configs):
        service = RequestService(db)
        with pytest.raises(Exception, match="Justification must be at least"):
            service.perform_action(
                short_justification_draft.id, "submit", employee_user.id, "EMPLOYEE"
            )

    @patch("app.services.request_service.RequestService._dispatch_ai_task")
    def test_submit_sets_submitted_at(self, mock_ai, db, employee_user, draft_request, sla_configs):
        service = RequestService(db)
        req = service.perform_action(draft_request.id, "submit", employee_user.id, "EMPLOYEE")
        assert req.status == "PENDING_AI"
        assert req.submitted_at is not None

    @patch("app.services.request_service.RequestService._dispatch_ai_task")
    def test_submit_sets_amount_brl(self, mock_ai, db, employee_user, usd_draft, sla_configs):
        service = RequestService(db)
        req = service.perform_action(usd_draft.id, "submit", employee_user.id, "EMPLOYEE")
        assert req.amount_brl is not None
        assert req.amount_brl > 0
        assert req.exchange_rate is not None
        assert req.exchange_rate > 1  # USD rate > 1

    @patch("app.services.request_service.RequestService._dispatch_ai_task")
    def test_submit_brl_rate_is_one(self, mock_ai, db, employee_user, draft_request, sla_configs):
        service = RequestService(db)
        req = service.perform_action(draft_request.id, "submit", employee_user.id, "EMPLOYEE")
        assert req.exchange_rate == 1.0
        assert req.amount_brl == req.amount

    @patch("app.services.request_service.RequestService._dispatch_ai_task")
    def test_submit_sets_sla_deadlines(self, mock_ai, db, employee_user, draft_request, sla_configs):
        service = RequestService(db)
        req = service.perform_action(draft_request.id, "submit", employee_user.id, "EMPLOYEE")
        assert req.manager_sla_due_at is not None
        assert req.finance_sla_due_at is not None

    @patch("app.services.request_service.RequestService._dispatch_ai_task")
    def test_submit_creates_notification_for_manager(self, mock_ai, db, employee_user, manager_user, draft_request, sla_configs):
        service = RequestService(db)
        service.perform_action(draft_request.id, "submit", employee_user.id, "EMPLOYEE")

        notifs = db.query(Notification).filter(
            Notification.request_id == draft_request.id,
            Notification.type == "NEW_PENDING_APPROVAL",
        ).all()
        assert len(notifs) == 1
        assert str(notifs[0].user_id) == str(manager_user.id)

    def test_only_owner_can_submit(self, db, manager_user, draft_request, sla_configs):
        service = RequestService(db)
        with pytest.raises(Exception, match="Only the request owner"):
            service.perform_action(draft_request.id, "submit", manager_user.id, "MANAGER")


class TestApproveRequest:
    def test_manager_can_approve_pending_manager(self, db, manager_user, draft_request):
        draft_request.status = "PENDING_MANAGER"
        db.commit()
        service = RequestService(db)
        req = service.perform_action(draft_request.id, "approve", manager_user.id, "MANAGER")
        assert req.status == "PENDING_FINANCE"

    def test_employee_cannot_approve(self, db, employee_user, draft_request):
        draft_request.status = "PENDING_MANAGER"
        db.commit()
        service = RequestService(db)
        with pytest.raises(Exception, match="Only managers"):
            service.perform_action(draft_request.id, "approve", employee_user.id, "EMPLOYEE")

    def test_finance_can_approve_pending_finance(self, db, finance_user, draft_request):
        draft_request.status = "PENDING_FINANCE"
        db.commit()
        service = RequestService(db)
        req = service.perform_action(draft_request.id, "approve", finance_user.id, "FINANCE")
        assert req.status == "IN_PAYMENT"

    def test_approve_notifies_employee(self, db, manager_user, employee_user, draft_request):
        draft_request.status = "PENDING_MANAGER"
        db.commit()
        service = RequestService(db)
        service.perform_action(draft_request.id, "approve", manager_user.id, "MANAGER")

        notifs = db.query(Notification).filter(
            Notification.request_id == draft_request.id,
            Notification.type == "REQUEST_APPROVED",
        ).all()
        assert len(notifs) == 1
        assert str(notifs[0].user_id) == str(employee_user.id)


class TestRejectRequest:
    def test_reject_requires_50_char_justification(self, db, manager_user, draft_request):
        draft_request.status = "PENDING_MANAGER"
        db.commit()
        service = RequestService(db)
        with pytest.raises(Exception, match="at least 50 characters"):
            service.perform_action(
                draft_request.id, "reject", manager_user.id, "MANAGER",
                justification="Too short",
            )

    def test_reject_with_valid_justification(self, db, manager_user, draft_request):
        draft_request.status = "PENDING_MANAGER"
        db.commit()
        service = RequestService(db)
        justification = "This expense does not comply with company policy and exceeds the allocated budget"
        req = service.perform_action(
            draft_request.id, "reject", manager_user.id, "MANAGER",
            justification=justification,
        )
        assert req.status == "REJECTED_MANAGER"

    def test_reject_notifies_employee(self, db, manager_user, employee_user, draft_request):
        draft_request.status = "PENDING_MANAGER"
        db.commit()
        service = RequestService(db)
        justification = "This expense does not comply with company policy and exceeds the allocated budget"
        service.perform_action(
            draft_request.id, "reject", manager_user.id, "MANAGER",
            justification=justification, comment=justification,
        )
        notifs = db.query(Notification).filter(
            Notification.request_id == draft_request.id,
            Notification.type == "REQUEST_REJECTED",
        ).all()
        assert len(notifs) == 1


class TestRequestEditAction:
    def test_request_edit_requires_30_char_comment(self, db, manager_user, draft_request):
        draft_request.status = "PENDING_MANAGER"
        db.commit()
        service = RequestService(db)
        with pytest.raises(Exception, match="at least 30 characters"):
            service.perform_action(
                draft_request.id, "request_edit", manager_user.id, "MANAGER",
                comment="Fix it",
            )

    def test_request_edit_creates_correction_status(self, db, manager_user, draft_request):
        draft_request.status = "PENDING_MANAGER"
        db.commit()
        service = RequestService(db)
        req = service.perform_action(
            draft_request.id, "request_edit", manager_user.id, "MANAGER",
            comment="Please update the vendor name and correct the amount to match the invoice",
        )
        assert req.status == "IN_CORRECTION"


class TestCancelRequest:
    def test_cancel_draft(self, db, employee_user, draft_request):
        service = RequestService(db)
        req = service.perform_action(draft_request.id, "cancel", employee_user.id, "EMPLOYEE")
        assert req.status == "CANCELLED"

    def test_only_owner_can_cancel(self, db, manager_user, draft_request):
        service = RequestService(db)
        with pytest.raises(Exception, match="Only the request owner"):
            service.perform_action(draft_request.id, "cancel", manager_user.id, "MANAGER")


class TestAuditLogAndVersions:
    @patch("app.services.request_service.RequestService._dispatch_ai_task")
    def test_submit_creates_audit_log(self, mock_ai, db, employee_user, draft_request, sla_configs):
        service = RequestService(db)
        service.perform_action(draft_request.id, "submit", employee_user.id, "EMPLOYEE")

        logs = db.query(AuditLog).filter(AuditLog.request_id == draft_request.id).all()
        assert len(logs) >= 1
        assert logs[0].action == "submit"
        assert logs[0].previous_status == "DRAFT"
        assert logs[0].new_status == "PENDING_AI"

    @patch("app.services.request_service.RequestService._dispatch_ai_task")
    def test_submit_creates_version_snapshot(self, mock_ai, db, employee_user, draft_request, sla_configs):
        service = RequestService(db)
        service.perform_action(draft_request.id, "submit", employee_user.id, "EMPLOYEE")

        versions = db.query(RequestVersion).filter(RequestVersion.request_id == draft_request.id).all()
        assert len(versions) >= 1
        assert versions[0].change_reason == "submit"

    def test_reject_creates_audit_log(self, db, manager_user, draft_request):
        draft_request.status = "PENDING_MANAGER"
        db.commit()
        service = RequestService(db)
        justification = "This expense does not comply with company policy and exceeds the allocated budget"
        service.perform_action(
            draft_request.id, "reject", manager_user.id, "MANAGER",
            justification=justification,
        )
        logs = db.query(AuditLog).filter(AuditLog.request_id == draft_request.id).all()
        assert any(log.action == "reject" for log in logs)


class TestFullHappyPath:
    @patch("app.services.request_service.RequestService._dispatch_ai_task")
    def test_draft_to_paid(self, mock_ai, db, employee_user, manager_user, finance_user, draft_request, sla_configs):
        service = RequestService(db)

        # 1. Submit → PENDING_AI
        req = service.perform_action(draft_request.id, "submit", employee_user.id, "EMPLOYEE")
        assert req.status == "PENDING_AI"

        # 2. Simulate AI → PENDING_MANAGER
        req.status = "PENDING_MANAGER"
        db.commit()

        # 3. Manager approves → PENDING_FINANCE
        req = service.perform_action(draft_request.id, "approve", manager_user.id, "MANAGER")
        assert req.status == "PENDING_FINANCE"

        # 4. Finance approves → IN_PAYMENT
        req = service.perform_action(draft_request.id, "approve", finance_user.id, "FINANCE")
        assert req.status == "IN_PAYMENT"

        # 5. Confirm payment → PAID
        req = service.perform_action(draft_request.id, "confirm_payment", finance_user.id, "FINANCE")
        assert req.status == "PAID"

        # Verify audit trail
        logs = db.query(AuditLog).filter(AuditLog.request_id == draft_request.id).order_by(AuditLog.created_at.asc()).all()
        assert len(logs) >= 4
        actions = [log.action for log in logs]
        assert "submit" in actions
        assert "approve" in actions
        assert "confirm_payment" in actions


class TestOptionsEndpoints:
    def test_list_categories(self, client, employee_headers, category):
        resp = client.get("/api/v1/requests/options/categories", headers=employee_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) >= 1
        assert data[0]["name"] == "Travel"

    def test_list_cost_centers(self, client, employee_headers, db):
        from app.models.cost_center import CostCenter
        cc = CostCenter(id=uuid.uuid4(), name="Engineering", code="ENG", is_active=True)
        db.add(cc)
        db.commit()

        resp = client.get("/api/v1/requests/options/cost-centers", headers=employee_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) >= 1
        assert data[0]["code"] == "ENG"

    def test_options_require_auth(self, client):
        resp = client.get("/api/v1/requests/options/categories")
        assert resp.status_code in (401, 403)
