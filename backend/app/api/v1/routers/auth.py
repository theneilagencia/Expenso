from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies import get_db
from app.core.security import verify_password, create_access_token, create_refresh_token
from app.schemas.auth import LoginRequest, TokenResponse

router = APIRouter()


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Authenticate user and return tokens",
)
async def login(request: LoginRequest, db: Session = Depends(get_db)):
    from app.models.user import User

    user = db.query(User).filter(User.email == request.email, User.deleted_at.is_(None)).first()
    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": "INVALID_CREDENTIALS", "message": "Invalid email or password"},
        )
    if user.status != "ACTIVE":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"error": "ACCOUNT_INACTIVE", "message": "Account is not active"},
        )

    access_token = create_access_token({"sub": str(user.id), "role": user.role})
    refresh_token = create_refresh_token({"sub": str(user.id)})

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user={
            "id": str(user.id),
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role,
            "locale": user.locale,
        },
    )


@router.post("/refresh", summary="Refresh access token")
async def refresh_token():
    raise HTTPException(status_code=501, detail="Not implemented yet")


@router.post("/logout", summary="Logout user")
async def logout():
    return {"message": "Logged out successfully"}
