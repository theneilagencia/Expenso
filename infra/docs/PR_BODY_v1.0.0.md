## Summary

Consolidação completa dos Sprints 2–9 + infraestrutura de go-live para produção.

### Sprints Incluídos

| Sprint | Escopo |
|--------|--------|
| 2 | JWT refresh tokens, password reset, SSO/OAuth, RBAC role guards |
| 3 | AI Analyst writeback, SLA service, currency conversion, email notifications |
| 4 | Dashboard Chart.js, AI Strategist, payment gateway, Redis cache |
| 5 | AI Analyst policy engine, pgvector duplicates, SSE streaming, admin views |
| 6 | AI Writer (narrative, summary, suggest-comment), notification dropdown |
| 7 | Revolut Business API, batch payments, XLSX export, payment KPIs |
| 8 | Rate limiting, security headers, upload validation, LGPD, N+1 fix, indexes |
| 9 | BTS Design System, MFA/2FA, approval policies, holiday SLA, hierarchy, vendors, webhooks, impersonation, user import, ERP export, SSO sync |

### Go-Live Infrastructure

- `render.yaml` — 5 services (backend, worker, beat, frontend, db+redis)
- `infra/production.env.example` — all production env vars documented
- `infra/scripts/deploy.sh` — idempotent deploy (migrations + seed)
- `.github/workflows/cd-render.yml` — deploy on `v*` tags only
- `infra/docs/custom-domain.md` — domain setup guide (app.expenso.io + api.expenso.io)
- `infra/docs/RELEASE_NOTES_v1.0.0.md` — release notes

### Security Fixes

- `/docs` and `/redoc` disabled in production (`DEBUG=false`)
- Security headers: HSTS, CSP, X-Frame-Options, X-Content-Type-Options
- Upload validation: magic byte inspection + extension blocklist
- Fernet AES-128 encryption for integration credentials
- Rate limiting on all critical endpoints (login, refresh, AI, requests)

### Numbers

- **Backend**: 382 tests passing (pytest + ruff clean)
- **Frontend**: 400 tests passing (vitest, 39 test files)
- **Total**: 782 tests
- **Database**: 18 tables, 5 Alembic migrations
- **333 files changed**, +37,006 / -1,114 lines

## Test plan

- [x] Backend: 382/382 pytest passing
- [x] Frontend: 400/400 vitest passing (39 files)
- [x] Backend lint (ruff check): zero errors
- [x] Frontend build (vite build): clean (2.17s)
- [x] Tag `v1.0.0` created and pushed
- [x] All 18 tables with proper migrations
- [x] Security checklist passed (docs disabled in prod, headers, rate limiting)
- [x] Idempotent deploy script verified

🤖 Generated with [Claude Code](https://claude.com/claude-code)
