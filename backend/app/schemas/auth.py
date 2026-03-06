from typing import Any, Optional

from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: dict[str, Any]


class RefreshRequest(BaseModel):
    refresh_token: str


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8)


class SSOLoginRequest(BaseModel):
    provider: str = Field(..., pattern="^(azure_ad|google)$")
    code: str
    redirect_uri: Optional[str] = None


class DeleteAccountRequest(BaseModel):
    current_password: str


class MFASetupResponse(BaseModel):
    secret: str
    qr_data_uri: str


class MFAVerifyRequest(BaseModel):
    mfa_token: str
    code: str = Field(..., min_length=6, max_length=6)


class MFAConfirmRequest(BaseModel):
    code: str = Field(..., min_length=6, max_length=6)


class MFADisableRequest(BaseModel):
    current_password: str


class MFALoginResponse(BaseModel):
    mfa_required: bool = True
    mfa_token: str
