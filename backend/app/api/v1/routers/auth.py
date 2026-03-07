import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.config import settings
from app.core.rate_limit import _get_ip, limiter
from app.core.security import (
    create_access_token,
    create_mfa_token,
    create_password_reset_token,
    create_refresh_token,
    decode_mfa_token,
    decode_password_reset_token,
    decode_refresh_token,
    get_current_user,
    hash_password,
    verify_password,
)
from app.dependencies import get_db
from app.schemas.auth import (
    ChangePasswordRequest,
    LoginRequest,
    MFAConfirmRequest,
    MFADisableRequest,
    MFALoginResponse,
    MFASetupResponse,
    MFAVerifyRequest,
    PasswordResetConfirm,
    PasswordResetRequest,
    RefreshRequest,
    SSOLoginRequest,
    TokenResponse,
)
from app.services.mfa_service import MFAService

logger = logging.getLogger(__name__)

router = APIRouter()


def _build_token_response(user) -> TokenResponse:
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


@router.post("/login", response_model=None, summary="Authenticate user and return tokens")
@limiter.limit("5/minute", key_func=_get_ip)
async def login(body: LoginRequest, request: Request, db: Session = Depends(get_db)):
    from app.models.user import User

    user = db.query(User).filter(User.email == body.email, User.deleted_at.is_(None)).first()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": "INVALID_CREDENTIALS", "message": "Invalid email or password"},
        )
    if user.status != "ACTIVE":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"error": "ACCOUNT_INACTIVE", "message": "Account is not active"},
        )

    user.last_login_at = datetime.now(timezone.utc)
    db.commit()

    # If MFA is enabled, return MFA challenge instead of full tokens
    if user.mfa_enabled and user.mfa_secret:
        mfa_token = create_mfa_token(str(user.id))
        return MFALoginResponse(mfa_required=True, mfa_token=mfa_token)

    return _build_token_response(user)


@router.post("/refresh", response_model=TokenResponse, summary="Refresh access token")
@limiter.limit("10/minute", key_func=_get_ip)
async def refresh(body: RefreshRequest, request: Request, db: Session = Depends(get_db)):
    from app.models.user import User

    payload = decode_refresh_token(body.refresh_token)
    user_id = payload["sub"]

    user = db.query(User).filter(User.id == user_id, User.deleted_at.is_(None)).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    if user.status != "ACTIVE":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is not active")

    return _build_token_response(user)


@router.post("/logout", summary="Logout user")
async def logout():
    return {"message": "Logged out successfully"}


@router.post("/password-reset/request", summary="Request password reset email")
@limiter.limit("3/minute", key_func=_get_ip)
async def request_password_reset(body: PasswordResetRequest, request: Request, db: Session = Depends(get_db)):
    from app.models.user import User

    user = db.query(User).filter(User.email == body.email, User.deleted_at.is_(None)).first()
    if not user:
        # Return success even if user not found to prevent email enumeration
        return {"message": "If the email exists, a reset link has been sent"}

    token = create_password_reset_token(str(user.id))
    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"

    # TODO: Send email via SMTP when configured
    logger.info(f"Password reset requested for {user.email}: {reset_url}")

    return {"message": "If the email exists, a reset link has been sent"}


@router.post("/password-reset/confirm", summary="Confirm password reset with token")
@limiter.limit("5/minute", key_func=_get_ip)
async def confirm_password_reset(body: PasswordResetConfirm, request: Request, db: Session = Depends(get_db)):
    from app.models.user import User

    user_id = decode_password_reset_token(body.token)

    user = db.query(User).filter(User.id == user_id, User.deleted_at.is_(None)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.password_hash = hash_password(body.new_password)
    user.password_changed_at = datetime.now(timezone.utc)
    user.force_password_reset = False
    db.commit()

    return {"message": "Password has been reset successfully"}


@router.post("/change-password", summary="Change password (authenticated)")
async def change_password(
    request: ChangePasswordRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    from app.models.user import User

    if not verify_password(request.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    # Re-fetch from route's db session
    user = db.query(User).filter(User.id == current_user.id).first()
    user.password_hash = hash_password(request.new_password)
    user.password_changed_at = datetime.now(timezone.utc)
    user.force_password_reset = False
    db.commit()

    return {"message": "Password changed successfully"}


@router.post("/mfa/verify", response_model=TokenResponse, summary="Verify MFA code and return tokens")
@limiter.limit("5/minute", key_func=_get_ip)
async def mfa_verify(body: MFAVerifyRequest, request: Request, db: Session = Depends(get_db)):
    from app.models.user import User

    user_id = decode_mfa_token(body.mfa_token)
    user = db.query(User).filter(User.id == user_id, User.deleted_at.is_(None)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": "USER_NOT_FOUND", "message": "User not found"},
        )
    if not user.mfa_enabled or not user.mfa_secret:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "MFA_NOT_ENABLED", "message": "MFA is not enabled for this user"},
        )

    if not MFAService.verify_totp(user.mfa_secret, body.code):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": "INVALID_MFA_CODE", "message": "Invalid MFA code"},
        )

    return _build_token_response(user)


@router.post("/mfa/setup", response_model=MFASetupResponse, summary="Setup MFA for current user")
@limiter.limit("3/minute", key_func=_get_ip)
async def mfa_setup(
    request: Request,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    from app.models.user import User

    if current_user.mfa_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "MFA_ALREADY_ENABLED", "message": "MFA is already enabled"},
        )

    secret = MFAService.generate_secret()

    # Store the secret temporarily so confirm can validate it
    user = db.query(User).filter(User.id == current_user.id).first()
    user.mfa_secret = secret
    db.commit()

    qr_data_uri = MFAService.generate_qr_data_uri(current_user.email, secret)

    return MFASetupResponse(secret=secret, qr_data_uri=qr_data_uri)


@router.post("/mfa/confirm", summary="Confirm MFA setup with first TOTP code")
async def mfa_confirm(
    request: MFAConfirmRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    from app.models.user import User

    if current_user.mfa_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "MFA_ALREADY_ENABLED", "message": "MFA is already enabled"},
        )

    if not current_user.mfa_secret:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "MFA_NOT_SETUP", "message": "Call /auth/mfa/setup first"},
        )

    if not MFAService.verify_totp(current_user.mfa_secret, request.code):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "INVALID_MFA_CODE", "message": "Invalid MFA code"},
        )

    user = db.query(User).filter(User.id == current_user.id).first()
    user.mfa_enabled = True
    db.commit()

    logger.info(f"MFA enabled for user {current_user.email}")
    return {"message": "MFA enabled successfully"}


@router.delete("/mfa", summary="Disable MFA for current user")
async def mfa_disable(
    request: MFADisableRequest,
    current_user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    from app.models.user import User

    if not current_user.mfa_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "MFA_NOT_ENABLED", "message": "MFA is not enabled"},
        )

    if not verify_password(request.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"error": "INVALID_PASSWORD", "message": "Current password is incorrect"},
        )

    user = db.query(User).filter(User.id == current_user.id).first()
    user.mfa_enabled = False
    user.mfa_secret = None
    db.commit()

    logger.info(f"MFA disabled for user {current_user.email}")
    return {"message": "MFA disabled successfully"}


@router.post("/sso/login", response_model=TokenResponse, summary="Login via SSO provider")
async def sso_login(request: SSOLoginRequest, db: Session = Depends(get_db)):
    from app.models.user import User

    if request.provider == "azure_ad":
        if not settings.AZURE_AD_CLIENT_ID:
            raise HTTPException(status_code=501, detail="Azure AD SSO not configured")
        sso_user = await _exchange_azure_ad_code(request.code, request.redirect_uri)
    elif request.provider == "google":
        if not settings.GOOGLE_CLIENT_ID:
            raise HTTPException(status_code=501, detail="Google SSO not configured")
        sso_user = await _exchange_google_code(request.code, request.redirect_uri)
    else:
        raise HTTPException(status_code=400, detail="Unsupported SSO provider")

    user = (
        db.query(User)
        .filter(
            User.sso_provider == request.provider,
            User.sso_external_id == sso_user["sub"],
            User.deleted_at.is_(None),
        )
        .first()
    )

    if not user:
        user = db.query(User).filter(User.email == sso_user["email"], User.deleted_at.is_(None)).first()
        if user:
            user.sso_provider = request.provider
            user.sso_external_id = sso_user["sub"]
        else:
            raise HTTPException(
                status_code=403,
                detail="No Expenso account linked to this SSO identity. Contact your admin.",
            )

    if user.status != "ACTIVE":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is not active")

    user.last_login_at = datetime.now(timezone.utc)
    db.commit()

    return _build_token_response(user)


@router.get("/sso/config", summary="Get SSO configuration for frontend")
async def sso_config():
    providers = []
    if settings.AZURE_AD_CLIENT_ID:
        providers.append({
            "provider": "azure_ad",
            "client_id": settings.AZURE_AD_CLIENT_ID,
            "tenant_id": settings.AZURE_AD_TENANT_ID,
            "authorize_url": f"https://login.microsoftonline.com/{settings.AZURE_AD_TENANT_ID}/oauth2/v2.0/authorize",
        })
    if settings.GOOGLE_CLIENT_ID:
        providers.append({
            "provider": "google",
            "client_id": settings.GOOGLE_CLIENT_ID,
            "authorize_url": "https://accounts.google.com/o/oauth2/v2/auth",
        })
    return {"providers": providers}


async def _exchange_azure_ad_code(code: str, redirect_uri: str | None) -> dict:
    """Exchange Azure AD authorization code for user info."""
    import httpx

    token_url = f"https://login.microsoftonline.com/{settings.AZURE_AD_TENANT_ID}/oauth2/v2.0/token"
    async with httpx.AsyncClient() as client:
        resp = await client.post(token_url, data={
            "client_id": settings.AZURE_AD_CLIENT_ID,
            "client_secret": settings.AZURE_AD_CLIENT_SECRET,
            "code": code,
            "redirect_uri": redirect_uri or f"{settings.FRONTEND_URL}/auth/callback",
            "grant_type": "authorization_code",
            "scope": "openid email profile",
        })
        if resp.status_code != 200:
            raise HTTPException(status_code=401, detail="Azure AD token exchange failed")
        tokens = resp.json()

        userinfo_resp = await client.get(
            "https://graph.microsoft.com/v1.0/me",
            headers={"Authorization": f"Bearer {tokens['access_token']}"},
        )
        if userinfo_resp.status_code != 200:
            raise HTTPException(status_code=401, detail="Azure AD user info failed")
        info = userinfo_resp.json()
        return {"sub": info["id"], "email": info.get("mail") or info.get("userPrincipalName"), "name": info.get("displayName")}


async def _exchange_google_code(code: str, redirect_uri: str | None) -> dict:
    """Exchange Google authorization code for user info."""
    import httpx

    async with httpx.AsyncClient() as client:
        resp = await client.post("https://oauth2.googleapis.com/token", data={
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "code": code,
            "redirect_uri": redirect_uri or f"{settings.FRONTEND_URL}/auth/callback",
            "grant_type": "authorization_code",
        })
        if resp.status_code != 200:
            raise HTTPException(status_code=401, detail="Google token exchange failed")
        tokens = resp.json()

        userinfo_resp = await client.get(
            "https://www.googleapis.com/oauth2/v3/userinfo",
            headers={"Authorization": f"Bearer {tokens['access_token']}"},
        )
        if userinfo_resp.status_code != 200:
            raise HTTPException(status_code=401, detail="Google user info failed")
        info = userinfo_resp.json()
        return {"sub": info["sub"], "email": info["email"], "name": info.get("name")}
