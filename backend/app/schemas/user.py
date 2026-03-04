from typing import Optional

from pydantic import BaseModel


class UserResponse(BaseModel):
    id: str
    full_name: str
    email: str
    role: str
    locale: str
    status: str
    department_id: Optional[str] = None
    sso_provider: Optional[str] = None
    force_password_reset: bool = False

    class Config:
        from_attributes = True


class UserUpdateRequest(BaseModel):
    locale: Optional[str] = None
    full_name: Optional[str] = None
