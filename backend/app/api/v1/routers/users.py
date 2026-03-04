from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.dependencies import get_db
from app.schemas.user import UserResponse, UserUpdateRequest

router = APIRouter()


@router.get("/me", response_model=UserResponse, summary="Get current user profile")
async def get_me(current_user=Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserResponse, summary="Update current user profile")
async def update_me(
    request: UserUpdateRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if request.locale is not None:
        if request.locale not in ("en-US", "pt-BR"):
            raise HTTPException(status_code=400, detail="Invalid locale")
        current_user.locale = request.locale

    db.commit()
    db.refresh(current_user)
    return current_user
