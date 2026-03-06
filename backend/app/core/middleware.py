"""Security middleware — headers, production error handler."""

import logging
import traceback

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response

from app.config import settings

logger = logging.getLogger(__name__)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Inject security headers on every response."""

    async def dispatch(self, request: Request, call_next) -> Response:
        try:
            response = await call_next(request)
        except Exception as exc:
            # Production error handler — suppress stack traces
            if not settings.DEBUG:
                logger.error(f"Unhandled error: {exc}\n{traceback.format_exc()}")
                return JSONResponse(
                    status_code=500,
                    content={"error": "INTERNAL_ERROR", "message": "An internal error occurred"},
                )
            raise

        # Security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"

        # HSTS — only in production (non-debug)
        if not settings.DEBUG:
            response.headers["Strict-Transport-Security"] = (
                "max-age=31536000; includeSubDomains; preload"
            )
            response.headers["Content-Security-Policy"] = (
                "default-src 'self'; "
                "script-src 'self'; "
                "style-src 'self' 'unsafe-inline'; "
                "img-src 'self' data:; "
                "font-src 'self'; "
                "connect-src 'self'; "
                "frame-ancestors 'none'"
            )

        return response
