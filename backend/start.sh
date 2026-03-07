#!/bin/bash

echo "=== Expenso Backend Startup ==="
echo "Python: $(python --version)"

echo "--- Running migrations ---"
python scripts/run_migrations.py || echo "WARNING: Migrations failed (see above for details)"

echo "--- Running seed (idempotent) ---"
python scripts/seed_db.py --skip-if-exists || echo "WARNING: Seed failed (see above for details)"

echo "--- Starting uvicorn ---"
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-10000}" --workers 1
