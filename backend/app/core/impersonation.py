from fastapi import HTTPException, Request, status
from jose import JWTError, jwt

from app.config import settings


def get_impersonation_context(request: Request) -> dict | None:
    """Check if request has impersonation header. Returns context or None."""
    impersonate_header = request.headers.get("X-Impersonate-User")
    if not impersonate_header:
        return None

    # The token must be an admin token with impersonation claims
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        return None

    token = auth_header.split(" ", 1)[1]
    try:
        payload = jwt.decode(
            token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
        )
        if payload.get("role") != "ADMIN":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only admins can impersonate",
            )
        return {
            "impersonated_by": payload.get("sub"),
            "target_user_id": impersonate_header,
            "is_read_only": True,
        }
    except JWTError:
        return None
