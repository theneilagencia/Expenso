"""Sprint 9 features - model updates and webhook_configs table

Revision ID: 005_sprint9
Revises: sprint8_indexes_004
Create Date: 2026-03-06
"""
import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import JSONB, UUID

revision = "005_sprint9"
down_revision = "sprint8_indexes_004"
branch_labels = None
depends_on = None


def upgrade():
    # Add accounting_code to expense_categories
    op.add_column("expense_categories", sa.Column("accounting_code", sa.String(50), nullable=True))

    # Add parent_department_id to departments
    op.add_column(
        "departments",
        sa.Column("parent_department_id", UUID(as_uuid=True), nullable=True),
    )
    op.create_foreign_key(
        "fk_departments_parent",
        "departments",
        "departments",
        ["parent_department_id"],
        ["id"],
    )

    # Add deleted_at to approval_policies
    op.add_column("approval_policies", sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True))

    # Create webhook_configs table
    op.create_table(
        "webhook_configs",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("url", sa.String(500), nullable=False),
        sa.Column("events", JSONB, nullable=False),
        sa.Column("secret", sa.String(255), nullable=True),
        sa.Column("is_active", sa.Boolean(), default=True),
        sa.Column("created_by", UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True)),
        sa.Column("updated_at", sa.DateTime(timezone=True)),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )


def downgrade():
    op.drop_table("webhook_configs")
    op.drop_column("approval_policies", "deleted_at")
    op.drop_constraint("fk_departments_parent", "departments", type_="foreignkey")
    op.drop_column("departments", "parent_department_id")
    op.drop_column("expense_categories", "accounting_code")
