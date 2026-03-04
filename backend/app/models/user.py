import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(Text, nullable=False)
    role = Column(String(20), nullable=False, default="EMPLOYEE")
    status = Column(String(20), nullable=False, default="ACTIVE")
    department_id = Column(UUID(as_uuid=True), ForeignKey("departments.id"), nullable=True)
    cost_center_id = Column(UUID(as_uuid=True), ForeignKey("cost_centers.id"), nullable=True)
    manager_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    substitute_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    substitute_until = Column(DateTime(timezone=True), nullable=True)
    revolut_counterparty_id = Column(String(255), nullable=True)
    pix_key = Column(String(255), nullable=True)
    preferred_payment = Column(String(20), nullable=True, default="PIX")
    locale = Column(String(10), nullable=False, default="en-US")
    mfa_enabled = Column(Boolean, default=False)
    mfa_secret = Column(Text, nullable=True)
    sso_provider = Column(String(50), nullable=True)
    sso_external_id = Column(String(255), nullable=True)
    last_login_at = Column(DateTime(timezone=True), nullable=True)
    password_changed_at = Column(DateTime(timezone=True), nullable=True)
    force_password_reset = Column(Boolean, default=False)
    created_by = Column(UUID(as_uuid=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    deleted_at = Column(DateTime(timezone=True), nullable=True)

    department = relationship("Department", back_populates="users", foreign_keys=[department_id])
    manager = relationship("User", remote_side=[id], foreign_keys=[manager_id])
    substitute = relationship("User", remote_side=[id], foreign_keys=[substitute_id])
