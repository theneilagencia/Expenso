# CLAUDE.md — Expenso

> Smart Expense Management Platform
> This file is the source of truth for Claude Code sessions.

---

## Project Identity

- **Name:** Expenso
- **Tagline:** Smart Expense Management Platform
- **Repository:** github.com/theneilagencia/Expenso (private)
- **Deploy:** Render (future: AWS)
- **Languages:** English (en-US, default) + Português (pt-BR)

---

## Tech Stack

### Frontend
- Vue 3 (Composition API) + Vite
- JavaScript ES2022+
- SCSS with `@/` alias → `src/`
- BTS Design System
- Pinia (state), Vue Router 4, Axios
- vue-i18n v9 (en-US, pt-BR)
- Vitest + Vue Testing Library

### Backend
- Python 3.11+ + FastAPI
- SQLAlchemy 2.x + Alembic
- PostgreSQL 15 + pgvector
- Redis + Celery (async tasks + beat)
- Pydantic v2 + pydantic-settings
- JWT: python-jose + passlib[bcrypt]
- MinIO (S3-compatible storage)
- Anthropic SDK (claude-sonnet-4-20250514)

### Infra
- Docker + Docker Compose (dev)
- Render (prod)
- GitHub Actions (CI/CD)

---

## Sprint 1 Checklist

- [x] Monorepo folder structure
- [x] CLAUDE.md
- [x] Frontend base (Vue 3 + Vite + i18n + SCSS + Pinia + Router + Axios)
- [x] Backend base (FastAPI + SQLAlchemy + Alembic + Celery + Redis)
- [x] Docker Compose + Dockerfiles
- [x] Initial Alembic migration (17 tables)
- [x] Seed script (categories, SLAs, admin user)
- [x] .env.example files
- [x] GitHub Actions (CI backend, CI frontend, CD Render)
- [x] render.yaml
- [x] README.md
- [x] .gitignore files

---

## Code Conventions

### Backend (Python)
- snake_case files/functions/vars; PascalCase classes
- router → service → repository → model (strict separation)
- No router accesses DB directly
- All relevant actions → audit_log
- Errors: `{"error": "ERROR_CODE", "message": "...", "details": {}}`

### Frontend (JavaScript/Vue)
- PascalCase components: `RequestCard.vue`
- camelCase composables: `useAuth.js`
- Suffix `View` for pages: `DashboardView.vue`
- Suffix `.store` for stores: `auth.store.js`
- SCREAMING_SNAKE_CASE constants
- BEM in `<style lang="scss" scoped>`
- Imports via `@/` alias, never relative
- All visible text via `t('key')` — zero hardcoded strings

### Git
- Semantic commits: feat:, fix:, chore:, docs:, test:, refactor:
- One commit per logical unit

---

## State Machine (Expense Requests)

```
DRAFT → [submit] → PENDING_AI
  PENDING_AI → PENDING_MANAGER | REJECTED_AI
  PENDING_MANAGER → PENDING_FINANCE | REJECTED_MANAGER | IN_CORRECTION
  PENDING_FINANCE → IN_PAYMENT | REJECTED_FINANCE | IN_CORRECTION
  IN_CORRECTION → PENDING_AI (re-analysis)
  IN_PAYMENT → PAID
  DRAFT → CANCELLED
```

---

## AI Engine — 5 Roles

1. **ASSISTANT** — real-time form help (SSE streaming)
2. **ANALYST** — post-submission risk analysis (Celery task)
3. **WRITER** — summaries, comments, notifications
4. **STRATEGIST** — scheduled forecasts/optimization (Celery beat)
5. **CHATBOT** — in-app Q&A widget (SSE streaming)

Fallback: if Claude API unavailable → `ai_skipped: true` → flow continues

---

## Database — 17 Tables

users, departments, cost_centers, expense_categories, expense_requests,
request_versions, audit_logs, request_comments, attachments, payments,
sla_configs, approval_policies, integrations, ai_analysis_logs,
vendor_lists, notifications, corporate_calendar

All use UUID v4 PK, UTC timestamps, soft delete (except audit_logs — immutable).

---

## Key API Endpoints

- `POST /api/v1/auth/login|refresh|logout`
- `GET|PATCH /api/v1/users/me`
- `POST|GET /api/v1/requests` + `/{id}/submit|approve|reject|request-edit|cancel`
- `POST|GET /api/v1/payments`
- `GET /api/v1/ai/assist|chat` (SSE)
- `GET /api/v1/reports/summary|narrative|export`
- `CRUD /api/v1/admin/users|categories|sla|integrations`
- `GET /health`
