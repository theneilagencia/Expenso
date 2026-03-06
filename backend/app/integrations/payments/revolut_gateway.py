import logging

from app.config import settings
from app.integrations.payments.base import PaymentGateway
from app.integrations.payments.mock_gateway import MockGateway

logger = logging.getLogger(__name__)


class RevolutGateway(PaymentGateway):
    """Revolut Business API gateway stub.

    Falls back to MockGateway when REVOLUT_API_KEY is not configured.
    """

    def __init__(self):
        self._api_key = getattr(settings, "REVOLUT_API_KEY", "")
        self._api_url = getattr(settings, "REVOLUT_API_URL", "https://sandbox-b2b.revolut.com/api/1.0")
        self._fallback = None if self._api_key else MockGateway()
        if self._fallback:
            logger.info("Revolut API key not configured — using mock gateway fallback")

    def send_payment(self, amount: float, currency: str, recipient: dict) -> dict:
        if self._fallback:
            return self._fallback.send_payment(amount, currency, recipient)

        # TODO: Implement real Revolut API call
        # POST {api_url}/pay with bearer token
        raise NotImplementedError("Real Revolut integration not yet implemented")

    def check_status(self, provider_id: str) -> dict:
        if self._fallback:
            return self._fallback.check_status(provider_id)

        # TODO: Implement real Revolut status check
        # GET {api_url}/transaction/{provider_id}
        raise NotImplementedError("Real Revolut integration not yet implemented")
