# HumanOS V5 — DemoProvider Audit

**Repository:** https://github.com/songset509/Human-OS  
**Date:** 2026-05-31

## Executive Summary

Demo storage previously used **filesystem persistence** (`.data/demo-store.json`) which caused `ENOENT: mkdir '/var/task/.data'` on Vercel. Demo mode could also activate in production when Supabase env vars were missing.

**Resolution:** All `fs` usage removed. DemoProvider is **in-memory only** and **hard-gated** to `NODE_ENV === "development"`. Production always uses SupabaseProvider.

---

## Repository Search Results

| Pattern | Locations (after fix) |
|---------|----------------------|
| `.data` | `.gitignore` only (docs references updated) |
| `demo-store` | Removed from runtime code |
| `fs` / `mkdir` / `writeFile` | **Removed** from `src/lib/demo/store.ts` |
| `DemoProvider` | `src/lib/providers/index.ts` |
| `isDemoMode` | `src/lib/demo/config.ts` + data/API branches |

---

## Files Modified

| File | Change |
|------|--------|
| `src/lib/demo/store.ts` | In-memory only; no filesystem; `assertDemoProviderAllowed` on mutations |
| `src/lib/demo/guard.ts` | **New** — throws `DemoProviderProductionError` outside development |
| `src/lib/demo/v5-store.ts` | Guard on store access |
| `src/lib/demo/assessment-v2-store.ts` | Guard on store access |
| `src/lib/demo/config.ts` | `NODE_ENV=development` only; `assertNotDemoInProduction()` |
| `src/lib/env/runtime.ts` | `allowDemoProvider()` requires `NODE_ENV === "development"` |
| `src/lib/providers/index.ts` | `assertSupabaseProviderOnly()` |
| `src/lib/auth/session.ts` | Provider assertion before session resolution |
| `src/app/api/demo/auth/route.ts` | Guard on POST/DELETE |

---

## Runtime Rules

```
Production (Vercel, NODE_ENV=production)
  → getDataProviderMode() = "supabase"
  → isDemoMode() = false
  → demo/store throws if called

Local development (NODE_ENV=development)
  → Supabase configured → supabase
  → No Supabase → demo (in-memory only)
```

### Protection layers

1. `isDemoMode()` returns false unless `NODE_ENV === "development"`
2. `assertDemoProviderAllowed()` throws in any non-development environment
3. `assertSupabaseProviderOnly()` in `getSessionUser()`
4. `/api/demo/auth` returns 403 outside demo mode

---

## Production Paths Verified

| Flow | Provider |
|------|----------|
| Signup | Supabase Auth |
| Login | Supabase Auth |
| Profile | `profiles` table |
| Assessments | `assessment_results` |
| Dashboard | Supabase data layer |
| AI Coach | Supabase + OpenAI |

No API route performs filesystem I/O in production.

---

## Remaining Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Missing Vercel env vars | High | `/api/health`, login banner |
| Accidental demo import in new code | Low | Use `isDemoMode()` + guards |
| In-memory demo data lost on restart | N/A (dev only) | Documented in demo banner |

---

## Deployment Status

| Item | Status |
|------|--------|
| Filesystem removed from demo store | ✅ |
| Production throws on demo access | ✅ |
| Vercel-safe | ✅ |
