from fastapi import Depends, HTTPException, status

from app.core.security import get_current_user

# Role hierarchy: higher value = more privileges
ROLE_HIERARCHY = {
    "EMPLOYEE": 1,
    "MANAGER": 2,
    "FINANCE": 3,
    "ADMIN": 4,
}


def require_role(*roles):
    """Require the current user to have one of the specified roles."""
    def dependency(current_user=Depends(get_current_user)):
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={"error": "FORBIDDEN", "message": f"Required role: {', '.join(roles)}"},
            )
        return current_user
    return dependency


def require_min_role(min_role: str):
    """Require the current user to have at least the specified role level."""
    min_level = ROLE_HIERARCHY.get(min_role, 0)

    def dependency(current_user=Depends(get_current_user)):
        user_level = ROLE_HIERARCHY.get(current_user.role, 0)
        if user_level < min_level:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={"error": "FORBIDDEN", "message": f"Minimum role required: {min_role}"},
            )
        return current_user
    return dependency
