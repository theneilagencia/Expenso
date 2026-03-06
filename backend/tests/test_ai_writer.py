import uuid
from datetime import datetime, timedelta
from unittest.mock import MagicMock, patch

from app.models.ai_analysis_log import AIAnalysisLog
from app.models.expense_category import ExpenseCategory
from app.models.expense_request import ExpenseRequest


def _make_category(db, **overrides):
    defaults = dict(
        id=uuid.uuid4(),
        name="Travel",
        limit_per_request=5000.0,
        is_active=True,
    )
    defaults.update(overrides)
    cat = ExpenseCategory(**defaults)
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


def _make_request(db, employee_id, category_id, **overrides):
    defaults = dict(
        id=uuid.uuid4(),
        employee_id=employee_id,
        category_id=category_id,
        title="Business lunch",
        amount=200.0,
        currency="BRL",
        status="PENDING_MANAGER",
        justification="Important client meeting to discuss Q2 contract renewal terms",
        vendor_name="Restaurant ABC",
        expense_date=datetime.utcnow() - timedelta(days=5),
    )
    defaults.update(overrides)
    req = ExpenseRequest(**defaults)
    db.add(req)
    db.commit()
    db.refresh(req)
    return req


def _mock_claude_response(text):
    mock_response = MagicMock()
    mock_response.content = [MagicMock(text=text)]
    mock_response.usage = MagicMock(input_tokens=300, output_tokens=150)
    return mock_response


# ---------------------------------------------------------------------------
# generate_summary tests
# ---------------------------------------------------------------------------

class TestGenerateSummary:
    @patch("app.services.ai_service._get_client")
    def test_generate_summary_returns_text(self, mock_get_client, db, employee_user):
        mock_client = MagicMock()
        mock_client.messages.create.return_value = _mock_claude_response(
            "Executive summary: Low-risk travel expense for client meeting."
        )
        mock_get_client.return_value = mock_client

        cat = _make_category(db)
        req = _make_request(db, employee_user.id, cat.id)

        from app.services.ai_service import AIService
        result = AIService.generate_summary(req.id, db)

        assert result is not None
        assert "summary" in result
        assert len(result["summary"]) > 0

        # Check AIAnalysisLog was created with WRITER role
        log = db.query(AIAnalysisLog).filter(
            AIAnalysisLog.ai_role == "WRITER",
        ).first()
        assert log is not None
        assert log.status == "SUCCESS"

    @patch("app.services.ai_service._get_client")
    def test_generate_summary_skipped_when_no_client(self, mock_get_client, db, employee_user):
        mock_get_client.return_value = None

        cat = _make_category(db)
        req = _make_request(db, employee_user.id, cat.id)

        from app.services.ai_service import AIService
        result = AIService.generate_summary(req.id, db)

        assert result is not None
        assert result.get("ai_skipped") is True

    def test_generate_summary_not_found(self, db):
        from app.services.ai_service import AIService
        result = AIService.generate_summary(uuid.uuid4(), db)
        assert result is None


# ---------------------------------------------------------------------------
# suggest_comment tests
# ---------------------------------------------------------------------------

class TestSuggestComment:
    @patch("app.services.ai_service._get_client")
    def test_suggest_comment_approve(self, mock_get_client, db, employee_user):
        mock_client = MagicMock()
        mock_client.messages.create.return_value = _mock_claude_response(
            "Approved. This expense is within policy limits and well justified."
        )
        mock_get_client.return_value = mock_client

        cat = _make_category(db)
        req = _make_request(db, employee_user.id, cat.id)

        from app.services.ai_service import AIService
        result = AIService.suggest_comment(req.id, "approve", db, "en-US")

        assert result is not None
        assert "suggestion" in result
        assert len(result["suggestion"]) > 0

    @patch("app.services.ai_service._get_client")
    def test_suggest_comment_reject(self, mock_get_client, db, employee_user):
        mock_client = MagicMock()
        mock_client.messages.create.return_value = _mock_claude_response(
            "Rejected due to insufficient justification for the amount."
        )
        mock_get_client.return_value = mock_client

        cat = _make_category(db)
        req = _make_request(db, employee_user.id, cat.id)

        from app.services.ai_service import AIService
        result = AIService.suggest_comment(req.id, "reject", db, "en-US")

        assert result is not None
        assert "suggestion" in result

    @patch("app.services.ai_service._get_client")
    def test_suggest_comment_skipped_when_no_client(self, mock_get_client, db, employee_user):
        mock_get_client.return_value = None

        cat = _make_category(db)
        req = _make_request(db, employee_user.id, cat.id)

        from app.services.ai_service import AIService
        result = AIService.suggest_comment(req.id, "approve", db, "en-US")

        assert result is not None
        assert result.get("ai_skipped") is True


# ---------------------------------------------------------------------------
# API endpoint tests
# ---------------------------------------------------------------------------

class TestWriterEndpoints:
    def test_narrative_requires_auth(self, client):
        resp = client.get("/api/v1/reports/narrative")
        assert resp.status_code in (401, 403)

    def test_narrative_returns_sse(self, client, db, manager_user, manager_headers, sample_requests):
        """GET /api/v1/reports/narrative returns SSE content-type with auth."""
        resp = client.get(
            "/api/v1/reports/narrative",
            headers=manager_headers,
        )
        # Should return 200 with SSE headers (may be empty stream if no AI key)
        assert resp.status_code == 200
        assert "text/event-stream" in resp.headers.get("content-type", "")

    def test_ai_summary_requires_auth(self, client):
        fake_id = uuid.uuid4()
        resp = client.post(f"/api/v1/requests/{fake_id}/ai-summary")
        assert resp.status_code in (401, 403)

    def test_ai_summary_returns_result(self, client, db, employee_user, employee_headers):
        cat = _make_category(db)
        req = _make_request(db, employee_user.id, cat.id)

        resp = client.post(
            f"/api/v1/requests/{req.id}/ai-summary",
            headers=employee_headers,
        )
        assert resp.status_code == 200
        data = resp.json()
        # Without API key, returns ai_skipped or summary
        assert "summary" in data or "ai_skipped" in data or "message" in data

    def test_suggest_comment_requires_auth(self, client):
        resp = client.post("/api/v1/ai/suggest-comment")
        assert resp.status_code in (401, 403, 422)

    def test_suggest_comment_returns_result(self, client, db, employee_user, employee_headers):
        cat = _make_category(db)
        req = _make_request(db, employee_user.id, cat.id)

        resp = client.post(
            "/api/v1/ai/suggest-comment",
            headers=employee_headers,
            json={"request_id": str(req.id), "action": "approve"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "suggestion" in data or "ai_skipped" in data or "message" in data
