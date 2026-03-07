"""Add Sprint 8 performance indexes.

Partial indexes for high-frequency filtered queries.

Revision ID: sprint8_indexes_004
Revises: 003_add_embedding_column
Create Date: 2026-03-06
"""

from alembic import op

revision = "sprint8_indexes_004"
down_revision = "003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Manager pending requests — used by manager dashboard
    op.execute(
        "CREATE INDEX IF NOT EXISTS idx_requests_manager_pending "
        "ON expense_requests(manager_id, status) "
        "WHERE status='PENDING_MANAGER' AND deleted_at IS NULL"
    )

    # Finance pending requests — used by finance dashboard
    op.execute(
        "CREATE INDEX IF NOT EXISTS idx_requests_finance_pending "
        "ON expense_requests(status) "
        "WHERE status='PENDING_FINANCE' AND deleted_at IS NULL"
    )

    # Audit logs by request — used by request detail views
    op.execute(
        "CREATE INDEX IF NOT EXISTS idx_audit_logs_request_created "
        "ON audit_logs(request_id, created_at DESC)"
    )

    # Unread notifications per user — used by notification badge polling
    op.execute(
        "CREATE INDEX IF NOT EXISTS idx_notifications_user_unread "
        "ON notifications(user_id, is_read) "
        "WHERE is_read=FALSE"
    )

    # Employee active requests — used by employee dashboard
    op.execute(
        "CREATE INDEX IF NOT EXISTS idx_requests_employee_deleted "
        "ON expense_requests(employee_id, status) "
        "WHERE deleted_at IS NULL"
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS idx_requests_manager_pending")
    op.execute("DROP INDEX IF EXISTS idx_requests_finance_pending")
    op.execute("DROP INDEX IF EXISTS idx_audit_logs_request_created")
    op.execute("DROP INDEX IF EXISTS idx_notifications_user_unread")
    op.execute("DROP INDEX IF EXISTS idx_requests_employee_deleted")
