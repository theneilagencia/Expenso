#!/bin/bash
set -e

echo "========================================="
echo "  Expenso v1.0.0 — Deploy Script"
echo "========================================="
echo ""

# ─── Verify required environment variables ───────────────────
required_vars=(
  DATABASE_URL
  REDIS_URL
  SECRET_KEY
  JWT_SECRET_KEY
  ENCRYPTION_KEY
  ANTHROPIC_API_KEY
)

echo "Checking required environment variables..."
missing=0
for var in "${required_vars[@]}"; do
  if [ -z "${!var}" ]; then
    echo "  MISSING: $var"
    missing=1
  else
    echo "  OK: $var"
  fi
done

if [ "$missing" -eq 1 ]; then
  echo ""
  echo "ERROR: One or more required variables are not set."
  echo "Please set them before running this script."
  exit 1
fi
echo ""

# ─── Run database migrations ────────────────────────────────
echo "Running Alembic migrations..."
cd "$(dirname "$0")/../../backend"
python -m alembic upgrade head
echo "Migrations applied successfully."
echo ""

# ─── Seed database (skip if already seeded) ─────────────────
echo "Seeding database..."
python scripts/seed_db.py --skip-if-exists
echo ""

# ─── Health check ────────────────────────────────────────────
if [ -n "$PORT" ]; then
  echo "Waiting for server to start..."
  sleep 3
  echo "Running health check..."
  health=$(curl -sf "http://localhost:${PORT}/health" 2>/dev/null || echo '{"status":"unavailable"}')
  echo "Health: $health"
fi

echo ""
echo "========================================="
echo "  Deploy completed successfully!"
echo "========================================="
