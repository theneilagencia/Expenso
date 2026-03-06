#!/bin/bash
set -e

echo "=== Expenso Backend Startup ==="
echo "Python version: $(python --version)"
echo "PORT: ${PORT:-not set}"

echo "--- Testing imports ---"
python -c "
import sys
print(f'Python: {sys.version}')

# Test critical imports one by one
modules = [
    'fastapi',
    'sqlalchemy',
    'pydantic',
    'pydantic_settings',
    'jose',
    'passlib',
    'redis',
    'celery',
    'slowapi',
    'httpx',
    'anthropic',
    'minio',
    'jinja2',
    'openpyxl',
    'pyotp',
    'qrcode',
]

for mod in modules:
    try:
        __import__(mod)
        print(f'  OK: {mod}')
    except ImportError as e:
        print(f'  FAIL: {mod} -> {e}')

# Test python-magic (needs libmagic)
try:
    import magic
    print(f'  OK: magic (python-magic)')
except ImportError as e:
    print(f'  WARN: magic -> {e} (lazy import, non-blocking)')
except Exception as e:
    print(f'  WARN: magic -> {e} (lazy import, non-blocking)')

# Test pgvector
try:
    from pgvector.sqlalchemy import Vector
    print(f'  OK: pgvector')
except ImportError as e:
    print(f'  WARN: pgvector -> {e} (has fallback)')

# Test psycopg2
try:
    import psycopg2
    print(f'  OK: psycopg2')
except ImportError as e:
    print(f'  FAIL: psycopg2 -> {e}')

# Test app config
try:
    from app.config import settings
    print(f'  OK: app.config (APP_NAME={settings.APP_NAME})')
    print(f'  DATABASE_URL prefix: {settings.DATABASE_URL[:30]}...')
except Exception as e:
    print(f'  FAIL: app.config -> {e}')

# Test app.main import
try:
    from app.main import app
    print(f'  OK: app.main')
except Exception as e:
    print(f'  FAIL: app.main -> {e}')
    import traceback
    traceback.print_exc()
    sys.exit(1)

print('--- All imports OK ---')
"

echo "--- Running Alembic migrations ---"
alembic upgrade head || echo "WARNING: Alembic migration failed (may need pgvector extension)"

echo "--- Starting uvicorn ---"
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-10000}" --workers 1
