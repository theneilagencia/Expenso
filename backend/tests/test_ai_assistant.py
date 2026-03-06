import uuid
from datetime import datetime, timedelta, timezone
from unittest.mock import patch

from app.models.expense_category import ExpenseCategory
from app.models.expense_request import ExpenseRequest


def _make_category(db, **overrides):
    defaults = dict(
        id=uuid.uuid4(),
        name="Travel",
        limit_per_request=5000.0,
        min_justification_chars=20,
        requires_strong_just=False,
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
        title="Office supplies",
        amount=150.0,
        currency="BRL",
        status="DRAFT",
        justification="Monthly supply restock for the engineering team",
        vendor_name="OfficeMax",
        expense_date=datetime.now(timezone.utc) - timedelta(days=2),
    )
    defaults.update(overrides)
    req = ExpenseRequest(**defaults)
    db.add(req)
    db.commit()
    db.refresh(req)
    return req


class TestStreamAssistance:
    def test_stream_assistance_requires_auth(self, client):
        """GET /api/v1/ai/assist/{id}/stream without token returns 401/403."""
        fake_id = uuid.uuid4()
        resp = client.get(f"/api/v1/ai/assist/{fake_id}/stream")
        assert resp.status_code in (401, 403)

    @patch("app.services.ai_service._get_async_client")
    def test_stream_assistance_draft_returns_sse(
        self, mock_async_client, client, db, employee_user, employee_headers
    ):
        """GET /api/v1/ai/assist/stream?description=... returns SSE content-type."""
        # When async client is None, the service yields an error SSE event
        mock_async_client.return_value = None

        resp = client.get(
            "/api/v1/ai/assist/stream",
            params={"description": "Business trip to Sao Paulo", "justification": "Client meeting"},
            headers=employee_headers,
        )
        assert resp.status_code == 200
        assert "text/event-stream" in resp.headers.get("content-type", "")
        # Should contain SSE data (error because client is None)
        body = resp.text
        assert "data:" in body

    @patch("app.services.ai_service._get_async_client")
    def test_stream_assistance_draft_empty_params(
        self, mock_async_client, client, employee_headers
    ):
        """Draft assistance works even with empty description/justification."""
        mock_async_client.return_value = None

        resp = client.get(
            "/api/v1/ai/assist/stream",
            params={"description": "", "justification": ""},
            headers=employee_headers,
        )
        assert resp.status_code == 200
        assert "text/event-stream" in resp.headers.get("content-type", "")

    @patch("app.services.ai_service._get_async_client")
    def test_stream_assistance_draft_with_category(
        self, mock_async_client, client, db, employee_user, employee_headers
    ):
        """When category_id is provided, category context is loaded."""
        mock_async_client.return_value = None

        cat = _make_category(db)
        resp = client.get(
            "/api/v1/ai/assist/stream",
            params={
                "description": "Conference attendance",
                "justification": "Annual engineering conference",
                "category_id": str(cat.id),
            },
            headers=employee_headers,
        )
        assert resp.status_code == 200
        assert "text/event-stream" in resp.headers.get("content-type", "")

    @patch("app.services.ai_service._get_async_client")
    def test_stream_assistance_by_id_returns_sse(
        self, mock_async_client, client, db, employee_user, employee_headers
    ):
        """GET /api/v1/ai/assist/{id}/stream returns SSE for a saved request."""
        mock_async_client.return_value = None

        cat = _make_category(db)
        req = _make_request(db, employee_user.id, cat.id)

        resp = client.get(
            f"/api/v1/ai/assist/{req.id}/stream",
            headers=employee_headers,
        )
        assert resp.status_code == 200
        assert "text/event-stream" in resp.headers.get("content-type", "")
        body = resp.text
        assert "data:" in body
