"""Tests for weekly strategist analysis — Celery task and beat schedule."""

import json
import sys
import uuid
from types import ModuleType
from unittest.mock import MagicMock, patch

from app.core.security import hash_password
from app.models.ai_analysis_log import AIAnalysisLog
from app.models.department import Department
from app.models.expense_category import ExpenseCategory
from app.models.expense_request import ExpenseRequest
from app.models.user import User


def _setup_data(db):
    """Create minimal data for strategist analysis."""
    dept = Department(id=uuid.uuid4(), name="Engineering", code="ENG")
    db.add(dept)
    db.commit()
    db.refresh(dept)

    user = User(
        id=uuid.uuid4(),
        full_name="Test Employee",
        email="strat-weekly@test.com",
        password_hash=hash_password("password123"),
        role="EMPLOYEE",
        department_id=dept.id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    cat = ExpenseCategory(id=uuid.uuid4(), name="Travel", is_active=True)
    db.add(cat)
    db.commit()
    db.refresh(cat)

    req = ExpenseRequest(
        id=uuid.uuid4(),
        employee_id=user.id,
        category_id=cat.id,
        title="Flight",
        amount=500.0,
        currency="BRL",
        status="PAID",
    )
    db.add(req)
    db.commit()

    return dept, user, cat, req


def _run_strategist_weekly(db, api_key="", mock_anthropic_client=None):
    """Import and invoke run_strategist_weekly with Celery fully mocked.

    Celery is not installed in the test environment, so we pre-inject stub
    modules into sys.modules before importing the task module.
    """
    fake_celery_mod = ModuleType("celery")
    fake_celery_app_mod = ModuleType("app.workers.celery_app")

    fake_app = MagicMock()
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

    task_key = "app.workers.tasks.ai_tasks"
    saved[task_key] = sys.modules.pop(task_key, None)

    try:
        import importlib

        import app.workers.tasks.ai_tasks as ai_mod
        importlib.reload(ai_mod)

        mock_session = MagicMock(wraps=db)
        mock_session.close = MagicMock()

        with patch("app.config.settings") as mock_settings, \
             patch.object(ai_mod, "SessionLocal", return_value=mock_session):

            mock_settings.ANTHROPIC_API_KEY = api_key

            if mock_anthropic_client and api_key:
                with patch("anthropic.Anthropic", return_value=mock_anthropic_client):
                    result = ai_mod.run_strategist_weekly()
            else:
                result = ai_mod.run_strategist_weekly()

        return result
    finally:
        for key, orig in saved.items():
            if orig is None:
                sys.modules.pop(key, None)
            else:
                sys.modules[key] = orig


class TestStrategistWeekly:
    def test_runs_without_api_key(self, db):
        """Weekly strategist runs with stub when no API key is available."""
        _setup_data(db)

        result = _run_strategist_weekly(db, api_key="")

        assert result is not None
        assert "departments_analyzed" in result
        assert result["departments_analyzed"] >= 1

    def test_stores_ai_analysis_log(self, db):
        """Weekly strategist creates an AIAnalysisLog entry."""
        _setup_data(db)

        _run_strategist_weekly(db, api_key="")

        log = db.query(AIAnalysisLog).filter(
            AIAnalysisLog.ai_role == "STRATEGIST",
        ).order_by(AIAnalysisLog.created_at.desc()).first()
        assert log is not None
        assert log.status == "SUCCESS"
        response = log.response
        if isinstance(response, str):
            response = json.loads(response)
        assert response.get("report_type") == "weekly" or response.get("status") == "stub"

    def test_beat_schedule_contains_weekly(self):
        """Weekly strategist is registered in the Celery beat schedule.

        We read celery_app.py source directly since Celery isn't installed.
        """
        from pathlib import Path

        celery_app_path = Path(__file__).resolve().parent.parent / "app" / "workers" / "celery_app.py"
        source = celery_app_path.read_text()

        assert "strategist-weekly-analysis" in source
        assert "run_strategist_weekly" in source
        assert "604800" in source
