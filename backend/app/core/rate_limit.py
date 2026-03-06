"""Rate limiting with SlowAPI — Redis-backed, configurable per-endpoint."""

from slowapi import Limiter
from slowapi.util import get_remote_address
from starlette.requests import Request

from app.config import settings


def _get_user_id_or_ip(request: Request) -> str:
    """Key function: use authenticated user ID if available, else IP."""
    # After auth middleware sets request.state.user, use user id
    if hasattr(request.state, "user") and request.state.user:
        return str(request.state.user.id)
    # Fallback: try Authorization header to extract sub claim
    auth = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        try:
            from app.core.security import jwt
            from app.core.security import settings as jwt_settings

            token = auth.split(" ", 1)[1]
            payload = jwt.decode(
                token,
                jwt_settings.JWT_SECRET_KEY,
                algorithms=[jwt_settings.JWT_ALGORITHM],
            )
            user_id = payload.get("sub")
            if user_id:
                return user_id
        except Exception:
            pass
    return get_remote_address(request)


def _get_ip(request: Request) -> str:
    """Key function: always use remote IP (for public endpoints like login)."""
    return get_remote_address(request)


# Create limiter with Redis storage if available, in-memory otherwise
_storage_uri = settings.REDIS_URL if settings.REDIS_URL else "memory://"

limiter = Limiter(
    key_func=_get_user_id_or_ip,
    default_limits=[],
    storage_uri=_storage_uri,
    enabled=settings.RATE_LIMIT_ENABLED,
)
