# HumanOS V5 — Security Audit

**Date:** 2026-06-06  
**Repository:** https://github.com/songset509/Human-OS

---

## Executive Summary

HumanOS uses Supabase Auth + RLS for user isolation. No service role key in client code. Demo mode is hard-blocked in production. This audit documents strengths, findings, and fixes.

**Security posture:** Suitable for beta/production with real users **when** Supabase RLS is applied and Vercel env vars are configured.

---

## Authentication & Session

| Control | Status |
|---------|--------|
| Supabase SSR cookies | ✅ |
| HTTP-only session cookies | ✅ |
| Password reset via server `/auth/confirm` | ✅ |
| Demo auth blocked in production | ✅ |
| Session refresh in proxy | ✅ |

**Finding:** API routes are not protected by proxy — each handler must call `requireSession()` or `getSessionUser()`. **Status:** Audited; user-data routes enforce auth.

---

## Authorization

| Route class | Protection |
|-------------|------------|
| `(app)` pages | proxy + server `getCurrentUser()` redirects |
| `/api/*` (user data) | Session required |
| `/api/health` | Public (config only, no secrets) |
| `/api/assessments/metadata` | Public (catalog metadata) |
| `/api/demo/auth` | Demo mode + development only |

**Fix applied:** `GET /api/mentors` now requires session.

---

## Row Level Security

**Requirement:** All user tables must have RLS with `auth.uid() = user_id`.

**SQL files:** `schema.sql`, `schema-upgrades.sql`, `schema-v5.sql`, `schema-assessment-v2.sql`

**Operator checklist:**
- [ ] RLS enabled on all user tables
- [ ] Policies use `auth.uid()`
- [ ] Re-run idempotent migrations if policies failed
- [ ] Test: User A cannot read User B rows

---

## Secrets Exposure

| Secret | Exposure | Status |
|--------|----------|--------|
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser (expected) | ✅ |
| `OPENAI_API_KEY` | Server only | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Not in `src/` | ✅ |
| Demo passwords | In-memory dev only | ✅ Low risk |

---

## Data Protection

| Feature | Implementation |
|---------|----------------|
| User data export | `GET /api/governance?export=1` |
| Consent management | `user_consent` table + governance API |
| Privacy center UI | `/settings/privacy` |
| Community posts | `is_anonymous: true` default |

**Gap:** Self-service account deletion not implemented — documented in privacy UI.

---

## API Validation

| Route | Validation |
|-------|------------|
| vault, life-os, relationships | Zod schemas |
| Others | Manual checks |

**Recommendation:** Extend Zod to assessments, mood, coach POST bodies.

---

## Rate Limiting

| Endpoint | Limit |
|----------|-------|
| Coach | 30/min per user |
| Mentors | 20/min per IP |
| Demo auth | 10/min |

**Limitation:** In-memory — not shared across Vercel instances. **Recommendation:** Redis/KV for scale.

---

## Issues Found & Fixes

| # | Severity | Issue | Fix |
|---|----------|-------|-----|
| 1 | High | Fake research data misleading users | Personal stats only |
| 2 | Medium | Mentors GET public | requireSession |
| 3 | Medium | Mentors POST unhandled errors | try/catch |
| 4 | Medium | Unsigned demo cookie | Dev only + production guard |
| 5 | Low | Profile updates via client Supabase | Relies on RLS — verify policies |
| 6 | Low | Health endpoint exposes config state | Acceptable for ops |

---

## Remaining Risks

1. RLS not verified in operator's Supabase project
2. Email confirmation settings may block signup flow
3. No WAF/DDoS beyond Vercel defaults
4. No audit log for admin actions
5. Consent not enforced before OpenAI calls (stored but not checked)

**Recommendation:** Add `ai_processing` consent check in coach/mentors before OpenAI call.

---

## Compliance Notes

HumanOS is a personal development tool, not a medical device. Crisis disclaimers exist in coach system prompt. Privacy policy at `/privacy`. GDPR export available via governance API.
