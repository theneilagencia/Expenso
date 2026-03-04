"""Initial schema with 17 tables

Revision ID: 001
Revises: None
Create Date: 2026-03-04

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import JSONB, UUID

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. departments
    op.create_table(
        "departments",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("code", sa.String(50), unique=True, nullable=False),
        sa.Column("head_user_id", UUID(as_uuid=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )

    # 2. cost_centers
    op.create_table(
        "cost_centers",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("code", sa.String(50), unique=True, nullable=False),
        sa.Column("department_id", UUID(as_uuid=True), sa.ForeignKey("departments.id"), nullable=True),
        sa.Column("is_active", sa.Boolean(), default=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )

    # 3. users
    op.create_table(
        "users",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("full_name", sa.String(255), nullable=False),
        sa.Column("email", sa.String(255), unique=True, nullable=False),
        sa.Column("password_hash", sa.Text(), nullable=False),
        sa.Column("role", sa.String(20), nullable=False, server_default="EMPLOYEE"),
        sa.Column("status", sa.String(20), nullable=False, server_default="ACTIVE"),
        sa.Column("department_id", UUID(as_uuid=True), sa.ForeignKey("departments.id"), nullable=True),
        sa.Column("cost_center_id", UUID(as_uuid=True), sa.ForeignKey("cost_centers.id"), nullable=True),
        sa.Column("manager_id", UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("substitute_id", UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("substitute_until", sa.DateTime(timezone=True), nullable=True),
        sa.Column("revolut_counterparty_id", sa.String(255), nullable=True),
        sa.Column("pix_key", sa.String(255), nullable=True),
        sa.Column("preferred_payment", sa.String(20), server_default="PIX"),
        sa.Column("locale", sa.String(10), nullable=False, server_default="en-US"),
        sa.Column("mfa_enabled", sa.Boolean(), server_default="false"),
        sa.Column("mfa_secret", sa.Text(), nullable=True),
        sa.Column("sso_provider", sa.String(50), nullable=True),
        sa.Column("sso_external_id", sa.String(255), nullable=True),
        sa.Column("last_login_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("password_changed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("force_password_reset", sa.Boolean(), server_default="false"),
        sa.Column("created_by", UUID(as_uuid=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_users_email", "users", ["email"])
    op.create_index("ix_users_role", "users", ["role"])

    # Add FK from departments.head_user_id -> users.id
    op.create_foreign_key("fk_departments_head_user", "departments", "users", ["head_user_id"], ["id"])

    # 4. expense_categories
    op.create_table(
        "expense_categories",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("icon", sa.String(10), nullable=True),
        sa.Column("limit_per_request", sa.Float(), nullable=True),
        sa.Column("limit_per_month", sa.Float(), nullable=True),
        sa.Column("max_days_to_submit", sa.Integer(), server_default="90"),
        sa.Column("receipt_required_above", sa.Float(), nullable=True),
        sa.Column("requires_strong_just", sa.Boolean(), server_default="false"),
        sa.Column("min_justification_chars", sa.Integer(), server_default="20"),
        sa.Column("ai_attention_score", sa.Integer(), server_default="50"),
        sa.Column("tax_deductibility_pct", sa.Float(), nullable=True),
        sa.Column("is_active", sa.Boolean(), server_default="true"),
        sa.Column("sort_order", sa.Integer(), server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )

    # 5. expense_requests
    op.create_table(
        "expense_requests",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("employee_id", UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("category_id", UUID(as_uuid=True), sa.ForeignKey("expense_categories.id"), nullable=True),
        sa.Column("cost_center_id", UUID(as_uuid=True), sa.ForeignKey("cost_centers.id"), nullable=True),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("justification", sa.Text(), nullable=True),
        sa.Column("expense_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("vendor_name", sa.String(255), nullable=True),
        sa.Column("amount", sa.Float(), nullable=False),
        sa.Column("currency", sa.String(3), server_default="BRL"),
        sa.Column("amount_brl", sa.Float(), nullable=True),
        sa.Column("exchange_rate", sa.Float(), nullable=True),
        sa.Column("status", sa.String(30), nullable=False, server_default="DRAFT"),
        sa.Column("current_version", sa.Integer(), server_default="1"),
        sa.Column("submitted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("manager_id", UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("finance_user_id", UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("ai_risk_score", sa.Integer(), nullable=True),
        sa.Column("ai_risk_level", sa.String(10), nullable=True),
        sa.Column("ai_recommendation", sa.String(20), nullable=True),
        sa.Column("ai_summary", sa.Text(), nullable=True),
        sa.Column("ai_attention_points", JSONB(), nullable=True),
        sa.Column("ai_policy_violations", JSONB(), nullable=True),
        sa.Column("ai_skipped", sa.Boolean(), server_default="false"),
        sa.Column("ai_analyzed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("manager_sla_due_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("finance_sla_due_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("correction_sla_due_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_expense_requests_employee_id", "expense_requests", ["employee_id"])
    op.create_index("ix_expense_requests_status", "expense_requests", ["status"])

    # 6. request_versions
    op.create_table(
        "request_versions",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("request_id", UUID(as_uuid=True), sa.ForeignKey("expense_requests.id"), nullable=False),
        sa.Column("version_number", sa.Integer(), nullable=False),
        sa.Column("snapshot", JSONB(), nullable=False),
        sa.Column("changed_by", UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("change_reason", sa.String(500), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_request_versions_request_id", "request_versions", ["request_id"])

    # 7. audit_logs (IMMUTABLE)
    op.create_table(
        "audit_logs",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("request_id", UUID(as_uuid=True), sa.ForeignKey("expense_requests.id"), nullable=True),
        sa.Column("actor_id", UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("actor_role", sa.String(20), nullable=True),
        sa.Column("action", sa.String(50), nullable=False),
        sa.Column("previous_status", sa.String(30), nullable=True),
        sa.Column("new_status", sa.String(30), nullable=True),
        sa.Column("justification", sa.Text(), nullable=True),
        sa.Column("diff", JSONB(), nullable=True),
        sa.Column("ai_snapshot", JSONB(), nullable=True),
        sa.Column("ip_address", sa.String(45), nullable=True),
        sa.Column("user_agent", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_audit_logs_request_id", "audit_logs", ["request_id"])

    # 8. request_comments
    op.create_table(
        "request_comments",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("request_id", UUID(as_uuid=True), sa.ForeignKey("expense_requests.id"), nullable=False),
        sa.Column("author_id", UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("type", sa.String(30), server_default="COMMENT"),
        sa.Column("is_internal", sa.Boolean(), server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_request_comments_request_id", "request_comments", ["request_id"])

    # 9. attachments
    op.create_table(
        "attachments",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("request_id", UUID(as_uuid=True), sa.ForeignKey("expense_requests.id"), nullable=False),
        sa.Column("uploaded_by", UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("file_name", sa.String(255), nullable=False),
        sa.Column("file_path", sa.String(500), nullable=False),
        sa.Column("mime_type", sa.String(100), nullable=True),
        sa.Column("size_bytes", sa.Integer(), nullable=True),
        sa.Column("ocr_extracted", JSONB(), nullable=True),
        sa.Column("ocr_processed", sa.Boolean(), server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_attachments_request_id", "attachments", ["request_id"])

    # 10. payments
    op.create_table(
        "payments",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("request_id", UUID(as_uuid=True), sa.ForeignKey("expense_requests.id"), unique=True, nullable=False),
        sa.Column("processed_by", UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("method", sa.String(20), nullable=False),
        sa.Column("revolut_payment_id", sa.String(255), nullable=True),
        sa.Column("revolut_status", sa.String(30), nullable=True),
        sa.Column("revolut_raw_response", JSONB(), nullable=True),
        sa.Column("amount_paid", sa.Float(), nullable=False),
        sa.Column("currency_paid", sa.String(3), server_default="BRL"),
        sa.Column("scheduled_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("payment_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column("receipt_path", sa.String(500), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("retry_count", sa.Integer(), server_default="0"),
        sa.Column("last_error", sa.Text(), nullable=True),
        sa.Column("next_retry_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # 11. sla_configs
    op.create_table(
        "sla_configs",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("stage", sa.String(30), nullable=False),
        sa.Column("value", sa.Integer(), nullable=False),
        sa.Column("unit", sa.String(20), nullable=False),
        sa.Column("reminder_1_pct", sa.Integer(), nullable=True),
        sa.Column("reminder_2_pct", sa.Integer(), nullable=True),
        sa.Column("escalation_action", sa.String(50), nullable=True),
        sa.Column("escalation_target_id", UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("business_start_hour", sa.Integer(), server_default="9"),
        sa.Column("business_end_hour", sa.Integer(), server_default="18"),
        sa.Column("timezone", sa.String(50), server_default="'America/Sao_Paulo'"),
        sa.Column("is_active", sa.Boolean(), server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # 12. approval_policies
    op.create_table(
        "approval_policies",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("min_amount", sa.Float(), nullable=True),
        sa.Column("max_amount", sa.Float(), nullable=True),
        sa.Column("department_id", UUID(as_uuid=True), sa.ForeignKey("departments.id"), nullable=True),
        sa.Column("approval_flow", JSONB(), nullable=True),
        sa.Column("is_active", sa.Boolean(), server_default="true"),
        sa.Column("sort_order", sa.Integer(), server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # 13. integrations
    op.create_table(
        "integrations",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("type", sa.String(30), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("config", JSONB(), nullable=True),
        sa.Column("is_active", sa.Boolean(), server_default="false"),
        sa.Column("last_sync_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("last_error", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # 14. ai_analysis_logs
    op.create_table(
        "ai_analysis_logs",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("request_id", UUID(as_uuid=True), sa.ForeignKey("expense_requests.id"), nullable=True),
        sa.Column("triggered_by", UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("ai_role", sa.String(20), nullable=False),
        sa.Column("model_used", sa.String(50), nullable=True),
        sa.Column("prompt_hash", sa.String(64), nullable=True),
        sa.Column("input_tokens", sa.Integer(), nullable=True),
        sa.Column("output_tokens", sa.Integer(), nullable=True),
        sa.Column("response", JSONB(), nullable=True),
        sa.Column("duration_ms", sa.Integer(), nullable=True),
        sa.Column("status", sa.String(20), server_default="SUCCESS"),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_ai_analysis_logs_request_id", "ai_analysis_logs", ["request_id"])

    # 15. vendor_lists
    op.create_table(
        "vendor_lists",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("document", sa.String(50), nullable=True),
        sa.Column("list_type", sa.String(20), nullable=False),
        sa.Column("category_id", UUID(as_uuid=True), sa.ForeignKey("expense_categories.id"), nullable=True),
        sa.Column("reason", sa.Text(), nullable=True),
        sa.Column("valid_from", sa.DateTime(timezone=True), nullable=True),
        sa.Column("valid_until", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_by", UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )

    # 16. notifications
    op.create_table(
        "notifications",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("request_id", UUID(as_uuid=True), sa.ForeignKey("expense_requests.id"), nullable=True),
        sa.Column("type", sa.String(50), nullable=False),
        sa.Column("channel", sa.String(20), server_default="IN_APP"),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("body", sa.Text(), nullable=True),
        sa.Column("is_read", sa.Boolean(), server_default="false"),
        sa.Column("sent_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("read_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_notifications_user_id", "notifications", ["user_id"])

    # 17. corporate_calendar
    op.create_table(
        "corporate_calendar",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("type", sa.String(20), nullable=False),
        sa.Column("state_code", sa.String(2), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_corporate_calendar_date", "corporate_calendar", ["date"])


def downgrade() -> None:
    op.drop_table("corporate_calendar")
    op.drop_table("notifications")
    op.drop_table("vendor_lists")
    op.drop_table("ai_analysis_logs")
    op.drop_table("integrations")
    op.drop_table("approval_policies")
    op.drop_table("sla_configs")
    op.drop_table("payments")
    op.drop_table("attachments")
    op.drop_table("request_comments")
    op.drop_table("audit_logs")
    op.drop_table("request_versions")
    op.drop_table("expense_requests")
    op.drop_table("expense_categories")
    op.drop_constraint("fk_departments_head_user", "departments", type_="foreignkey")
    op.drop_table("users")
    op.drop_table("cost_centers")
    op.drop_table("departments")
