"""Add embedding column for duplicate detection via pgvector

Revision ID: 003
Revises: 002
Create Date: 2026-03-05

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "003"
down_revision: Union[str, None] = "002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")
    op.add_column(
        "expense_requests",
        sa.Column("embedding", sa.Text(), nullable=True),
    )
    op.execute(
        "ALTER TABLE expense_requests ALTER COLUMN embedding TYPE vector(1536) USING embedding::vector(1536)"
    )
    op.execute(
        "CREATE INDEX ix_expense_requests_embedding ON expense_requests "
        "USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)"
    )


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_expense_requests_embedding")
    op.drop_column("expense_requests", "embedding")
