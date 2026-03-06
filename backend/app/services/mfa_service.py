"""MFA/2FA service using TOTP (Time-based One-Time Passwords)."""

import base64
import io

import pyotp
import qrcode


class MFAService:
    """Service for TOTP-based multi-factor authentication."""

    ISSUER_NAME = "Expenso"

    @staticmethod
    def generate_secret() -> str:
        """Generate a random base32 secret for TOTP."""
        return pyotp.random_base32()

    @staticmethod
    def generate_qr_uri(user_email: str, secret: str) -> str:
        """Generate a TOTP provisioning URI for QR code generation."""
        totp = pyotp.TOTP(secret)
        return totp.provisioning_uri(
            name=user_email,
            issuer_name=MFAService.ISSUER_NAME,
        )

    @staticmethod
    def verify_totp(secret: str, code: str) -> bool:
        """Verify a TOTP code with a valid_window of 1 (allows 30s drift)."""
        totp = pyotp.TOTP(secret)
        return totp.verify(code, valid_window=1)

    @staticmethod
    def generate_qr_data_uri(user_email: str, secret: str) -> str:
        """Generate a QR code as a base64-encoded PNG data URI."""
        uri = MFAService.generate_qr_uri(user_email, secret)
        img = qrcode.make(uri)
        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        buffer.seek(0)
        b64 = base64.b64encode(buffer.getvalue()).decode("utf-8")
        return f"data:image/png;base64,{b64}"
