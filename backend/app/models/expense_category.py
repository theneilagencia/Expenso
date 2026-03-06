import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class ExpenseCategory(Base):
    __tablename__ = "expense_categories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    icon = Column(String(10), nullable=True)
    limit_per_request = Column(Float, nullable=True)
    limit_per_month = Column(Float, nullable=True)
    max_days_to_submit = Column(Integer, default=90)
    receipt_required_above = Column(Float, nullable=True)
    requires_strong_just = Column(Boolean, default=False)
    min_justification_chars = Column(Integer, default=20)
    ai_attention_score = Column(Integer, default=50)
    tax_deductibility_pct = Column(Float, nullable=True)
    accounting_code = Column(String(50), nullable=True)
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    deleted_at = Column(DateTime(timezone=True), nullable=True)
