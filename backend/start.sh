#!/bin/bash
set -e

echo "=== Expenso Backend Startup ==="
echo "Python: $(python --version)"

echo "--- Running Alembic migrations ---"
alembic upgrade head || echo "WARNING: Alembic migration failed (continuing without migrations)"

echo "--- Starting uvicorn ---"
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-10000}" --workers 1
