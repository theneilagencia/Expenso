"""Revolut webhook signature validation (HMAC-SHA256)."""

import hashlib
import hmac


def validate_webhook_signature(
    payload_bytes: bytes,
    signature: str,
    secret: str,
) -> bool:
    """Validate a Revolut webhook HMAC-SHA256 signature.

    Returns True if valid, raises ValueError if invalid.
    """
    expected = hmac.new(
        secret.encode("utf-8"),
        payload_bytes,
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(expected, signature):
        raise ValueError("Invalid webhook signature")

    return True
