"""Seed database with default data. Idempotent — safe to run multiple times."""
import os
import sys
import uuid

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.expense_category import ExpenseCategory
from app.models.sla_config import SLAConfig
from app.models.user import User

CATEGORIES = [
    {"name": "Meals & Entertainment", "icon": "\U0001f37d", "limit_per_request": 700, "limit_per_month": 2000, "max_days_to_submit": 90, "ai_attention_score": 50, "sort_order": 1},
    {"name": "Transportation", "icon": "\u2708", "limit_per_request": 3000, "limit_per_month": 8000, "max_days_to_submit": 90, "ai_attention_score": 40, "sort_order": 2},
    {"name": "Accommodation", "icon": "\U0001f3e8", "limit_per_request": 800, "limit_per_month": 5000, "max_days_to_submit": 90, "ai_attention_score": 60, "sort_order": 3},
    {"name": "Office Supplies", "icon": "\U0001f4e6", "limit_per_request": 500, "limit_per_month": 1500, "max_days_to_submit": 90, "ai_attention_score": 30, "sort_order": 4},
    {"name": "Training & Education", "icon": "\U0001f393", "limit_per_request": 2000, "limit_per_month": 5000, "max_days_to_submit": 60, "ai_attention_score": 25, "sort_order": 5},
    {"name": "Software & Subscriptions", "icon": "\U0001f4bb", "limit_per_request": 500, "limit_per_month": 2000, "max_days_to_submit": 30, "ai_attention_score": 20, "sort_order": 6},
    {"name": "Corporate Entertainment", "icon": "\U0001f91d", "limit_per_request": 1500, "limit_per_month": 3000, "max_days_to_submit": 90, "ai_attention_score": 65, "sort_order": 7},
    {"name": "Other", "icon": "\U0001f4cb", "limit_per_request": 2000, "limit_per_month": None, "max_days_to_submit": 90, "ai_attention_score": 70, "sort_order": 8},
]

SLA_DEFAULTS = [
    {"stage": "MANAGER_APPROVAL", "value": 48, "unit": "BUSINESS_HOURS", "reminder_1_pct": 50, "reminder_2_pct": 90, "escalation_action": "ASSIGN_SUBSTITUTE"},
    {"stage": "EMPLOYEE_CORRECTION", "value": 5, "unit": "BUSINESS_DAYS", "reminder_1_pct": 50, "reminder_2_pct": 80, "escalation_action": None},
    {"stage": "FINANCE_APPROVAL", "value": 72, "unit": "BUSINESS_HOURS", "reminder_1_pct": 50, "reminder_2_pct": 90, "escalation_action": "ESCALATE_DEPARTMENT"},
    {"stage": "PAYMENT_PROCESSING", "value": 2, "unit": "BUSINESS_DAYS", "reminder_1_pct": 90, "reminder_2_pct": None, "escalation_action": None},
]


def seed(db: Session) -> None:
    # Categories
    for cat_data in CATEGORIES:
        exists = db.query(ExpenseCategory).filter_by(name=cat_data["name"]).first()
        if not exists:
            db.add(ExpenseCategory(id=uuid.uuid4(), **cat_data))
            print(f"  + Category: {cat_data['name']}")

    # SLAs
    for sla_data in SLA_DEFAULTS:
        exists = db.query(SLAConfig).filter_by(stage=sla_data["stage"]).first()
        if not exists:
            db.add(SLAConfig(id=uuid.uuid4(), **sla_data))
            print(f"  + SLA: {sla_data['stage']}")

    # Admin user
    admin = db.query(User).filter_by(email="admin@expenso.io").first()
    if not admin:
        db.add(User(
            id=uuid.uuid4(),
            full_name="Expenso Admin",
            email="admin@expenso.io",
            password_hash=hash_password("Admin@2026!"),
            role="ADMIN",
            status="ACTIVE",
            locale="en-US",
            force_password_reset=True,
        ))
        print("  + Admin user: admin@expenso.io")

    db.commit()
    print("\nSeed completed successfully!")


if __name__ == "__main__":
    print("Seeding Expenso database...")
    db = SessionLocal()
    try:
        seed(db)
    finally:
        db.close()
