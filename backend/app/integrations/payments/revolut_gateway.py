import logging

from app.config import settings
from app.integrations.payments.base import PaymentGateway
from app.integrations.payments.mock_gateway import MockGateway

logger = logging.getLogger(__name__)

# Revolut state → internal status mapping
_REVOLUT_STATUS_MAP = {
    "pending": "PROCESSING",
    "created": "PROCESSING",
    "completed": "completed",
    "declined": "FAILED",
    "failed": "FAILED",
    "reverted": "FAILED",
    "cancelled": "FAILED",
}


class RevolutGateway(PaymentGateway):
    """Revolut Business API gateway.

    Falls back to MockGateway when REVOLUT_API_KEY is not configured.
    """

    def __init__(self):
        self._api_key = getattr(settings, "REVOLUT_API_KEY", "")
        self._api_url = getattr(settings, "REVOLUT_API_URL", "https://sandbox-b2b.revolut.com/api/1.0")
        self._client_id = getattr(settings, "REVOLUT_CLIENT_ID", "")
        self._private_key = getattr(settings, "REVOLUT_PRIVATE_KEY", "")
        self._fallback = None if self._api_key else MockGateway()
        if self._fallback:
            logger.info("Revolut API key not configured — using mock gateway fallback")

    def _get_client(self):
        from app.integrations.revolut.client import RevolutClient
        return RevolutClient(
            base_url=self._api_url,
            client_id=self._client_id,
            private_key=self._private_key,
        )

    def send_payment(self, amount: float, currency: str, recipient: dict) -> dict:
        if self._fallback:
            return self._fallback.send_payment(amount, currency, recipient)

        client = self._get_client()
        counterparty_id = recipient.get("counterparty_id", recipient.get("email", ""))
        reference = recipient.get("reference", f"Expenso payment to {recipient.get('name', 'N/A')}")

        result = client.create_payment(
            counterparty_id=counterparty_id,
            amount=amount,
            currency=currency,
            reference=reference,
        )

        revolut_state = result.get("state", "pending")
        return {
            "provider_id": result.get("id", ""),
            "status": _REVOLUT_STATUS_MAP.get(revolut_state, "PROCESSING"),
            "raw_response": result,
        }

    def check_status(self, provider_id: str) -> dict:
        if self._fallback:
            return self._fallback.check_status(provider_id)

        client = self._get_client()
        result = client.get_transaction(provider_id)

        revolut_state = result.get("state", "pending")
        return {
            "status": _REVOLUT_STATUS_MAP.get(revolut_state, "PROCESSING"),
            "raw_response": result,
        }
