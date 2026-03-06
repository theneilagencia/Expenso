import json
import uuid
from datetime import datetime, timedelta
from unittest.mock import MagicMock, patch

import pytest

from app.models.ai_analysis_log import AIAnalysisLog
from app.models.expense_category import ExpenseCategory
from app.models.expense_request import ExpenseRequest
from app.schemas.ai_analysis import AnalystResponse
from app.services.ai_service import AIService, _run_hard_policy_checks


def _make_category(db, **overrides):
    """Helper: create an ExpenseCategory with sensible defaults."""
    defaults = dict(
        id=uuid.uuid4(),
        name="Travel",
        limit_per_request=5000.0,
        limit_per_month=20000.0,
        max_days_to_submit=90,
        min_justification_chars=20,
        requires_strong_just=False,
        receipt_required_above=100.0,
        ai_attention_score=50,
        is_active=True,
    )
    defaults.update(overrides)
    cat = ExpenseCategory(**defaults)
    db.add(cat)
    db.commit()
    db.refresh(cat)
    return cat


def _make_request(db, employee_id, category_id, **overrides):
    """Helper: create an ExpenseRequest with sensible defaults.

    Uses naive datetimes (no tzinfo) for SQLite compatibility.
    """
    defaults = dict(
        id=uuid.uuid4(),
        employee_id=employee_id,
        category_id=category_id,
        title="Business lunch",
        amount=200.0,
        currency="BRL",
        status="PENDING_AI",
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


def _mock_claude_response(analysis: dict):
    """Build a mock Anthropic messages.create() return value."""
    mock_response = MagicMock()
    mock_response.content = [MagicMock(text=json.dumps(analysis))]
    mock_response.usage = MagicMock(input_tokens=500, output_tokens=200)
    return mock_response


# Default valid Claude analysis payload
APPROVE_ANALYSIS = {
    "risk_score": 15,
    "risk_level": "LOW",
    "recommendation": "APPROVE",
    "recommendation_reason": "Low-risk business expense within policy limits",
    "semantic_quality_score": 85,
    "policy_violations": [],
    "anomalies": [],
    "duplicate_suspicion": False,
    "attention_points": [],
}

REVIEW_ANALYSIS = {
    "risk_score": 55,
    "risk_level": "MEDIUM",
    "recommendation": "REVIEW",
    "recommendation_reason": "Amount is moderately high; manual review recommended",
    "semantic_quality_score": 60,
    "policy_violations": [],
    "anomalies": ["Slightly above average for this category"],
    "duplicate_suspicion": False,
    "attention_points": ["Verify vendor details"],
}

REJECT_ANALYSIS = {
    "risk_score": 92,
    "risk_level": "HIGH",
    "recommendation": "REJECT",
    "recommendation_reason": "Multiple policy violations detected",
    "semantic_quality_score": 20,
    "policy_violations": ["Vendor not in approved list"],
    "anomalies": ["Amount is 3x above employee average"],
    "duplicate_suspicion": True,
    "attention_points": ["Suspected duplicate", "Missing receipt"],
}


# ---------------------------------------------------------------------------
# Hard policy checks (unit tests on _run_hard_policy_checks)
# ---------------------------------------------------------------------------

class TestHardPolicyChecks:
    def test_hard_policy_amount_exceeds_limit(self, db, employee_user):
        cat = _make_category(db, limit_per_request=1000.0)
        req = _make_request(db, employee_user.id, cat.id, amount=1500.0)
        violations = _run_hard_policy_checks(req, cat, db)
        assert len(violations) == 1
        assert "exceeds category limit" in violations[0].lower()

    def test_hard_policy_expired_date(self, db, employee_user):
        cat = _make_category(db, max_days_to_submit=30)
        req = _make_request(
            db, employee_user.id, cat.id,
            expense_date=datetime.utcnow() - timedelta(days=60),
        )
        violations = _run_hard_policy_checks(req, cat, db)
        assert len(violations) == 1
        assert "days old" in violations[0].lower()

    def test_hard_policy_short_justification(self, db, employee_user):
        cat = _make_category(db, min_justification_chars=50)
        req = _make_request(db, employee_user.id, cat.id, justification="Short")
        violations = _run_hard_policy_checks(req, cat, db)
        assert len(violations) == 1
        assert "justification" in violations[0].lower()

    def test_hard_policy_multiple_violations(self, db, employee_user):
        cat = _make_category(
            db,
            limit_per_request=100.0,
            max_days_to_submit=10,
            min_justification_chars=50,
        )
        req = _make_request(
            db, employee_user.id, cat.id,
            amount=500.0,
            expense_date=datetime.utcnow() - timedelta(days=30),
            justification="Too short",
        )
        violations = _run_hard_policy_checks(req, cat, db)
        assert len(violations) == 3

    def test_hard_policy_no_violations(self, db, employee_user):
        cat = _make_category(
            db,
            limit_per_request=5000.0,
            max_days_to_submit=90,
            min_justification_chars=10,
        )
        req = _make_request(
            db, employee_user.id, cat.id,
            amount=200.0,
            expense_date=datetime.utcnow() - timedelta(days=5),
            justification="Valid justification for expense",
        )
        violations = _run_hard_policy_checks(req, cat, db)
        assert len(violations) == 0


# ---------------------------------------------------------------------------
# Full analyze_request flow
# ---------------------------------------------------------------------------

class TestAnalyzeRequest:
    @patch("app.services.embedding_service.EmbeddingService.find_duplicates", return_value=[])
    @patch("app.services.embedding_service.EmbeddingService.store_embedding")
    def test_analyze_request_policy_block(self, mock_store, mock_dups, db, employee_user):
        """A policy violation triggers BLOCK without calling Claude."""
        cat = _make_category(db, limit_per_request=100.0)
        req = _make_request(db, employee_user.id, cat.id, amount=500.0)

        result = AIService.analyze_request(req.id, db)

        assert result is not None
        assert result["recommendation"] == "REJECT"
        assert result["risk_level"] == "BLOCK"
        assert len(result["policy_violations"]) > 0

        db.refresh(req)
        assert req.status == "REJECTED_AI"
        assert req.ai_risk_score == 100

        # Check AIAnalysisLog was created with policy_engine
        log = db.query(AIAnalysisLog).filter(
            AIAnalysisLog.request_id == req.id
        ).first()
        assert log is not None
        assert log.model_used == "policy_engine"

    @patch("app.services.embedding_service.EmbeddingService.find_duplicates", return_value=[])
    @patch("app.services.embedding_service.EmbeddingService.store_embedding")
    @patch("app.services.ai_service._get_client")
    def test_analyze_request_claude_approve(self, mock_get_client, mock_store, mock_dups, db, employee_user):
        mock_client = MagicMock()
        mock_client.messages.create.return_value = _mock_claude_response(APPROVE_ANALYSIS)
        mock_get_client.return_value = mock_client

        cat = _make_category(db)
        req = _make_request(db, employee_user.id, cat.id)

        result = AIService.analyze_request(req.id, db)

        assert result["recommendation"] == "APPROVE"
        assert result["risk_score"] == 15
        db.refresh(req)
        assert req.status == "PENDING_MANAGER"
        assert req.ai_risk_level == "LOW"

    @patch("app.services.embedding_service.EmbeddingService.find_duplicates", return_value=[])
    @patch("app.services.embedding_service.EmbeddingService.store_embedding")
    @patch("app.services.ai_service._get_client")
    def test_analyze_request_claude_review(self, mock_get_client, mock_store, mock_dups, db, employee_user):
        mock_client = MagicMock()
        mock_client.messages.create.return_value = _mock_claude_response(REVIEW_ANALYSIS)
        mock_get_client.return_value = mock_client

        cat = _make_category(db)
        req = _make_request(db, employee_user.id, cat.id)

        result = AIService.analyze_request(req.id, db)

        assert result["recommendation"] == "REVIEW"
        assert result["risk_score"] == 55
        db.refresh(req)
        assert req.status == "PENDING_MANAGER"
        assert req.ai_risk_level == "MEDIUM"

    @patch("app.services.embedding_service.EmbeddingService.find_duplicates", return_value=[])
    @patch("app.services.embedding_service.EmbeddingService.store_embedding")
    @patch("app.services.ai_service._get_client")
    def test_analyze_request_claude_reject(self, mock_get_client, mock_store, mock_dups, db, employee_user):
        mock_client = MagicMock()
        mock_client.messages.create.return_value = _mock_claude_response(REJECT_ANALYSIS)
        mock_get_client.return_value = mock_client

        cat = _make_category(db)
        req = _make_request(db, employee_user.id, cat.id)

        result = AIService.analyze_request(req.id, db)

        assert result["recommendation"] == "REJECT"
        assert result["risk_score"] == 92
        db.refresh(req)
        assert req.status == "REJECTED_AI"
        assert req.ai_risk_level == "HIGH"

    @patch("app.services.embedding_service.EmbeddingService.find_duplicates", return_value=[])
    @patch("app.services.embedding_service.EmbeddingService.store_embedding")
    @patch("app.services.ai_service._get_client")
    def test_analyze_request_ai_skip(self, mock_get_client, mock_store, mock_dups, db, employee_user):
        """When Claude client is unavailable, request should be SKIPPED."""
        mock_get_client.return_value = None  # No API key / client unavailable

        cat = _make_category(db)
        req = _make_request(db, employee_user.id, cat.id)

        result = AIService.analyze_request(req.id, db)

        assert result["ai_skipped"] is True
        db.refresh(req)
        assert req.ai_skipped is True
        # ai_approved transition on skip: PENDING_AI -> PENDING_MANAGER
        assert req.status == "PENDING_MANAGER"

        log = db.query(AIAnalysisLog).filter(AIAnalysisLog.request_id == req.id).first()
        assert log is not None
        assert log.status == "SKIPPED"
        assert log.model_used == "skipped"

    def test_analyze_request_pydantic_validation(self):
        """AnalystResponse Pydantic model validates the schema properly."""
        valid = AnalystResponse(**APPROVE_ANALYSIS)
        assert valid.risk_score == 15
        assert valid.recommendation == "APPROVE"
        assert valid.risk_level == "LOW"

        # Invalid risk_score
        with pytest.raises(Exception):
            AnalystResponse(risk_score=150, risk_level="LOW", recommendation="APPROVE")

        # Invalid recommendation
        with pytest.raises(Exception):
            AnalystResponse(risk_score=50, risk_level="LOW", recommendation="INVALID")

        # Invalid risk_level
        with pytest.raises(Exception):
            AnalystResponse(risk_score=50, risk_level="INVALID", recommendation="APPROVE")

    @patch("app.services.embedding_service.EmbeddingService.find_duplicates", return_value=[])
    @patch("app.services.embedding_service.EmbeddingService.store_embedding")
    @patch("app.services.ai_service._get_client")
    def test_analyze_request_prompt_hash_populated(self, mock_get_client, mock_store, mock_dups, db, employee_user):
        mock_client = MagicMock()
        mock_client.messages.create.return_value = _mock_claude_response(APPROVE_ANALYSIS)
        mock_get_client.return_value = mock_client

        cat = _make_category(db)
        req = _make_request(db, employee_user.id, cat.id)

        AIService.analyze_request(req.id, db)

        log = db.query(AIAnalysisLog).filter(
            AIAnalysisLog.request_id == req.id,
            AIAnalysisLog.model_used != "policy_engine",
        ).first()
        assert log is not None
        assert log.prompt_hash is not None
        assert len(log.prompt_hash) == 64  # SHA-256 hex digest

    @patch("app.services.embedding_service.EmbeddingService.find_duplicates", return_value=[])
    @patch("app.services.embedding_service.EmbeddingService.store_embedding")
    @patch("app.services.ai_service._get_client")
    def test_analyze_request_duration_ms_populated(self, mock_get_client, mock_store, mock_dups, db, employee_user):
        mock_client = MagicMock()
        mock_client.messages.create.return_value = _mock_claude_response(APPROVE_ANALYSIS)
        mock_get_client.return_value = mock_client

        cat = _make_category(db)
        req = _make_request(db, employee_user.id, cat.id)

        AIService.analyze_request(req.id, db)

        log = db.query(AIAnalysisLog).filter(
            AIAnalysisLog.request_id == req.id,
            AIAnalysisLog.model_used != "policy_engine",
        ).first()
        assert log is not None
        assert log.duration_ms is not None
        assert log.duration_ms >= 0


# ---------------------------------------------------------------------------
# API endpoint tests
# ---------------------------------------------------------------------------

class TestAnalysisEndpoints:
    def test_get_analysis_endpoint(self, client, db, employee_user, employee_headers):
        """GET /api/v1/ai/analysis/{id} returns the stored analysis.

        Note: JSONB is patched to Text in SQLite, so response is stored as a
        JSON string. The get_analysis service now handles JSON string responses.
        """
        cat = _make_category(db)
        req = _make_request(db, employee_user.id, cat.id)

        # In SQLite, JSONB columns are stored as Text. Store as JSON string.
        analysis_data = json.dumps({
            "risk_score": 30,
            "semantic_quality_score": 70,
            "recommendation": "APPROVE",
            "recommendation_reason": "OK",
        })
        log = AIAnalysisLog(
            id=uuid.uuid4(),
            request_id=req.id,
            ai_role="ANALYST",
            model_used="claude-sonnet-4-20250514",
            input_tokens=100,
            output_tokens=50,
            response=analysis_data,
            duration_ms=250,
            status="SUCCESS",
        )
        db.add(log)
        db.commit()

        resp = client.get(f"/api/v1/ai/analysis/{req.id}", headers=employee_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["risk_score"] == 30
        assert data["recommendation"] == "APPROVE"

    def test_get_analysis_no_data(self, client, db, employee_user, employee_headers):
        """GET /api/v1/ai/analysis/{id} with no log returns fallback message."""
        req = _make_request(db, employee_user.id, None)

        resp = client.get(f"/api/v1/ai/analysis/{req.id}", headers=employee_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert "message" in data

    def test_trigger_analysis_endpoint_returns_200(self, client, db, employee_user, employee_headers):
        """POST /api/v1/ai/analysis/{id} returns 200 with auth.

        Mocks the analysis service to avoid needing Claude API and pgvector.
        """
        cat = _make_category(db)
        req = _make_request(db, employee_user.id, cat.id)

        mock_result = {
            "risk_score": 20,
            "risk_level": "LOW",
            "recommendation": "APPROVE",
            "recommendation_reason": "OK",
        }

        with patch.object(AIService, "analyze_request", return_value=mock_result):
            resp = client.post(f"/api/v1/ai/analysis/{req.id}", headers=employee_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert data["recommendation"] == "APPROVE"

    def test_trigger_analysis_endpoint_requires_auth(self, client):
        """POST /api/v1/ai/analysis/{id} requires authentication."""
        fake_id = uuid.uuid4()
        resp = client.post(f"/api/v1/ai/analysis/{fake_id}")
        assert resp.status_code in (401, 403)
