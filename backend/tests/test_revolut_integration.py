"""Tests for Revolut Business API client, gateway, and webhook validation."""

import hashlib
import hmac
from unittest.mock import MagicMock, patch

import pytest

from app.integrations.revolut.webhooks import validate_webhook_signature


class TestWebhookSignature:
    """Tests for HMAC-SHA256 webhook signature validation."""

    def test_valid_signature(self):
        payload = b'{"id": "abc123", "state": "completed"}'
        secret = "test-webhook-secret"
        signature = hmac.new(secret.encode(), payload, hashlib.sha256).hexdigest()

        result = validate_webhook_signature(payload, signature, secret)
        assert result is True

    def test_invalid_signature(self):
        payload = b'{"id": "abc123", "state": "completed"}'
        secret = "test-webhook-secret"
        wrong_signature = "deadbeef" * 8

        with pytest.raises(ValueError, match="Invalid webhook signature"):
            validate_webhook_signature(payload, wrong_signature, secret)

    def test_different_payload_fails(self):
        secret = "test-webhook-secret"
        original = b'{"id": "abc123"}'
        tampered = b'{"id": "xyz789"}'
        signature = hmac.new(secret.encode(), original, hashlib.sha256).hexdigest()

        with pytest.raises(ValueError):
            validate_webhook_signature(tampered, signature, secret)


class TestRevolutClient:
    """Tests for RevolutClient HTTP methods (mocked httpx)."""

    def test_create_payment_success(self):
        from app.integrations.revolut.client import RevolutClient

        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {
            "id": "txn_001",
            "state": "pending",
            "amount": 1500.0,
        }

        with patch("app.integrations.revolut.client.httpx.Client") as MockClient:
            mock_http = MagicMock()
            mock_http.__enter__ = MagicMock(return_value=mock_http)
            mock_http.__exit__ = MagicMock(return_value=False)
            mock_http.post.return_value = mock_resp
            MockClient.return_value = mock_http

            # Use a dummy private key — won't actually sign since we mock httpx
            client = RevolutClient(
                base_url="https://sandbox.revolut.com/api/1.0",
                client_id="test_client",
                private_key="dummy_key",
            )

            with patch.object(client, "_build_jwt", return_value="fake.jwt.token"):
                result = client.create_payment(
                    counterparty_id="cpty_001",
                    amount=1500.0,
                    currency="BRL",
                    reference="Expenso Test",
                )

        assert result["id"] == "txn_001"
        assert result["state"] == "pending"

    def test_get_transaction_success(self):
        from app.integrations.revolut.client import RevolutClient

        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {
            "id": "txn_001",
            "state": "completed",
        }

        with patch("app.integrations.revolut.client.httpx.Client") as MockClient:
            mock_http = MagicMock()
            mock_http.__enter__ = MagicMock(return_value=mock_http)
            mock_http.__exit__ = MagicMock(return_value=False)
            mock_http.get.return_value = mock_resp
            MockClient.return_value = mock_http

            client = RevolutClient(
                base_url="https://sandbox.revolut.com/api/1.0",
                client_id="test_client",
                private_key="dummy_key",
            )

            with patch.object(client, "_build_jwt", return_value="fake.jwt.token"):
                result = client.get_transaction("txn_001")

        assert result["id"] == "txn_001"
        assert result["state"] == "completed"

    def test_cancel_transaction_success(self):
        from app.integrations.revolut.client import RevolutClient

        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {"id": "txn_001", "state": "cancelled"}

        with patch("app.integrations.revolut.client.httpx.Client") as MockClient:
            mock_http = MagicMock()
            mock_http.__enter__ = MagicMock(return_value=mock_http)
            mock_http.__exit__ = MagicMock(return_value=False)
            mock_http.delete.return_value = mock_resp
            MockClient.return_value = mock_http

            client = RevolutClient(
                base_url="https://sandbox.revolut.com/api/1.0",
                client_id="test_client",
                private_key="dummy_key",
            )

            with patch.object(client, "_build_jwt", return_value="fake.jwt.token"):
                result = client.cancel_transaction("txn_001")

        assert result["state"] == "cancelled"

    def test_api_error_raised_on_4xx(self):
        from app.integrations.revolut.client import RevolutAPIError, RevolutClient

        mock_resp = MagicMock()
        mock_resp.status_code = 400
        mock_resp.text = "Bad Request"
        mock_resp.json.return_value = {"message": "Invalid amount"}

        with patch("app.integrations.revolut.client.httpx.Client") as MockClient:
            mock_http = MagicMock()
            mock_http.__enter__ = MagicMock(return_value=mock_http)
            mock_http.__exit__ = MagicMock(return_value=False)
            mock_http.post.return_value = mock_resp
            MockClient.return_value = mock_http

            client = RevolutClient(
                base_url="https://sandbox.revolut.com/api/1.0",
                client_id="test_client",
                private_key="dummy_key",
            )

            with patch.object(client, "_build_jwt", return_value="fake.jwt.token"), \
                 pytest.raises(RevolutAPIError, match="Invalid amount"):
                client.create_payment("cpty_001", 0, "BRL", "Test")


class TestRevolutGateway:
    """Tests for RevolutGateway (fallback behaviour)."""

    def test_gateway_falls_back_to_mock_when_no_key(self):
        """Without API key, gateway uses MockGateway."""
        with patch("app.integrations.payments.revolut_gateway.settings") as mock_settings:
            mock_settings.REVOLUT_API_KEY = ""
            mock_settings.REVOLUT_API_URL = "https://sandbox.revolut.com/api/1.0"
            mock_settings.REVOLUT_CLIENT_ID = ""
            mock_settings.REVOLUT_PRIVATE_KEY = ""

            from importlib import reload

            import app.integrations.payments.revolut_gateway as rg_mod
            reload(rg_mod)

            gw = rg_mod.RevolutGateway()
            assert gw._fallback is not None

            result = gw.send_payment(100.0, "BRL", {"name": "Test"})
            assert "provider_id" in result
            assert result["status"] == "completed"

    def test_gateway_check_status_mock(self):
        """Without API key, check_status returns completed."""
        with patch("app.integrations.payments.revolut_gateway.settings") as mock_settings:
            mock_settings.REVOLUT_API_KEY = ""
            mock_settings.REVOLUT_API_URL = "https://sandbox.revolut.com/api/1.0"
            mock_settings.REVOLUT_CLIENT_ID = ""
            mock_settings.REVOLUT_PRIVATE_KEY = ""

            from importlib import reload

            import app.integrations.payments.revolut_gateway as rg_mod
            reload(rg_mod)

            gw = rg_mod.RevolutGateway()
            result = gw.check_status("mock_123")
            assert result["status"] == "completed"

    def test_gateway_maps_revolut_states(self):
        """Test the status mapping from Revolut states."""
        from app.integrations.payments.revolut_gateway import _REVOLUT_STATUS_MAP

        assert _REVOLUT_STATUS_MAP["completed"] == "completed"
        assert _REVOLUT_STATUS_MAP["pending"] == "PROCESSING"
        assert _REVOLUT_STATUS_MAP["failed"] == "FAILED"
        assert _REVOLUT_STATUS_MAP["declined"] == "FAILED"
