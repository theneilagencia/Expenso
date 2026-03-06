"""Add performance indexes for reports, payments, AI logs, notifications

Revision ID: 002
Revises: 001
Create Date: 2026-03-05

"""
from typing import Sequence, Union

from alembic import op

revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_index(
        "ix_expense_requests_status_created",
        "expense_requests",
        ["status", "created_at"],
    )
    op.create_index(
        "ix_expense_requests_employee_status",
        "expense_requests",
        ["employee_id", "status"],
    )
    op.create_index(
        "ix_ai_analysis_logs_role_created",
        "ai_analysis_logs",
        ["ai_role", "created_at"],
    )
    op.create_index(
        "ix_notifications_user_read",
        "notifications",
        ["user_id", "read_at"],
    )


def downgrade() -> None:
    op.drop_index("ix_notifications_user_read", table_name="notifications")
    op.drop_index("ix_ai_analysis_logs_role_created", table_name="ai_analysis_logs")
    op.drop_index("ix_expense_requests_employee_status", table_name="expense_requests")
    op.drop_index("ix_expense_requests_status_created", table_name="expense_requests")
