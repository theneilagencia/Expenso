from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "Expenso"
    APP_ENV: str = "development"
    DEBUG: bool = True

    SECRET_KEY: str = "change-me-in-production"
    ALLOWED_ORIGINS: str = "http://localhost:5173"

    DATABASE_URL: str = "postgresql://expenso:expenso@localhost:5432/expenso_db"
    REDIS_URL: str = "redis://localhost:6379/0"

    CELERY_BROKER_URL: str = "redis://localhost:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/1"

    MINIO_ENDPOINT: str = "localhost:9000"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin"
    MINIO_BUCKET: str = "expenso-files"
    MINIO_SECURE: bool = False

    JWT_SECRET_KEY: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    ANTHROPIC_API_KEY: str = ""

    # Password reset
    PASSWORD_RESET_EXPIRE_HOURS: int = 2
    FRONTEND_URL: str = "http://localhost:5173"

    # SMTP (for password reset emails)
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = "noreply@expenso.app"

    # SSO — Azure AD
    AZURE_AD_CLIENT_ID: str = ""
    AZURE_AD_CLIENT_SECRET: str = ""
    AZURE_AD_TENANT_ID: str = ""

    # SSO — Google Workspace
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""

    model_config = {"env_file": ".env", "case_sensitive": True}


settings = Settings()
