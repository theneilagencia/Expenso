"""Fernet-based encryption for sensitive config data (e.g. integration credentials)."""

import base64
import hashlib
import json
import logging

from cryptography.fernet import Fernet, InvalidToken

from app.config import settings

logger = logging.getLogger(__name__)


def _get_fernet() -> Fernet | None:
    """Derive a Fernet key from ENCRYPTION_KEY (or SECRET_KEY as fallback)."""
    key_source = settings.ENCRYPTION_KEY or settings.SECRET_KEY
    if not key_source or key_source == "change-me-in-production":
        logger.warning("No secure encryption key configured — encryption disabled")
        return None
    # Derive 32-byte key via SHA-256
    digest = hashlib.sha256(key_source.encode()).digest()
    fernet_key = base64.urlsafe_b64encode(digest)
    return Fernet(fernet_key)


def encrypt_config(data: dict) -> dict:
    """Encrypt a config dict → returns {"_encrypted": "gAAAAA..."}."""
    fernet = _get_fernet()
    if fernet is None:
        return data  # No encryption key — store plaintext (dev mode)
    payload = json.dumps(data).encode("utf-8")
    token = fernet.encrypt(payload).decode("utf-8")
    return {"_encrypted": token}


def decrypt_config(stored: dict | str | None) -> dict:
    """Decrypt a config value → returns plaintext dict.

    Handles three cases:
      1. {"_encrypted": "gAAAAA..."} → decrypt
      2. Plain dict (legacy / no encryption) → return as-is
      3. JSON string → parse (SQLite compat — JSONB stored as Text)
    """
    if stored is None:
        return {}

    # SQLite stores JSONB as Text string
    if isinstance(stored, str):
        try:
            stored = json.loads(stored)
        except (json.JSONDecodeError, TypeError):
            return {}

    if not isinstance(stored, dict):
        return {}

    if "_encrypted" not in stored:
        return stored  # Already plaintext

    fernet = _get_fernet()
    if fernet is None:
        logger.warning("Cannot decrypt — no encryption key configured")
        return {}

    try:
        token = stored["_encrypted"].encode("utf-8")
        decrypted = fernet.decrypt(token)
        return json.loads(decrypted.decode("utf-8"))
    except (InvalidToken, json.JSONDecodeError) as e:
        logger.error(f"Failed to decrypt config: {e}")
        return {}
