"""Tests for SLA service — deadline calculation, violation detection, warnings."""

import uuid
from datetime import datetime, timedelta, timezone

import pytest

from app.models.expense_request import ExpenseRequest
from app.models.notification import Notification
from app.models.sla_config import SLAConfig
from app.services.sla_service import SLAService


@pytest.fixture
def sla_config_manager(db):
    c = SLAConfig(
        id=uuid.uuid4(),
        stage="PENDING_MANAGER",
        value=48,
        unit="hours",
        reminder_1_pct=75,
        is_active=True,
    )
    db.add(c)
    db.commit()
    return c


@pytest.fixture
def sla_config_finance(db):
    c = SLAConfig(
        id=uuid.uuid4(),
        stage="PENDING_FINANCE",
        value=24,
        unit="hours",
        reminder_1_pct=75,
        is_active=True,
    )
    db.add(c)
    db.commit()
    return c


@pytest.fixture
def pending_request(db, employee_user, category):
    req = ExpenseRequest(
        id=uuid.uuid4(),
        employee_id=employee_user.id,
        category_id=category.id,
        title="SLA Test Request",
        amount=200.0,
        currency="BRL",
        status="PENDING_MANAGER",
    )
    db.add(req)
    db.commit()
    db.refresh(req)
    return req


class TestApplySLA:
    def test_sets_manager_deadline(self, db, pending_request, sla_config_manager):
        SLAService.apply_sla(pending_request.id, db)
        db.refresh(pending_request)
        assert pending_request.manager_sla_due_at is not None

    def test_no_sla_config_does_nothing(self, db, pending_request):
        SLAService.apply_sla(pending_request.id, db)
        db.refresh(pending_request)
        assert pending_request.manager_sla_due_at is None

    def test_nonexistent_request(self, db):
        SLAService.apply_sla(uuid.uuid4(), db)


class TestSetDeadlinesOnSubmit:
    def test_sets_all_deadlines(self, db, pending_request, sla_config_manager, sla_config_finance):
        SLAService.set_deadlines_on_submit(pending_request, db)
        assert pending_request.manager_sla_due_at is not None
        assert pending_request.finance_sla_due_at is not None


class TestCheckViolations:
    def test_finds_overdue_requests(self, db, pending_request, sla_config_manager):
        now = datetime.now(timezone.utc)
        pending_request.manager_sla_due_at = now - timedelta(hours=2)
        db.commit()

        violations = SLAService.check_sla_violations(db)
        assert len(violations) >= 1
        assert violations[0]["request_id"] == str(pending_request.id)
        assert violations[0]["overdue_hours"] > 0

    def test_no_violations_when_within_deadline(self, db, pending_request, sla_config_manager):
        now = datetime.now(timezone.utc)
        pending_request.manager_sla_due_at = now + timedelta(hours=24)
        db.commit()

        violations = SLAService.check_sla_violations(db)
        overdue = [v for v in violations if v["request_id"] == str(pending_request.id)]
        assert len(overdue) == 0


class TestCreateNotifications:
    def test_creates_overdue_notification(self, db, pending_request, sla_config_manager):
        now = datetime.now(timezone.utc)
        pending_request.manager_sla_due_at = now - timedelta(hours=5)
        db.commit()

        count = SLAService.create_sla_notifications(db)
        assert count >= 1

        notifs = db.query(Notification).filter(
            Notification.request_id == pending_request.id,
            Notification.type == "SLA_OVERDUE",
        ).all()
        assert len(notifs) == 1

    def test_no_duplicate_notifications(self, db, pending_request, sla_config_manager):
        now = datetime.now(timezone.utc)
        pending_request.manager_sla_due_at = now - timedelta(hours=5)
        db.commit()

        SLAService.create_sla_notifications(db)
        SLAService.create_sla_notifications(db)

        notifs = db.query(Notification).filter(
            Notification.request_id == pending_request.id,
            Notification.type == "SLA_OVERDUE",
        ).all()
        assert len(notifs) == 1
