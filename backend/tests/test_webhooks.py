"""Tests for webhook CRUD and dispatch."""

import json
import uuid
from unittest.mock import MagicMock, patch

from app.models.webhook_config import WebhookConfig
from app.services.webhook_service import WebhookService


class TestListWebhooks:
    def test_list_webhooks_empty(self, client, admin_headers):
        """GET returns empty list when no webhooks exist."""
        resp = client.get("/api/v1/admin/webhooks", headers=admin_headers)
        assert resp.status_code == 200
        assert resp.json() == []

    def test_list_webhooks_with_data(self, client, admin_headers):
        """GET returns list of webhooks."""
        client.post("/api/v1/admin/webhooks", json={
            "url": "https://example.com/webhook",
            "events": ["request.submitted", "request.approved"],
        }, headers=admin_headers)

        resp = client.get("/api/v1/admin/webhooks", headers=admin_headers)
        assert resp.status_code == 200
        data = resp.json()
        assert len(data) == 1
        assert data[0]["url"] == "https://example.com/webhook"

    def test_list_webhooks_requires_admin(self, client, employee_headers):
        """Non-admin gets 403."""
        resp = client.get("/api/v1/admin/webhooks", headers=employee_headers)
        assert resp.status_code == 403


class TestCreateWebhook:
    def test_create_webhook(self, client, admin_headers):
        """POST creates a new webhook."""
        resp = client.post("/api/v1/admin/webhooks", json={
            "url": "https://hooks.example.com/expenso",
            "events": ["request.submitted", "payment.completed"],
        }, headers=admin_headers)
        assert resp.status_code == 201
        data = resp.json()
        assert "id" in data
        assert data["url"] == "https://hooks.example.com/expenso"
        assert data["is_active"] is True

    def test_create_webhook_with_secret(self, client, admin_headers):
        """POST creates webhook with HMAC secret."""
        resp = client.post("/api/v1/admin/webhooks", json={
            "url": "https://hooks.example.com/secure",
            "events": ["request.approved"],
            "secret": "my-secret-key",
        }, headers=admin_headers)
        assert resp.status_code == 201


class TestUpdateWebhook:
    def test_update_webhook(self, client, admin_headers):
        """PATCH updates webhook fields."""
        create_resp = client.post("/api/v1/admin/webhooks", json={
            "url": "https://old-hook.com/webhook",
            "events": ["request.submitted"],
        }, headers=admin_headers)
        assert create_resp.status_code == 201
        wh_id = create_resp.json()["id"]

        resp = client.patch(
            f"/api/v1/admin/webhooks/{wh_id}",
            json={"url": "https://new-hook.com/webhook", "is_active": False},
            headers=admin_headers,
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["url"] == "https://new-hook.com/webhook"
        assert data["is_active"] is False

    def test_update_nonexistent_webhook(self, client, admin_headers):
        """PATCH on missing webhook returns 404."""
        fake_id = str(uuid.uuid4())
        resp = client.patch(
            f"/api/v1/admin/webhooks/{fake_id}",
            json={"url": "https://new.com/hook"},
            headers=admin_headers,
        )
        assert resp.status_code == 404


class TestDeleteWebhook:
    def test_delete_webhook(self, client, admin_headers):
        """DELETE soft-deletes webhook."""
        create_resp = client.post("/api/v1/admin/webhooks", json={
            "url": "https://delete-me.com/webhook",
            "events": ["request.submitted"],
        }, headers=admin_headers)
        assert create_resp.status_code == 201
        wh_id = create_resp.json()["id"]

        resp = client.delete(
            f"/api/v1/admin/webhooks/{wh_id}",
            headers=admin_headers,
        )
        assert resp.status_code == 200
        assert resp.json()["status"] == "deleted"

        # Verify excluded from listing
        list_resp = client.get("/api/v1/admin/webhooks", headers=admin_headers)
        ids = [w["id"] for w in list_resp.json()]
        assert wh_id not in ids


class TestWebhookTest:
    def test_webhook_test_success(self, client, admin_headers):
        """POST /{id}/test sends a test ping (mock httpx)."""
        create_resp = client.post("/api/v1/admin/webhooks", json={
            "url": "https://test-hook.com/webhook",
            "events": ["request.submitted"],
        }, headers=admin_headers)
        assert create_resp.status_code == 201
        wh_id = create_resp.json()["id"]

        mock_response = MagicMock()
        mock_response.status_code = 200

        with patch("app.api.v1.admin.webhooks.httpx.Client") as mock_client:
            mock_client.return_value.__enter__ = MagicMock(return_value=mock_client.return_value)
            mock_client.return_value.__exit__ = MagicMock(return_value=False)
            mock_client.return_value.post.return_value = mock_response

            resp = client.post(
                f"/api/v1/admin/webhooks/{wh_id}/test",
                headers=admin_headers,
            )

        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True
        assert data["status_code"] == 200

    def test_webhook_test_nonexistent(self, client, admin_headers):
        """POST test on missing webhook returns 404."""
        fake_id = str(uuid.uuid4())
        resp = client.post(
            f"/api/v1/admin/webhooks/{fake_id}/test",
            headers=admin_headers,
        )
        assert resp.status_code == 404


class TestWebhookDispatch:
    def test_webhook_dispatch_event(self, db, admin_user):
        """WebhookService.dispatch_event sends to matching webhooks."""
        wh = WebhookConfig(
            id=uuid.uuid4(),
            url="https://dispatch-test.com/hook",
            events=json.dumps(["request.submitted", "payment.completed"]),
            is_active=True,
            created_by=admin_user.id,
        )
        db.add(wh)
        db.commit()

        with patch.object(WebhookService, "_send_webhook") as mock_send:
            count = WebhookService.dispatch_event(
                "request.submitted",
                {"request_id": "123", "title": "Test Request"},
                db,
            )
            assert count == 1
            mock_send.assert_called_once()

    def test_webhook_dispatch_no_match(self, db, admin_user):
        """dispatch_event returns 0 when no webhooks match the event type."""
        wh = WebhookConfig(
            id=uuid.uuid4(),
            url="https://dispatch-test.com/hook",
            events=json.dumps(["payment.completed"]),
            is_active=True,
            created_by=admin_user.id,
        )
        db.add(wh)
        db.commit()

        with patch.object(WebhookService, "_send_webhook") as mock_send:
            count = WebhookService.dispatch_event(
                "request.submitted",
                {"request_id": "123"},
                db,
            )
            assert count == 0
            mock_send.assert_not_called()
