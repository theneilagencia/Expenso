from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.api.v1.routers import auth, users, health, requests, payments, ai, notifications
from app.api.v1.admin import users as admin_users, categories as admin_categories, sla as admin_sla, integrations as admin_integrations

app = FastAPI(
    title=settings.APP_NAME,
    description="Smart Expense Management Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

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
