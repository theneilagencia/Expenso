from typing import Optional

from pydantic import BaseModel


class UserResponse(BaseModel):
    id: str
    full_name: str
    email: str
    role: str
    locale: str
    status: str

    class Config:
        from_attributes = True


class UserUpdateRequest(BaseModel):
    locale: Optional[str] = None
