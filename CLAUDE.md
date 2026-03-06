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

## Sprint 1 — COMPLETED (2026-03-04)

PR: https://github.com/theneilagencia/Expenso/pull/2
Merge commit: `7e361f5`

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
- [x] Full API: auth, requests, payments, notifications, reports, audit, attachments
- [x] Frontend: 20+ pages, 25+ components, full i18n (en-US + pt-BR)
- [x] Backend tests: 60/60 passing (pytest + ruff)
- [x] Frontend tests: 115/115 passing (vitest)
- [x] CI/CD: all checks green

---

## Sprint 2 — COMPLETED (2026-03-05)

PR: https://github.com/theneilagencia/Expenso/pull/3
Branch: `feat/sprint-2-auth-rbac`

- [x] JWT refresh tokens + token rotation
- [x] Password reset flow (request + confirm)
- [x] SSO/OAuth stub (Google provider)
- [x] RBAC role guards (EMPLOYEE, MANAGER, FINANCE, ADMIN)
- [x] Celery AI Analyst task stub (risk scoring)
- [x] Celery AI Strategist beat task stub (department aggregation)
- [x] Frontend: password reset views, SSO callback, enhanced auth
- [x] Backend tests: 100/100 passing
- [x] Frontend tests: 181/181 passing

---

## Sprint 3 — COMPLETED (2026-03-05)

Branch: `feat/sprint-2-auth-rbac` (continuation)

- [x] Fix ai_service.py field bugs (amount, employee_id, AIAnalysisLog fields)
- [x] AI result writeback to ExpenseRequest + state transitions
- [x] AI skip fallback (ai_skipped=True when unavailable)
- [x] Rewrite sla_service.py with correct model fields
- [x] Submit flow: justification validation, currency conversion, SLA deadlines
- [x] Currency service (BRL/USD/EUR/GBP with hardcoded rates, TODO: BCB API)
- [x] In-app notifications on all workflow transitions
- [x] Email notification service (SMTP + Jinja2 templates, en-US + pt-BR)
- [x] Async email dispatch via Celery task
- [x] Public API: GET /options/categories, GET /options/cost-centers
- [x] Frontend: dynamic categories/cost-centers from API
- [x] RequestResponse schema: added amount_brl, exchange_rate, SLA, ai_skipped fields
- [x] Backend tests: 137/137 passing (pytest + ruff clean)
- [x] Frontend tests: 202/202 passing (vitest)
- [x] Build: vite production build clean

---

## Sprint 4 — COMPLETED (2026-03-05)

Branch: `feat/sprint-2-auth-rbac` (continuation)

- [x] Dashboard Chart.js visualizations (4 components: Doughnut, Line, Bar×2)
- [x] useChartData composable — parallel data fetching from report endpoints
- [x] ReportsView upgraded: custom SCSS bars → Chart.js components
- [x] AI Strategist: real Claude API call, context builder, JSON parsing, AIAnalysisLog storage
- [x] Strategist fallback: stub result when Anthropic unavailable
- [x] GET /api/v1/ai/strategist/report endpoint (MANAGER/FINANCE/ADMIN)
- [x] StrategistInsightsCard dashboard component
- [x] Payment gateway abstraction (ABC base → MockGateway + RevolutGateway stub)
- [x] PaymentService: initiate_payment, process_via_gateway, retry_failed
- [x] Payment Celery tasks + beat schedule (retry every 15 min)
- [x] Enhanced payment router: status check, manual retry, webhook endpoint
- [x] Redis cache service (non-blocking, graceful fallback)
- [x] Report endpoint caching (dashboard 5 min, aggregated 10 min)
- [x] Performance indexes migration (status+created, employee+status, ai_role+created, user+read)
- [x] Dashboard + reports i18n (en-US + pt-BR)
- [x] Payment + cache config settings
- [x] Backend tests: 165/165 passing (pytest + ruff clean)
- [x] Frontend tests: 218/218 passing (vitest)
- [x] Build: vite production build clean

---

## Sprint 5 — COMPLETED (2026-03-05)

Branch: `feat/sprint-2-auth-rbac` (continuation)

- [x] AI Analyst: full Claude API flow with policy engine hard checks
- [x] AI Analyst: Pydantic AnalystResponse schema validation
- [x] AI Analyst: pgvector duplicate detection (EmbeddingService)
- [x] AI Analyst: prompt hash + duration_ms tracking in AIAnalysisLog
- [x] AI Assistant: SSE streaming for request forms (saved + draft)
- [x] AI Chatbot: SSE streaming with role-based context
- [x] AI Writer: system prompts (en-US + pt-BR)
- [x] AI suggest-comment endpoint
- [x] AI admin usage dashboard endpoint + AdminAIUsageView
- [x] 6 admin views complete (Users, Categories, SLA, Integrations, Audit, AI Usage)
- [x] Backend tests: 200/200 passing (pytest + ruff clean)
- [x] Frontend tests: 226/226 passing (vitest)
- [x] Build: vite production build clean

---

## Sprint 6 — COMPLETED (2026-03-05)

Branch: `feat/sprint-2-auth-rbac` (continuation)

- [x] AI Writer: context builder (narrative, summary, suggest_comment modes)
- [x] AI Writer: stream_narrative, generate_summary, suggest_comment service methods
- [x] AI Writer: /reports/narrative SSE, /requests/{id}/ai-summary, /ai/suggest-comment endpoints
- [x] AI Writer: ReportsView narrative panel + ApprovalDetailView summary & suggest buttons
- [x] Strategist weekly Celery beat task (90-day window, week-over-week)
- [x] NotificationDropdown component + DefaultLayout integration (30s polling)
- [x] i18n: Writer + notification keys (en-US + pt-BR)
- [x] Backend tests: 215/215 passing (pytest + ruff clean)
- [x] Frontend tests: 235/235 passing (vitest)
- [x] Build: vite production build clean

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
- `GET /api/v1/requests/options/categories|cost-centers`
- `POST|GET /api/v1/payments`
- `GET /api/v1/ai/assist|chat` (SSE), `POST /ai/suggest-comment`
- `GET /api/v1/reports/summary|export`, `GET /reports/narrative` (SSE)
- `POST /api/v1/requests/{id}/ai-summary`
- `CRUD /api/v1/admin/users|categories|sla|integrations`
- `GET /health`
