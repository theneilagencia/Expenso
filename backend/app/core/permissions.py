from fastapi import Depends, HTTPException, status

from app.core.security import get_current_user


def require_role(*roles):
    def dependency(current_user=Depends(get_current_user)):
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={"error": "FORBIDDEN", "message": f"Required role: {', '.join(roles)}"},
            )
        return current_user
    return dependency
