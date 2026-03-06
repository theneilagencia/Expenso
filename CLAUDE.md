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
- BTS Design System v1.3.0 (29 Bts* components, CSS custom properties, Font Awesome icons)
- Token bridge: `_bts-bridge.scss` maps BTS tokens → Expenso SCSS variables
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
- pyotp + qrcode (TOTP MFA)
- openpyxl (XLSX import/export)

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

## Sprint 7 — COMPLETED (2026-03-05)

Branch: `feat/sprint-2-auth-rbac` (continuation)

- [x] Revolut Business API client (JWT RS256, httpx, 30s timeout)
- [x] Revolut webhook HMAC-SHA256 signature validation
- [x] RevolutGateway: complete stub → real HTTP calls (MockGateway fallback preserved)
- [x] Revolut status mapping (pending/completed/failed/declined/reverted/cancelled)
- [x] Payment status poll Celery beat task (10 min, webhook fallback)
- [x] Config: REVOLUT_CLIENT_ID, REVOLUT_PRIVATE_KEY, REVOLUT_WEBHOOK_SECRET
- [x] Batch payment endpoint (POST /payments/batch) — PIX/PAYROLL instant, REVOLUT async
- [x] Enhanced payment list: filters (status, method, date_from, date_to, employee_id)
- [x] Enriched payment responses (request_title, requester_name, department, category)
- [x] Webhook HMAC validation for Revolut provider
- [x] Webhook state transitions (completed→PAID, failed→FAILED+retry)
- [x] XLSX payment export (openpyxl, StreamingResponse)
- [x] PaymentsView: KPI cards (pending/processing/paid/failed)
- [x] PaymentsView: retry button for FAILED payments
- [x] PaymentsView: method selector in batch bar (REVOLUT/PIX/PAYROLL)
- [x] PaymentsView: XLSX export button
- [x] PaymentsView: dynamic currency formatting (per-payment currency)
- [x] payments.js: retry, batchProcess, getStatus, exportXlsx methods
- [x] i18n payments: complete keys (kpi, table, detail, messages — en-US + pt-BR)
- [x] Backend tests: 240/240 passing (pytest + ruff clean)
- [x] Frontend tests: 243/243 passing (vitest)
- [x] Build: vite production build clean

---

## Sprint 8 — COMPLETED (2026-03-06)

Branch: `feat/sprint-2-auth-rbac` (continuation)

### Security
- [x] Rate limiting with slowapi (Redis-backed): login 5/min, refresh 10/min, password reset 3/min, requests 20/min, AI 20-30/min
- [x] SecurityHeadersMiddleware: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy
- [x] HSTS + CSP headers in production (DEBUG=False)
- [x] Production error handler — suppresses stack traces
- [x] Upload validation: magic byte content inspection (python-magic), executable extension blocklist, filename sanitization, 10 files/request limit
- [x] Fernet encryption for integration credentials (ENCRYPTION_KEY config)
- [x] GET /integrations/{id} with decrypted config (ADMIN only)

### Performance
- [x] Fix N+1 in payments list: single JOIN query (Payment+Request+User+Category+Department)
- [x] 5 partial indexes (Alembic migration 004): manager_pending, finance_pending, audit_logs, notifications_unread, employee_requests
- [x] Redis cache for categories list (1h TTL + invalidation on admin CRUD)
- [x] Notifications endpoint: pagination metadata (total, page, per_page)

### LGPD Compliance
- [x] GET /users/me/data-export: async Celery task → ZIP (profile, requests, logs, payments, notifications)
- [x] DELETE /users/me: account anonymization (email, name, password cleared, requests cancelled). Only EMPLOYEE can self-delete.
- [x] data_retention_cleanup: monthly Celery beat task (hard-deletes records > 5 years, never audit_logs)
- [x] DeleteAccountRequest schema with password verification

### Monitoring
- [x] Enriched /health: DB, Redis, MinIO, Celery checks → healthy/degraded/unhealthy
- [x] GET /api/v1/admin/system-status (ADMIN): CPU%, memory%, Celery queues, Redis memory, DB pool

### Tests & Documentation
- [x] 65 new backend tests (305 total): security headers, encryption, upload validation, LGPD, health, N+1 fix
- [x] 103 new frontend tests (346 total): stores (notifications, ui, requests), services (payments, notifications, reports), utils (currency, date, validators)
- [x] CLAUDE.md: architecture section, Sprint 8 summary, updated endpoints
- [x] Dependencies: slowapi, openpyxl, python-magic, psutil

### Final Counts
- Backend tests: 305/305 passing (pytest + ruff clean)
- Frontend tests: 346/346 passing (vitest)
- Total: 651 tests

---

## Sprint 9 — COMPLETED (2026-03-06)

Branch: `feat/sprint-2-auth-rbac` (continuation)

### BTS Design System Integration
- [x] BTS Design System v1.3.0 installed (29 components: Avatar, Badge, Button, Dialog, Spinner, etc.)
- [x] Token bridge (`_bts-bridge.scss`): maps BTS CSS custom properties → Expenso SCSS variables
- [x] 8 App* components migrated to Bts* wrappers (AppBadge→BtsBadge, AppAvatar→BtsAvatar, AppModal→BtsDialog, AppLoader→BtsSpinner, AppConfirmDialog→BtsDialog+BtsButton, AppToast→BtsStatusIcon)
- [x] Custom components restyled with BTS tokens (AppTable, AppPagination, AppEmptyState, etc.)

### MFA/2FA (TOTP)
- [x] TOTP enrollment: generate secret, QR code data URI, 6-digit verification
- [x] Login flow: if `mfa_enabled` → return `mfa_token` (5min JWT) → verify endpoint → full tokens
- [x] MFA setup/confirm/disable endpoints with rate limiting
- [x] Frontend: MFASetupView (4-step enrollment), LoginView MFA challenge modal

### Approval Policies by Value Range
- [x] Admin CRUD for approval policies (name, department, min/max amount, approval flow JSONB)
- [x] Soft delete support (deleted_at convention)
- [x] Frontend: ApprovalPoliciesView with table, modal form, pagination

### Holiday Calendar + Business Hours SLA
- [x] Admin CRUD for corporate calendar (holidays: NATIONAL, STATE, COMPANY types)
- [x] SLA business hours calculation: minute-by-minute advance skipping weekends, holidays, non-business hours
- [x] SLA auto-escalation: ASSIGN_SUBSTITUTE, ESCALATE_DEPARTMENT, AUTO_APPROVE actions
- [x] Frontend: CalendarView with holiday management

### Manager Hierarchy Tree
- [x] Department self-referential FK (`parent_department_id`)
- [x] Recursive department tree API with nested users
- [x] Frontend: HierarchyView with recursive DepartmentNode component, expand/collapse, edit parent modal

### Vendor Whitelist/Blacklist
- [x] Admin CRUD for vendor lists (WHITELIST/BLACKLIST, vendor name, category, reason)
- [x] AI Analyst integration: blacklisted vendors → violation, whitelisted → risk -10
- [x] Frontend: VendorsView with list type filter, badges

### Bulk User Import + ERP Export
- [x] XLSX import service: parse columns (full_name, email, role, department_code, cost_center_code), validate, batch create
- [x] ERP export: GET /reports/erp-export generates XLSX (request_id, date, category, accounting_code, amount, cost_center, department)
- [x] `accounting_code` field on expense categories

### Custom Outbound Webhooks
- [x] WebhookConfig model (url, events JSONB, secret for HMAC-SHA256, is_active)
- [x] Webhook dispatch service with HMAC signing
- [x] Admin CRUD + test endpoint
- [x] Frontend: WebhooksView with event badges, test button

### User Impersonation
- [x] Admin-only impersonation: special JWT with `impersonated_by` + `read_only` claims
- [x] Audit logging for IMPERSONATION_START
- [x] Frontend: ImpersonationBanner component, impersonate button in UsersView

### Alembic Migration 005
- [x] `expense_categories.accounting_code` (String 50, nullable)
- [x] `departments.parent_department_id` (UUID FK self-ref, nullable)
- [x] `approval_policies.deleted_at` (DateTime, nullable)
- [x] `webhook_configs` table (id, url, events JSONB, secret, is_active, created_by, timestamps)

### Tests & Quality
- [x] 77 new backend tests (382 total): MFA, approval policies, SLA, vendors, hierarchy, webhooks, impersonation, user import
- [x] 54 new frontend tests (400 total): MFA service, admin views (5), MFASetupView, ImpersonationBanner
- [x] Dependencies: pyotp, qrcode[pil], openpyxl (already present)

### Final Counts
- Backend tests: 382/382 passing (pytest + ruff clean)
- Frontend tests: 400/400 passing (vitest)
- Total: 782 tests
- Vite build: clean

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

## Database — 18 Tables

users, departments, cost_centers, expense_categories, expense_requests,
request_versions, audit_logs, request_comments, attachments, payments,
sla_configs, approval_policies, integrations, ai_analysis_logs,
vendor_lists, notifications, corporate_calendar, webhook_configs

All use UUID v4 PK, UTC timestamps, soft delete (except audit_logs — immutable).

---

## Key API Endpoints

### Auth & User
- `POST /api/v1/auth/login|refresh|logout` (rate limited: 5-10/min)
- `POST /api/v1/auth/password-reset/request|confirm` (rate limited: 3-5/min)
- `POST /api/v1/auth/mfa/setup|confirm|verify`, `DELETE /api/v1/auth/mfa` (MFA/TOTP)
- `GET|PATCH /api/v1/users/me`
- `GET /api/v1/users/me/data-export` (LGPD data portability)
- `DELETE /api/v1/users/me` (LGPD account anonymization)

### Expense Requests & Payments
- `POST|GET /api/v1/requests` + `/{id}/submit|approve|reject|request-edit|cancel`
- `GET /api/v1/requests/options/categories|cost-centers` (cached 1h)
- `POST|GET /api/v1/payments` + `/batch` + `/export/xlsx`
- `POST /api/v1/payments/webhook/{provider}` (HMAC-SHA256)

### AI
- `GET /api/v1/ai/assist|chat` (SSE, rate limited: 20-30/min)
- `POST /ai/suggest-comment`
- `GET /api/v1/reports/summary|export`, `GET /reports/narrative` (SSE)
- `POST /api/v1/requests/{id}/ai-summary`

### Reports
- `GET /api/v1/reports/erp-export` (XLSX, ADMIN/FINANCE)

### Admin
- `CRUD /api/v1/admin/users|categories|sla|integrations`
- `POST /api/v1/admin/users/import` (XLSX bulk import, ADMIN)
- `POST /api/v1/admin/users/{id}/impersonate` (ADMIN, audited)
- `CRUD /api/v1/admin/approval-policies` (ADMIN)
- `CRUD /api/v1/admin/calendar` (holiday management, ADMIN)
- `CRUD /api/v1/admin/vendors` (whitelist/blacklist, ADMIN)
- `GET /api/v1/admin/hierarchy` + `PATCH departments/{id}` (ADMIN)
- `CRUD /api/v1/admin/webhooks` + `POST /{id}/test` (ADMIN)
- `GET /api/v1/admin/system-status` (ADMIN: CPU, memory, queue)

### Health
- `GET /health` (DB, Redis, MinIO, Celery checks)

---

## Architecture

### Security Layers
- **Rate Limiting**: slowapi + Redis (per-IP for public, per-user for auth)
- **Security Headers**: X-Content-Type-Options, X-Frame-Options, HSTS, CSP
- **Upload Validation**: Magic byte inspection, extension blocklist, filename sanitization
- **Credentials Encryption**: Fernet AES-128 for integration config
- **Auth**: JWT HS256 (access 30min, refresh 7d) + bcrypt passwords
- **MFA/2FA**: TOTP with pyotp (RFC 6238), QR enrollment, 5min MFA token

### Approval Chain
- `ApprovalPolicy` matched by `department_id` + amount range (`min_amount`–`max_amount`)
- `approval_flow` JSONB defines chain: `["MANAGER", "FINANCE"]` or `["FINANCE", "ADMIN"]`
- Manager substitute: `substitute_id` + `substitute_until` on User model
- SLA escalation: auto-actions when overdue (ASSIGN_SUBSTITUTE, ESCALATE_DEPARTMENT, AUTO_APPROVE)

### SLA Business Hours
- `calculate_business_deadline()`: advances minute-by-minute
- Skips: weekends (Sat/Sun), corporate calendar holidays, non-business hours
- Configurable `business_start_hour`/`business_end_hour` per SLAConfig
- Timezone-aware via SLAConfig.timezone field

### Webhook Dispatch
- `WebhookConfig` stores URL, events (JSONB array), HMAC secret
- Events: `request.submitted`, `request.approved`, `payment.completed`, etc.
- HMAC-SHA256 signature in `X-Webhook-Signature` header
- Async dispatch via Celery task with retry

### Impersonation
- Admin generates special JWT: `{"sub": target_id, "impersonated_by": admin_id, "read_only": true}`
- All mutations blocked during impersonation
- Full audit trail: IMPERSONATION_START logged

### Performance
- Payment list: single JOIN query (was N+1 with 4 queries/row)
- 5 partial indexes for common filtered queries
- Redis cache: categories (1h), reports (5-10min)
- Consistent pagination on all list endpoints

### LGPD Compliance
- Data export: ZIP with profile, requests, logs, payments, notifications
- Account anonymization: email/name/password cleared, requests cancelled
- Data retention: monthly Celery task purges records > 5 years
- Audit logs: immutable, never deleted

### External Dependencies & Mocking
- **Anthropic**: mock with `ANTHROPIC_API_KEY=""` → ai_skipped fallback
- **Revolut**: mock with `REVOLUT_API_KEY=""` → MockGateway
- **Redis**: graceful fallback → cache miss returns None
- **MinIO**: required for attachments, optional for data export
- **SMTP**: logged if not configured

### Adding a New Module
1. Create model in `app/models/` with UUID PK + soft delete
2. Create Alembic migration in `app/db/migrations/versions/`
3. Create service in `app/services/` (business logic)
4. Create router in `app/api/v1/routers/` or `app/api/v1/admin/` (thin HTTP layer)
5. Register router in `app/main.py`
6. Add schemas in `app/schemas/`
7. Add tests in `tests/`
8. Add frontend service in `frontend/src/services/`
9. Add view in `frontend/src/views/` + route in `router/index.js`
10. Add i18n keys in `frontend/src/i18n/locales/{en-US,pt-BR}/`
