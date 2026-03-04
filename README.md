# Expenso

> Smart Expense Management Platform

Modular platform for expense control and employee reimbursement with AI-powered automation.

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | Vue 3, Vite, Pinia, Vue Router, vue-i18n, SCSS, Axios |
| Backend | Python 3.11+, FastAPI, SQLAlchemy 2.x, Alembic, Celery |
| Database | PostgreSQL 15 + pgvector |
| Cache/Queue | Redis |
| Storage | MinIO (S3-compatible) |
| AI | Anthropic Claude (claude-sonnet-4-20250514) |
| Infra | Docker, Render, GitHub Actions |

## Architecture

```
expenso/
  frontend/     Vue 3 SPA (Composition API)
  backend/      FastAPI REST API
  infra/        Infrastructure configs
  docs/         Documentation
  .github/      CI/CD workflows
```

## Languages

- English (en-US) - default
- Portuguese (pt-BR)

Language selector available on all screens including login.

## Prerequisites

- Docker & Docker Compose
- Node.js 20+ with pnpm
- Python 3.11+

## Local Setup

### With Docker (recommended)

```bash
# Copy env files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# Start all services
docker compose up -d

# Run migrations
docker compose exec backend alembic upgrade head

# Seed database
docker compose exec backend python scripts/seed_db.py
```

Services:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- MinIO Console: http://localhost:9001

### Without Docker

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # edit with your values
alembic upgrade head
python scripts/seed_db.py
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
pnpm install
cp .env.example .env.local
pnpm dev
```

## Default Admin

- Email: `admin@expenso.io`
- Password: `Admin@2026!`
- Force password reset on first login

## Deploy (Render)

1. Connect GitHub repo to Render
2. Use `render.yaml` for infrastructure as code
3. Set secrets: `ANTHROPIC_API_KEY`, deploy hooks
4. GitHub Actions handles CI/CD on push to `main`

## Environment Variables

See `backend/.env.example` and `frontend/.env.example` for all required variables.

## License

Proprietary - All rights reserved.
