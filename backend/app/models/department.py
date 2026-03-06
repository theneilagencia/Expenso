import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class Department(Base):
    __tablename__ = "departments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    code = Column(String(50), unique=True, nullable=False)
    head_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    parent_department_id = Column(UUID(as_uuid=True), ForeignKey("departments.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    users = relationship("User", back_populates="department", foreign_keys="User.department_id")
    parent = relationship("Department", remote_side=[id], foreign_keys=[parent_department_id])
    children = relationship("Department", back_populates="parent", foreign_keys=[parent_department_id])
