import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID

from app.db.base import Base


class ExpenseRequest(Base):
    __tablename__ = "expense_requests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    employee_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)
    category_id = Column(UUID(as_uuid=True), ForeignKey("expense_categories.id"), nullable=True)
    cost_center_id = Column(UUID(as_uuid=True), ForeignKey("cost_centers.id"), nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    justification = Column(Text, nullable=True)
    expense_date = Column(DateTime(timezone=True), nullable=True)
    vendor_name = Column(String(255), nullable=True)
    amount = Column(Float, nullable=False)
    currency = Column(String(3), default="BRL")
    amount_brl = Column(Float, nullable=True)
    exchange_rate = Column(Float, nullable=True)
    status = Column(String(30), nullable=False, default="DRAFT", index=True)
    current_version = Column(Integer, default=1)
    submitted_at = Column(DateTime(timezone=True), nullable=True)
    manager_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    finance_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    ai_risk_score = Column(Integer, nullable=True)
    ai_risk_level = Column(String(10), nullable=True)
    ai_recommendation = Column(String(20), nullable=True)
    ai_summary = Column(Text, nullable=True)
    ai_attention_points = Column(JSONB, nullable=True)
    ai_policy_violations = Column(JSONB, nullable=True)
    ai_skipped = Column(Boolean, default=False)
    ai_analyzed_at = Column(DateTime(timezone=True), nullable=True)
    manager_sla_due_at = Column(DateTime(timezone=True), nullable=True)
    finance_sla_due_at = Column(DateTime(timezone=True), nullable=True)
    correction_sla_due_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    deleted_at = Column(DateTime(timezone=True), nullable=True)
