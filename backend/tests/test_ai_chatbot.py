import uuid
from unittest.mock import patch

from app.models.expense_request import ExpenseRequest


def _make_request(db, employee_id, **overrides):
    """Helper: create an ExpenseRequest for chat context tests."""
    defaults = dict(
        id=uuid.uuid4(),
        employee_id=employee_id,
        title="Chat context expense",
        amount=300.0,
        currency="BRL",
        status="PENDING_MANAGER",
    )
    defaults.update(overrides)
    req = ExpenseRequest(**defaults)
    db.add(req)
    db.commit()
    db.refresh(req)
    return req


class TestChatStream:
    def test_chat_stream_requires_auth(self, client):
        """POST /api/v1/ai/chat/stream without token returns 401/403."""
        resp = client.post(
            "/api/v1/ai/chat/stream",
            json={"messages": [{"role": "user", "content": "Hello"}]},
        )
        assert resp.status_code in (401, 403)

    @patch("app.services.ai_service._get_async_client")
    def test_chat_stream_employee_context(
        self, mock_async_client, client, db, employee_user, employee_headers
    ):
        """Employee chat returns SSE and queries employee request count."""
        mock_async_client.return_value = None

        # Create some requests for context
        _make_request(db, employee_user.id)
        _make_request(db, employee_user.id, status="PAID")

        resp = client.post(
            "/api/v1/ai/chat/stream",
            json={"messages": [{"role": "user", "content": "How many requests do I have?"}]},
            headers=employee_headers,
        )
        assert resp.status_code == 200
        assert "text/event-stream" in resp.headers.get("content-type", "")
        body = resp.text
        assert "data:" in body

    @patch("app.services.ai_service._get_async_client")
    def test_chat_stream_manager_context(
        self, mock_async_client, client, db, employee_user, manager_user, manager_headers
    ):
        """Manager chat returns SSE with pending manager approval context."""
        mock_async_client.return_value = None

        _make_request(db, employee_user.id, status="PENDING_MANAGER")

        resp = client.post(
            "/api/v1/ai/chat/stream",
            json={"messages": [{"role": "user", "content": "What is pending?"}]},
            headers=manager_headers,
        )
        assert resp.status_code == 200
        assert "text/event-stream" in resp.headers.get("content-type", "")

    @patch("app.services.ai_service._get_async_client")
    def test_chat_stream_admin_context(
        self, mock_async_client, client, db, employee_user, admin_user, admin_headers
    ):
        """Admin chat returns SSE with total system request context."""
        mock_async_client.return_value = None

        _make_request(db, employee_user.id, status="PAID")
        _make_request(db, employee_user.id, status="DRAFT")

        resp = client.post(
            "/api/v1/ai/chat/stream",
            json={"messages": [{"role": "user", "content": "Give me a system summary"}]},
            headers=admin_headers,
        )
        assert resp.status_code == 200
        assert "text/event-stream" in resp.headers.get("content-type", "")

    @patch("app.services.ai_service._get_async_client")
    def test_chat_stream_session_history(
        self, mock_async_client, client, employee_headers
    ):
        """Chat endpoint accepts multi-turn messages array."""
        mock_async_client.return_value = None

        messages = [
            {"role": "user", "content": "What categories are available?"},
            {"role": "assistant", "content": "We have Travel, Meals, and Office Supplies."},
            {"role": "user", "content": "What is the limit for Travel?"},
        ]

        resp = client.post(
            "/api/v1/ai/chat/stream",
            json={"messages": messages},
            headers=employee_headers,
        )
        assert resp.status_code == 200
        assert "text/event-stream" in resp.headers.get("content-type", "")
        body = resp.text
        assert "data:" in body
