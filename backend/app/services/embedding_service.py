import hashlib
import logging
import math
import struct
from typing import Optional

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.models.expense_request import ExpenseRequest

logger = logging.getLogger(__name__)


class EmbeddingService:
    @staticmethod
    def generate_embedding(text_content: str) -> Optional[list[float]]:
        """Generate a 1536-dim embedding using a deterministic hash-based approach.

        For production, replace with a real embedding API (OpenAI, Voyage, etc.).
        """
        if not text_content or not text_content.strip():
            return None

        chunks = []
        current = text_content
        while len(chunks) < 1536:
            h = hashlib.sha512(current.encode()).digest()
            floats = struct.unpack("d" * 8, h)
            chunks.extend(floats)
            current = current + str(len(chunks))

        embedding = chunks[:1536]
        magnitude = math.sqrt(sum(x * x for x in embedding))
        if magnitude > 0:
            embedding = [x / magnitude for x in embedding]
        return embedding

    @staticmethod
    def build_text_for_embedding(expense: ExpenseRequest) -> str:
        """Build searchable text from expense request fields."""
        parts = [
            expense.title or "",
            expense.description or "",
            expense.justification or "",
            expense.vendor_name or "",
            str(expense.amount or 0),
        ]
        return " ".join(p for p in parts if p)

    @staticmethod
    def find_duplicates(
        db: Session,
        expense: ExpenseRequest,
        threshold: float = 0.92,
        limit: int = 5,
    ) -> list[dict]:
        """Find similar expense requests using cosine similarity via pgvector."""
        if expense.embedding is None:
            return []

        try:
            results = db.execute(
                text("""
                    SELECT id, title, amount, status,
                           1 - (embedding <=> :embedding::vector) as similarity
                    FROM expense_requests
                    WHERE id != :id
                      AND employee_id = :employee_id
                      AND deleted_at IS NULL
                      AND embedding IS NOT NULL
                      AND 1 - (embedding <=> :embedding::vector) > :threshold
                    ORDER BY embedding <=> :embedding::vector
                    LIMIT :limit
                """),
                {
                    "embedding": str(expense.embedding),
                    "id": str(expense.id),
                    "employee_id": str(expense.employee_id),
                    "threshold": threshold,
                    "limit": limit,
                },
            ).fetchall()

            return [
                {
                    "id": str(r.id),
                    "title": r.title,
                    "amount": float(r.amount),
                    "similarity": round(r.similarity, 4),
                }
                for r in results
            ]
        except Exception as e:
            logger.debug(f"Duplicate detection failed (expected on SQLite): {e}")
            return []

    @staticmethod
    def store_embedding(expense: ExpenseRequest, db: Session):
        """Generate and store embedding for an expense request."""
        try:
            text_content = EmbeddingService.build_text_for_embedding(expense)
            embedding = EmbeddingService.generate_embedding(text_content)
            if embedding:
                expense.embedding = embedding
                db.flush()
        except Exception as e:
            logger.debug(f"Embedding storage failed (expected on SQLite): {e}")
