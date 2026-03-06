import json
import logging

import redis

from app.config import settings

logger = logging.getLogger(__name__)

_client = None


def _get_redis():
    """Lazy-initialize Redis client. Returns None if unavailable."""
    global _client
    if _client is not None:
        return _client
    try:
        _client = redis.from_url(settings.REDIS_URL, decode_responses=True)
        _client.ping()
        return _client
    except Exception as e:
        logger.warning(f"Redis unavailable: {e}")
        _client = None
        return None


def cache_get(key: str):
    """Get cached value. Returns None on miss or Redis down."""
    try:
        client = _get_redis()
        if not client:
            return None
        raw = client.get(key)
        if raw is None:
            return None
        return json.loads(raw)
    except Exception as e:
        logger.debug(f"Cache get error for {key}: {e}")
        return None


def cache_set(key: str, value, ttl: int = 300):
    """Store value in cache with TTL. Silent on failure."""
    try:
        client = _get_redis()
        if not client:
            return
        client.setex(key, ttl, json.dumps(value, default=str))
    except Exception as e:
        logger.debug(f"Cache set error for {key}: {e}")


def cache_invalidate(pattern: str):
    """Delete keys matching pattern. Silent on failure."""
    try:
        client = _get_redis()
        if not client:
            return
        keys = client.keys(pattern)
        if keys:
            client.delete(*keys)
    except Exception as e:
        logger.debug(f"Cache invalidate error for {pattern}: {e}")
