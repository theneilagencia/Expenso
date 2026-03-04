import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, Date, DateTime, String
from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class CorporateCalendar(Base):
    __tablename__ = "corporate_calendar"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    date = Column(Date, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    type = Column(String(20), nullable=False)
    state_code = Column(String(2), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
