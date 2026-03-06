"""Tests for strategist analysis — Celery task and API endpoint."""

import json
import sys
import uuid
from datetime import datetime, timezone
from types import ModuleType
from unittest.mock import MagicMock, patch

from app.models.ai_analysis_log import AIAnalysisLog
from app.models.department import Department
from app.models.expense_request import ExpenseRequest
from app.models.user import User

# ---------------------------------------------------------------------------
# Helper: import and execute run_strategist_analysis with Celery mocked
# ---------------------------------------------------------------------------

def _run_strategist(db, api_key="", mock_anthropic_client=None):
    """Import and invoke run_strategist_analysis with Celery fully mocked.

    Celery is not installed in the test environment, so we pre-inject stub
    modules into sys.modules before importing the task module.
    """
    # 1) Build lightweight stubs for celery and celery_app
    fake_celery_mod = ModuleType("celery")
    fake_celery_app_mod = ModuleType("app.workers.celery_app")

    fake_app = MagicMock()
    # @celery_app.task() must act as a passthrough decorator
    fake_app.task = lambda *a, **kw: (lambda fn: fn)
    fake_celery_mod.Celery = MagicMock(return_value=fake_app)
    fake_celery_app_mod.celery_app = fake_app

    saved = {}
    mods_to_inject = {
        "celery": fake_celery_mod,
        "app.workers.celery_app": fake_celery_app_mod,
    }
    for key, mod in mods_to_inject.items():
        saved[key] = sys.modules.get(key)
        sys.modules[key] = mod

    # Remove cached task module so it re-imports with our stubs
    task_key = "app.workers.tasks.ai_tasks"
    saved[task_key] = sys.modules.pop(task_key, None)

    try:
        import importlib

        import app.workers.tasks.ai_tasks as ai_mod
        importlib.reload(ai_mod)

        # 2) Patch SessionLocal so it returns the test session (without closing)
        mock_session = MagicMock(wraps=db)
        mock_session.close = MagicMock()  # no-op close

        # 3) Patch settings.ANTHROPIC_API_KEY inside the function's import scope
        with patch("app.config.settings") as mock_settings, \
             patch.object(ai_mod, "SessionLocal", return_value=mock_session):

            # Copy real settings values but override API key
            mock_settings.ANTHROPIC_API_KEY = api_key

            if mock_anthropic_client and api_key:
                with patch("anthropic.Anthropic", return_value=mock_anthropic_client):
                    result = ai_mod.run_strategist_analysis()
            else:
                result = ai_mod.run_strategist_analysis()

        return result
    finally:
        for key, orig in saved.items():
            if orig is None:
                sys.modules.pop(key, None)
            else:
                sys.modules[key] = orig


class TestStrategistTask:
    """Tests for run_strategist_analysis Celery task."""

    def test_strategist_with_mocked_anthropic(self, db, department, category, employee_user):
        """Strategist task with mock Claude API returns and stores analysis."""
        for i in range(3):
            db.add(ExpenseRequest(
                id=uuid.uuid4(), employee_id=employee_user.id, category_id=category.id,
                title=f"Expense {i}", amount=100.0 * (i + 1), currency="BRL", status="PAID",
            ))
        db.commit()

        mock_response = MagicMock()
        mock_response.content = [MagicMock(text='{"trend": "increasing", "recommendations": ["cut travel"]}')]
        mock_response.usage.input_tokens = 500
        mock_response.usage.output_tokens = 200

        mock_client = MagicMock()
        mock_client.messages.create.return_value = mock_response

        result = _run_strategist(db, api_key="test-key", mock_anthropic_client=mock_client)

        assert result is not None
        assert result["departments_analyzed"] >= 1
        log = db.query(AIAnalysisLog).filter(AIAnalysisLog.ai_role == "STRATEGIST").first()
        assert log is not None
        assert log.status == "SUCCESS"

    def test_strategist_fallback_no_api_key(self, db, department, category, employee_user):
        """Strategist stores stub result when API key is missing."""
        db.add(ExpenseRequest(
            id=uuid.uuid4(), employee_id=employee_user.id, category_id=category.id,
            title="Test Expense", amount=500.0, currency="BRL", status="PAID",
        ))
        db.commit()

        result = _run_strategist(db, api_key="")

        assert result is not None
        assert "departments_analyzed" in result
        log = db.query(AIAnalysisLog).filter(AIAnalysisLog.ai_role == "STRATEGIST").first()
        assert log is not None
        assert log.model_used == "stub"

    def test_strategist_department_aggregation(self, db, category):
        """Verify department data is correctly aggregated across multiple departments."""
        dept1 = Department(id=uuid.uuid4(), name="Sales", code="SAL")
        dept2 = Department(id=uuid.uuid4(), name="HR", code="HR")
        db.add_all([dept1, dept2])
        db.commit()

        user1 = User(id=uuid.uuid4(), full_name="U1", email="u1@t.com", password_hash="x", role="EMPLOYEE", department_id=dept1.id)
        user2 = User(id=uuid.uuid4(), full_name="U2", email="u2@t.com", password_hash="x", role="EMPLOYEE", department_id=dept2.id)
        db.add_all([user1, user2])
        db.commit()

        for i in range(3):
            db.add(ExpenseRequest(
                id=uuid.uuid4(), employee_id=user1.id, category_id=category.id,
                title=f"Sales {i}", amount=100.0, currency="BRL", status="PAID",
            ))
        db.add(ExpenseRequest(
            id=uuid.uuid4(), employee_id=user2.id, category_id=category.id,
            title="HR exp", amount=200.0, currency="BRL", status="PAID",
        ))
        db.commit()

        result = _run_strategist(db, api_key="")

        assert result["departments_analyzed"] >= 2

    def test_strategist_empty_database(self, db):
        """Strategist handles empty database gracefully."""
        result = _run_strategist(db, api_key="")

        assert result is not None
        assert result["departments_analyzed"] == 0


class TestStrategistReportEndpoint:
    """Tests for GET /api/v1/ai/strategist/report."""

    def test_get_report_returns_latest(self, db, client, manager_user, manager_headers):
        """Returns the latest STRATEGIST SUCCESS log."""
        log = AIAnalysisLog(
            id=uuid.uuid4(), ai_role="STRATEGIST", model_used="claude-sonnet-4-20250514",
            input_tokens=100, output_tokens=50, status="SUCCESS",
            response=json.dumps({"trend": "stable", "recommendations": ["reduce travel"]}),
            created_at=datetime.now(timezone.utc),
        )
        db.add(log)
        db.commit()

        resp = client.get("/api/v1/ai/strategist/report", headers=manager_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["id"] == str(log.id)
        assert data["model_used"] == "claude-sonnet-4-20250514"

    def test_get_report_no_data(self, client, manager_headers):
        """Returns message when no report available."""
        resp = client.get("/api/v1/ai/strategist/report", headers=manager_headers)
        assert resp.status_code == 200
        assert resp.json()["message"] == "No report available"

    def test_get_report_requires_manager_role(self, client, employee_headers):
        """Employees cannot access strategist report."""
        resp = client.get("/api/v1/ai/strategist/report", headers=employee_headers)
        assert resp.status_code == 403

    def test_get_report_unauthenticated(self, client):
        """Unauthenticated request returns 403."""
        resp = client.get("/api/v1/ai/strategist/report")
        assert resp.status_code == 403
