import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID

from app.db.base import Base


class Payment(Base):
    __tablename__ = "payments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    request_id = Column(UUID(as_uuid=True), ForeignKey("expense_requests.id"), unique=True, nullable=False)
    processed_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    method = Column(String(20), nullable=False)
    revolut_payment_id = Column(String(255), nullable=True)
    revolut_status = Column(String(30), nullable=True)
    revolut_raw_response = Column(JSONB, nullable=True)
    amount_paid = Column(Float, nullable=False)
    currency_paid = Column(String(3), default="BRL")
    scheduled_date = Column(DateTime(timezone=True), nullable=True)
    payment_date = Column(DateTime(timezone=True), nullable=True)
    receipt_path = Column(String(500), nullable=True)
    notes = Column(Text, nullable=True)
    retry_count = Column(Integer, default=0)
    last_error = Column(Text, nullable=True)
    next_retry_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
