from abc import ABC, abstractmethod


class PaymentGateway(ABC):
    """Abstract base for payment gateway integrations."""

    @abstractmethod
    def send_payment(self, amount: float, currency: str, recipient: dict) -> dict:
        """Send a payment. Returns dict with provider_id, status, raw_response."""
        ...

    @abstractmethod
    def check_status(self, provider_id: str) -> dict:
        """Check payment status by provider ID. Returns dict with status, raw_response."""
        ...
