# HumanOS V5 — Authentication & Authorization Audit

**Date:** 2026-05-31  
**Scope:** Login, signup, session, middleware, API routes, demo mode, production (Vercel)

## Executive Summary

Production failures were caused by **demo mode activating on Vercel** when Supabase env vars were missing or invalid, which triggered **filesystem writes** to `.data/demo-store.json` on a read-only serverless filesystem (`ENOENT: mkdir '/var/task/.data'`). Separately, **client/server mode mismatch** and missing sessions produced widespread **401 Unauthorized** responses on API routes while the UI showed "Access Denied."

Fixes enforce: **production = Supabase only**, **demo = local dev only**, **no filesystem persistence on Vercel**, aligned middleware and session detection.

---

## Issues Found

| # | Severity | Issue | Root cause |
|---|----------|-------|------------|
| 1 | **Critical** | Login/signup `ENOENT` on Vercel | `isDemoMode()` true when env missing → `demo/store.ts` calls `fs.mkdirSync` on `.data/` |
| 2 | **Critical** | False "Unauthorized" on protected pages | `getSessionUser()` returns null when Supabase not configured or session cookies not refreshed |
| 3 | **High** | Demo mode in production | `isDemoMode()` = `!isSupabaseConfigured()` with no `VERCEL` / `NODE_ENV` guard |
| 4 | **High** | `/privacy` treated as protected | Listed in `PROTECTED_PATHS` in old middleware |
| 5 | **High** | `GET /api/community` unauthenticated | No `requireSession()` on GET |
| 6 | **Medium** | `?demo=1` on signup forced demo path | URL override bypassed production intent |
| 7 | **Medium** | Weak anon key validation | Short keys / wrong URL format accepted |
| 8 | **Medium** | No production config feedback | Silent misconfiguration on Vercel |
| 9 | **Low** | Duplicate `getUser()` in middleware | Extra round-trip |
| 10 | **Low** | Unsigned demo session cookie | Forgeable in local demo only (not production) |

---

## Architecture (After Fix)

```
┌─────────────────────────────────────────────────────────┐
│ Runtime (src/lib/env/runtime.ts)                        │
│   isProductionRuntime() → VERCEL | NODE_ENV | VERCEL_ENV│
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│ Data provider (src/lib/providers/index.ts)              │
│   Production  → supabase only                             │
│   Local dev   → demo if no Supabase & ALLOW_DEMO          │
└──────────────────────────┬──────────────────────────────┘
                           │
         ┌─────────────────┴─────────────────┐
         ▼                                   ▼
┌─────────────────┐               ┌─────────────────────┐
│ DemoProvider    │               │ SupabaseProvider      │
│ (local only)    │               │ (production + local)  │
│ In-memory store │               │ Supabase Auth + DB    │
│ Optional disk   │               │ RLS policies          │
└─────────────────┘               └─────────────────────┘
```

---

## Route Protection

### Public (no session required)

- `/`
- `/auth/login`, `/auth/signup`, `/auth/forgot-password`, `/auth/callback`
- `/privacy`
- `/api/health`, `/api/demo/auth` (demo auth blocked in production)

### Protected (session required → redirect to `/auth/login`)

All app routes under `(app)/`: dashboard, assessments, mood, coach, Life OS V5 routes, etc.

**Implementation:** `src/lib/supabase/middleware.ts` via `src/proxy.ts`

### Session resolution

| Mode | Source |
|------|--------|
| Demo (local) | `humanos_demo_session` cookie → in-memory demo store |
| Supabase | `@supabase/ssr` cookies → `supabase.auth.getUser()` |

**Server helper:** `getSessionUser()` in `src/lib/auth/session.ts`  
**API helper:** `requireSession()` in `src/lib/api/response.ts`

---

## Auth Flows Verified (Code Paths)

| Flow | Status | Notes |
|------|--------|-------|
| Signup (Supabase) | ✓ | `signUp` + email redirect to `/auth/callback` |
| Login (Supabase) | ✓ | `signInWithPassword` + middleware refresh |
| Logout | ✓ | Profile + `supabase.auth.signOut()` |
| Password reset | ✓ | Forgot-password page → Supabase reset |
| OAuth / email confirm | ✓ | `/auth/callback` exchanges code |
| Demo signup/login | ✓ Local only | Blocked when `VERCEL=1` or production |
| Profile creation | ✓ | Supabase trigger on `auth.users` (see `schema.sql`) |

---

## API Authentication

All V5 API routes use `requireSession()` or `getSessionUser()` with 401 on failure.  
**Fixed:** `GET /api/community` now requires authentication.

**Health check:** `GET /api/health` — reports provider mode and config validation (no secrets).

---

## Client / Server Alignment

| Check | Server (`isDemoMode`) | Client (`isDemoModeClient`) |
|-------|----------------------|----------------------------|
| Production | Always `false` | Always `false` |
| Local + no env | `true` | `true` |
| Local + valid env | `false` | `false` |

Removed `?demo=1` signup override in production builds.

---

## Remaining Risks

1. **Vercel env vars** — Must set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_APP_URL` in Production environment and redeploy.
2. **Email confirmation** — If Supabase requires email confirm, users may not have a session immediately after signup until they confirm.
3. **Rate limiting** — In-memory limits do not span serverless instances.
4. **Demo cookie** — Unsigned; acceptable only for local demo (not used in production).
5. **Service role key** — Not used in app code; never add to `NEXT_PUBLIC_*`.

---

## Deployment Status

| Check | Status |
|-------|--------|
| Demo filesystem on Vercel | **Fixed** |
| Production demo mode | **Disabled** |
| Middleware public `/privacy` | **Fixed** |
| Config error on login | **Added** |
| Provider abstraction | **Added** (`src/lib/providers/`) |
| Build / lint / typecheck | Run `npm run build` locally to confirm |

---

## Files Changed (Auth)

- `src/lib/env/runtime.ts` — production detection
- `src/lib/demo/config.ts` — demo gating
- `src/lib/demo/store.ts` — no disk on Vercel/production
- `src/lib/supabase/env.ts` — validation + `validateAppConfig()`
- `src/lib/supabase/middleware.ts` — public/protected paths, production guard
- `src/lib/providers/*` — IDataProvider mode
- `src/lib/auth/session.ts` — dev error logging
- `src/app/api/health/route.ts` — config health
- `src/app/api/demo/auth/route.ts` — production block
- `src/app/api/community/route.ts` — GET auth
- `src/app/auth/login/page.tsx` — config error banner
- `src/app/auth/signup/page.tsx` — remove demo URL override
- `src/app/auth/callback/route.ts` — config guard
