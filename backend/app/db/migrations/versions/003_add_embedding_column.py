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
    # Add embedding column as Text first (always works)
    op.add_column(
        "expense_requests",
        sa.Column("embedding", sa.Text(), nullable=True),
    )

    # Try to enable pgvector and convert to vector type
    # Falls back gracefully if pgvector extension is not available
    try:
        conn = op.get_bind()
        conn.execute(sa.text("CREATE EXTENSION IF NOT EXISTS vector"))
        conn.execute(
            sa.text(
                "ALTER TABLE expense_requests ALTER COLUMN embedding "
                "TYPE vector(1536) USING embedding::vector(1536)"
            )
        )
        conn.execute(
            sa.text(
                "CREATE INDEX ix_expense_requests_embedding ON expense_requests "
                "USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)"
            )
        )
    except Exception as e:
        print(f"WARNING: pgvector not available, embedding column remains Text: {e}")


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_expense_requests_embedding")
    op.drop_column("expense_requests", "embedding")
