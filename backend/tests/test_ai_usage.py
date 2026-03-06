import json
import uuid
from datetime import datetime, timedelta
from unittest.mock import patch

from app.models.ai_analysis_log import AIAnalysisLog
from app.models.expense_request import ExpenseRequest


def _sqlite_safe_cast(col, type_):
    """Replace sqlalchemy.cast with a no-op for SQLite compatibility.

    SQLite does not support CAST(datetime AS DATE) properly — it returns the
    year as an integer, which breaks SQLAlchemy's str_to_date processor.
    By returning the column unchanged the GROUP BY still works (grouping by
    the full timestamp string), and the test can exercise the rest of the
    endpoint logic.
    """
    return col


def _make_analysis_log(db, **overrides):
    """Helper: create an AIAnalysisLog entry.

    Uses naive datetimes (no tzinfo) for SQLite compatibility.
    """
    defaults = dict(
        id=uuid.uuid4(),
        ai_role="ANALYST",
        model_used="claude-sonnet-4-20250514",
        input_tokens=500,
        output_tokens=200,
        response=json.dumps({"risk_score": 30, "recommendation": "APPROVE"}),
        duration_ms=350,
        status="SUCCESS",
        created_at=datetime.utcnow(),
    )
    defaults.update(overrides)
    log = AIAnalysisLog(**defaults)
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


def _make_request(db, employee_id, **overrides):
    defaults = dict(
        id=uuid.uuid4(),
        employee_id=employee_id,
        title="Usage test expense",
        amount=100.0,
        currency="BRL",
        status="PENDING_AI",
    )
    defaults.update(overrides)
    req = ExpenseRequest(**defaults)
    db.add(req)
    db.commit()
    db.refresh(req)
    return req


class TestAIUsage:
    def test_ai_usage_requires_admin(self, client, employee_headers):
        """Non-admin users get 403 on /api/v1/ai/admin/ai-usage."""
        resp = client.get("/api/v1/ai/admin/ai-usage", headers=employee_headers)
        assert resp.status_code == 403

    def test_ai_usage_manager_forbidden(self, client, manager_headers):
        """Managers also get 403 on /api/v1/ai/admin/ai-usage."""
        resp = client.get("/api/v1/ai/admin/ai-usage", headers=manager_headers)
        assert resp.status_code == 403

    def test_ai_usage_admin_access(self, client, admin_headers):
        """Admin gets 200 on /api/v1/ai/admin/ai-usage."""
        resp = client.get("/api/v1/ai/admin/ai-usage", headers=admin_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert "total_calls" in data
        assert "by_role" in data
        assert "estimated_cost_usd" in data

    @patch("app.api.v1.routers.ai.cast", side_effect=_sqlite_safe_cast)
    def test_ai_usage_aggregated_data(self, mock_cast, client, db, admin_headers, employee_user):
        """With populated logs, usage endpoint returns correct totals."""
        req = _make_request(db, employee_user.id)
        _make_analysis_log(db, request_id=req.id, input_tokens=1000, output_tokens=500)
        _make_analysis_log(db, request_id=req.id, input_tokens=2000, output_tokens=800)

        resp = client.get("/api/v1/ai/admin/ai-usage", headers=admin_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["total_calls"] == 2
        assert data["total_input_tokens"] == 3000
        assert data["total_output_tokens"] == 1300

    @patch("app.api.v1.routers.ai.cast", side_effect=_sqlite_safe_cast)
    def test_ai_usage_role_breakdown(self, mock_cast, client, db, admin_headers, employee_user):
        """by_role aggregation has correct counts per AI role."""
        req = _make_request(db, employee_user.id)
        _make_analysis_log(db, request_id=req.id, ai_role="ANALYST")
        _make_analysis_log(db, request_id=req.id, ai_role="ANALYST")
        _make_analysis_log(db, request_id=req.id, ai_role="STRATEGIST")

        resp = client.get("/api/v1/ai/admin/ai-usage", headers=admin_headers)
        assert resp.status_code == 200
        data = resp.json()
        by_role = data["by_role"]
        assert "ANALYST" in by_role
        assert by_role["ANALYST"]["count"] == 2
        assert "STRATEGIST" in by_role
        assert by_role["STRATEGIST"]["count"] == 1

    @patch("app.api.v1.routers.ai.cast", side_effect=_sqlite_safe_cast)
    def test_ai_usage_cost_estimation(self, mock_cast, client, db, admin_headers, employee_user):
        """estimated_cost_usd follows $3/1M input + $15/1M output formula."""
        req = _make_request(db, employee_user.id)
        # 1,000,000 input tokens @ $3/1M = $3.00
        # 1,000,000 output tokens @ $15/1M = $15.00
        # Total = $18.00
        _make_analysis_log(
            db, request_id=req.id,
            input_tokens=1_000_000,
            output_tokens=1_000_000,
        )

        resp = client.get("/api/v1/ai/admin/ai-usage", headers=admin_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["estimated_cost_usd"] == 18.0

    @patch("app.api.v1.routers.ai.cast", side_effect=_sqlite_safe_cast)
    def test_ai_usage_period_filter(self, mock_cast, client, db, admin_headers, employee_user):
        """days=7 filters out logs older than 7 days."""
        req = _make_request(db, employee_user.id)

        # Recent log (should be included)
        _make_analysis_log(
            db, request_id=req.id,
            created_at=datetime.utcnow() - timedelta(days=2),
        )

        # Old log (should be excluded with days=7)
        _make_analysis_log(
            db, request_id=req.id,
            created_at=datetime.utcnow() - timedelta(days=15),
        )

        resp = client.get(
            "/api/v1/ai/admin/ai-usage",
            params={"days": 7},
            headers=admin_headers,
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["total_calls"] == 1
        assert data["period_days"] == 7

    def test_ai_usage_empty_data(self, client, admin_headers):
        """No logs returns zeroed response."""
        resp = client.get("/api/v1/ai/admin/ai-usage", headers=admin_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["total_calls"] == 0
        assert data["total_input_tokens"] == 0
        assert data["total_output_tokens"] == 0
        assert data["estimated_cost_usd"] == 0.0
        assert data["avg_latency_ms"] == 0
        assert data["success_rate"] == 0
        assert data["by_role"] == {}
