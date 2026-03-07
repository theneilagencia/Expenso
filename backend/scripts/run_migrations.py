"""Run alembic migrations with full error logging."""
import os
import sys
import traceback

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

print("=== Migration Script ===")
print(f"Python: {sys.version}")
print(f"CWD: {os.getcwd()}")
print(f"DATABASE_URL set: {'DATABASE_URL' in os.environ}")

try:
    from app.config import settings
    db_url = settings.DATABASE_URL
    # Mask password in log
    masked = db_url
    if "@" in masked:
        prefix = masked.split("://")[0]
        after_at = masked.split("@")[1]
        masked = f"{prefix}://***:***@{after_at}"
    print(f"DATABASE_URL: {masked}")
except Exception as e:
    print(f"ERROR loading config: {e}")
    sys.exit(1)

# Test raw DB connection first
print("\n--- Testing DB connection ---")
try:
    from sqlalchemy import create_engine, text
    engine = create_engine(db_url, connect_args={"connect_timeout": 10})
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1"))
        print(f"SELECT 1 = {result.scalar()}")
        # Check existing tables
        result = conn.execute(text(
            "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename"
        ))
        tables = [r[0] for r in result.fetchall()]
        print(f"Existing tables ({len(tables)}): {tables}")
except Exception as e:
    print(f"DB connection FAILED: {e}")
    traceback.print_exc()
    sys.exit(1)

# Run alembic
print("\n--- Running Alembic upgrade ---")
try:
    from alembic.config import Config
    from alembic import command

    alembic_cfg = Config("alembic.ini")
    alembic_cfg.set_main_option("sqlalchemy.url", db_url)
    command.upgrade(alembic_cfg, "head")
    print("Alembic upgrade completed successfully!")
except Exception as e:
    print(f"Alembic upgrade FAILED: {e}")
    traceback.print_exc()
    sys.exit(1)

# Verify tables after migration
print("\n--- Verifying tables ---")
try:
    with engine.connect() as conn:
        result = conn.execute(text(
            "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename"
        ))
        tables = [r[0] for r in result.fetchall()]
        print(f"Tables after migration ({len(tables)}): {tables}")
except Exception as e:
    print(f"Verification FAILED: {e}")
