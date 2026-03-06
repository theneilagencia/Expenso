import json
from unittest.mock import MagicMock, patch

from app.services.cache_service import cache_get, cache_invalidate, cache_set


class TestCacheService:
    """Tests for Redis cache service."""

    def test_set_and_get_cycle(self):
        """cache_set stores value and cache_get retrieves it."""
        mock_client = MagicMock()
        mock_client.get.return_value = json.dumps({"foo": "bar"})

        with patch("app.services.cache_service._get_redis", return_value=mock_client):
            cache_set("test:key", {"foo": "bar"}, ttl=60)
            result = cache_get("test:key")

        mock_client.setex.assert_called_once()
        assert result == {"foo": "bar"}

    def test_get_miss_returns_none(self):
        """cache_get returns None on cache miss."""
        mock_client = MagicMock()
        mock_client.get.return_value = None

        with patch("app.services.cache_service._get_redis", return_value=mock_client):
            result = cache_get("nonexistent")

        assert result is None

    def test_redis_unavailable_get_returns_none(self):
        """cache_get returns None when Redis is unavailable."""
        with patch("app.services.cache_service._get_redis", return_value=None):
            result = cache_get("any:key")

        assert result is None

    def test_redis_unavailable_set_silent(self):
        """cache_set does not raise when Redis is unavailable."""
        with patch("app.services.cache_service._get_redis", return_value=None):
            # Should not raise
            cache_set("any:key", {"data": 1})

    def test_invalidate_deletes_keys(self):
        """cache_invalidate deletes all matching keys."""
        mock_client = MagicMock()
        mock_client.keys.return_value = ["reports:dash:1", "reports:dash:2"]

        with patch("app.services.cache_service._get_redis", return_value=mock_client):
            cache_invalidate("reports:dash:*")

        mock_client.delete.assert_called_once_with("reports:dash:1", "reports:dash:2")

    def test_invalidate_no_matching_keys(self):
        """cache_invalidate does not call delete when no keys match."""
        mock_client = MagicMock()
        mock_client.keys.return_value = []

        with patch("app.services.cache_service._get_redis", return_value=mock_client):
            cache_invalidate("nonexistent:*")

        mock_client.delete.assert_not_called()
