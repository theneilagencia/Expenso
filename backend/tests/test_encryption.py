"""Tests for core/encryption.py — Fernet-based config encryption."""

from unittest.mock import patch


class TestEncryption:
    """Verify encrypt_config / decrypt_config roundtrip and edge cases."""

    def test_encrypt_decrypt_roundtrip(self):
        """Encrypting then decrypting returns the original dict."""
        with patch("app.core.encryption.settings") as mock_settings:
            mock_settings.ENCRYPTION_KEY = "test-secret-key-for-encryption"
            mock_settings.SECRET_KEY = "fallback-key"

            from app.core.encryption import decrypt_config, encrypt_config

            original = {"api_key": "sk-12345", "endpoint": "https://api.example.com"}
            encrypted = encrypt_config(original)

            assert "_encrypted" in encrypted
            assert isinstance(encrypted["_encrypted"], str)

            decrypted = decrypt_config(encrypted)
            assert decrypted == original

    def test_decrypt_plain_dict_no_encryption(self):
        """Decrypting a plain dict (no _encrypted key) returns it as-is."""
        from app.core.encryption import decrypt_config

        plain = {"api_key": "visible", "secret": "also-visible"}
        result = decrypt_config(plain)
        assert result == plain

    def test_decrypt_none_returns_empty_dict(self):
        """Decrypting None returns an empty dict."""
        from app.core.encryption import decrypt_config

        result = decrypt_config(None)
        assert result == {}

    def test_decrypt_json_string_sqlite_compat(self):
        """Decrypting a JSON string (SQLite stores JSONB as Text) works."""
        import json

        from app.core.encryption import decrypt_config

        data = {"provider": "revolut", "active": True}
        json_str = json.dumps(data)

        result = decrypt_config(json_str)
        assert result == data

    def test_decrypt_invalid_json_string_returns_empty(self):
        """Decrypting an invalid JSON string returns empty dict."""
        from app.core.encryption import decrypt_config

        result = decrypt_config("not-valid-json{{{")
        assert result == {}

    def test_encrypt_without_key_returns_plaintext(self):
        """When no usable encryption key is available, data is returned as-is."""
        with patch("app.core.encryption._get_fernet", return_value=None):
            from app.core.encryption import encrypt_config

            data = {"key": "value"}
            result = encrypt_config(data)
            # No fernet => returned plaintext
            assert result == data

    def test_decrypt_encrypted_without_fernet_returns_empty(self):
        """Decrypting an encrypted blob when fernet is unavailable returns empty dict."""
        with patch("app.core.encryption._get_fernet", return_value=None):
            from app.core.encryption import decrypt_config

            result = decrypt_config({"_encrypted": "gAAAAA-some-token"})
            assert result == {}

    def test_decrypt_empty_dict_returns_empty(self):
        """Decrypting an empty dict returns empty dict (no _encrypted key)."""
        from app.core.encryption import decrypt_config

        result = decrypt_config({})
        assert result == {}
