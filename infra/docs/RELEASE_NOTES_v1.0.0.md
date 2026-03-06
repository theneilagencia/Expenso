## Expenso v1.0.0 — Production Ready

Smart Expense Management Platform — first production release.

### Highlights

- **9 Sprints completed** — full-stack expense management with AI-powered analysis
- **5 AI Roles** — Assistant, Analyst, Writer, Strategist, Chatbot (Claude claude-sonnet-4-20250514)
- **Complete Workflow** — DRAFT → AI Analysis → Manager → Finance → Payment → PAID
- **Revolut Integration** — real payment gateway with webhook + polling fallback
- **BTS Design System** — unified component library (50+ components)
- **i18n** — English (en-US) + Português (pt-BR)
- **LGPD Compliance** — data export, account anonymization, retention cleanup

### Architecture

| Layer | Stack |
|-------|-------|
| Frontend | Vue 3 + Vite + Pinia + BTS Design System v1.3.0 |
| Backend | Python 3.11 + FastAPI + SQLAlchemy 2.x + Alembic |
| Database | PostgreSQL 15 + pgvector + Redis |
| Workers | Celery + Redis (async tasks + beat scheduler) |
| AI | Anthropic Claude claude-sonnet-4-20250514 (5 roles) |
| Storage | MinIO (S3-compatible) |
| Deploy | Render (5 services) + GitHub Actions CD |

### Test Coverage

- **Backend**: 382 tests passing (pytest + ruff clean)
- **Frontend**: 400 tests passing (vitest)
- **Total**: 782 tests

### Security

- JWT HS256 (access 30min, refresh 7d) + bcrypt
- MFA/2FA with TOTP (pyotp + QR enrollment)
- Rate limiting (slowapi + Redis)
- Security headers (HSTS, CSP, X-Frame-Options)
- Upload validation (magic bytes + extension blocklist)
- Fernet AES-128 encryption for credentials
- Admin impersonation (read-only, fully audited)

### Sprint 9 Features (this release)

- MFA/2FA with TOTP enrollment + login verification
- Approval policies by value range + multi-step chains
- Holiday calendar + business hours SLA calculation
- Manager substitute + SLA auto-escalation
- Department hierarchy tree (recursive)
- Vendor whitelist/blacklist + AI Analyst integration
- Bulk user import (XLSX) + ERP export with accounting codes
- SSO user sync (Google/Azure directory)
- Custom outbound webhooks (HMAC-SHA256 signed)
- User impersonation (admin, read-only, audited)

### Infrastructure

- `render.yaml` — 5 services (backend, worker, beat, frontend, db+redis)
- `infra/production.env.example` — all env vars documented
- `infra/scripts/deploy.sh` — idempotent deploy (migrations + seed)
- `.github/workflows/cd-render.yml` — deploy on `v*` tags
- `infra/docs/custom-domain.md` — domain setup guide

### Database

18 tables with UUID v4 PKs, UTC timestamps, soft delete.
5 Alembic migrations (001→005).

### Post-Deploy Manual Steps

1. Configure env vars on Render (see `infra/production.env.example`)
2. Set up custom domains (see `infra/docs/custom-domain.md`)
3. Register Revolut webhook URL
4. Change admin password (default: `admin@expenso.io`)
5. Import users via XLSX or SSO sync
