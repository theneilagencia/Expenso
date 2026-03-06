import uuid

from app.integrations.payments.base import PaymentGateway


class MockGateway(PaymentGateway):
    """Mock gateway for development and testing. Always succeeds."""

    def send_payment(self, amount: float, currency: str, recipient: dict) -> dict:
        provider_id = f"mock_{uuid.uuid4().hex[:12]}"
        return {
            "provider_id": provider_id,
            "status": "completed",
            "raw_response": {
                "id": provider_id,
                "amount": amount,
                "currency": currency,
                "recipient": recipient,
                "state": "completed",
            },
        }

    def check_status(self, provider_id: str) -> dict:
        return {
            "status": "completed",
            "raw_response": {"id": provider_id, "state": "completed"},
        }
