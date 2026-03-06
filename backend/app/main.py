from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.api.v1.admin import categories as admin_categories
from app.api.v1.admin import integrations as admin_integrations
from app.api.v1.admin import sla as admin_sla
from app.api.v1.admin import users as admin_users
from app.api.v1.routers import ai, attachments, audit, auth, health, notifications, payments, reports, requests, users
from app.config import settings
from app.core.rate_limit import limiter

app = FastAPI(
    title=settings.APP_NAME,
    description="Smart Expense Management Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health
app.include_router(health.router, tags=["Health"])

# Auth & User
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])

# Requests
app.include_router(requests.router, prefix="/api/v1/requests", tags=["Requests"])

# Payments
app.include_router(payments.router, prefix="/api/v1/payments", tags=["Payments"])

# Admin
app.include_router(admin_users.router, prefix="/api/v1/admin/users", tags=["Admin - Users"])
app.include_router(admin_categories.router, prefix="/api/v1/admin/categories", tags=["Admin - Categories"])
app.include_router(admin_sla.router, prefix="/api/v1/admin/sla", tags=["Admin - SLA"])
app.include_router(admin_integrations.router, prefix="/api/v1/admin/integrations", tags=["Admin - Integrations"])

# AI
app.include_router(ai.router, prefix="/api/v1/ai", tags=["AI"])

# Notifications
app.include_router(notifications.router, prefix="/api/v1/notifications", tags=["Notifications"])

# Reports
app.include_router(reports.router, prefix="/api/v1/reports", tags=["Reports"])

# Audit
app.include_router(audit.router, prefix="/api/v1/audit", tags=["Audit"])

# Attachments
app.include_router(attachments.router, prefix="/api/v1", tags=["Attachments"])
