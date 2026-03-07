from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.api.v1.admin import approval_policies as admin_approval_policies
from app.api.v1.admin import calendar as admin_calendar
from app.api.v1.admin import categories as admin_categories
from app.api.v1.admin import hierarchy as admin_hierarchy
from app.api.v1.admin import integrations as admin_integrations
from app.api.v1.admin import sla as admin_sla
from app.api.v1.admin import users as admin_users
from app.api.v1.admin import vendors as admin_vendors
from app.api.v1.admin import webhooks as admin_webhooks
from app.api.v1.routers import (
    admin_status,
    ai,
    attachments,
    audit,
    auth,
    erp_export,
    health,
    notifications,
    payments,
    reports,
    requests,
    users,
)
from app.config import settings
from app.core.middleware import SecurityHeadersMiddleware
from app.core.rate_limit import limiter

app = FastAPI(
    title=settings.APP_NAME,
    description="Smart Expense Management Platform",
    version="1.0.0",
    debug=settings.DEBUG,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
)

# Rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Security headers (outermost middleware — runs on every response)
app.add_middleware(SecurityHeadersMiddleware)

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
app.include_router(admin_approval_policies.router, prefix="/api/v1/admin/approval-policies", tags=["Admin - Approval Policies"])
app.include_router(admin_calendar.router, prefix="/api/v1/admin/calendar", tags=["Admin - Calendar"])
app.include_router(admin_vendors.router, prefix="/api/v1/admin/vendors", tags=["Admin - Vendors"])
app.include_router(admin_hierarchy.router, prefix="/api/v1/admin/hierarchy", tags=["Admin - Hierarchy"])
app.include_router(admin_webhooks.router, prefix="/api/v1/admin/webhooks", tags=["Admin - Webhooks"])
app.include_router(admin_status.router, prefix="/api/v1/admin", tags=["Admin - System"])

# AI
app.include_router(ai.router, prefix="/api/v1/ai", tags=["AI"])

# Notifications
app.include_router(notifications.router, prefix="/api/v1/notifications", tags=["Notifications"])

# Reports
app.include_router(reports.router, prefix="/api/v1/reports", tags=["Reports"])
app.include_router(erp_export.router, prefix="/api/v1/reports", tags=["Reports - ERP"])

# Audit
app.include_router(audit.router, prefix="/api/v1/audit", tags=["Audit"])

# Attachments
app.include_router(attachments.router, prefix="/api/v1", tags=["Attachments"])
