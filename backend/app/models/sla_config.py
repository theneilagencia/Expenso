import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class SLAConfig(Base):
    __tablename__ = "sla_configs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    stage = Column(String(30), nullable=False)
    value = Column(Integer, nullable=False)
    unit = Column(String(20), nullable=False)
    reminder_1_pct = Column(Integer, nullable=True)
    reminder_2_pct = Column(Integer, nullable=True)
    escalation_action = Column(String(50), nullable=True)
    escalation_target_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    business_start_hour = Column(Integer, default=9)
    business_end_hour = Column(Integer, default=18)
    timezone = Column(String(50), default="America/Sao_Paulo")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
