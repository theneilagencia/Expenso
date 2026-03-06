from app.integrations.payments.base import PaymentGateway
from app.integrations.payments.mock_gateway import MockGateway

__all__ = ["PaymentGateway", "MockGateway", "get_gateway"]


def get_gateway(gateway_name: str = "mock") -> PaymentGateway:
    """Factory: return the appropriate gateway implementation."""
    if gateway_name == "revolut":
        from app.integrations.payments.revolut_gateway import RevolutGateway
        return RevolutGateway()
    return MockGateway()
