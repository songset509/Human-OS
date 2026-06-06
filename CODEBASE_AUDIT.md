# HumanOS V5 — Codebase Audit

**Repository:** https://github.com/songset509/Human-OS  
**Date:** 2026-06-06  
**Scope:** Full repository architecture, data flows, risks

---

## Architecture Map

```
┌─────────────────────────────────────────────────────────────────┐
│                        Next.js 16 App Router                     │
├─────────────────────────────────────────────────────────────────┤
│  Marketing (/)  │  Auth (/auth/*)  │  App ((app)/*)  │  API     │
└────────┬────────┴────────┬─────────┴────────┬────────┴────┬────┘
         │                 │                  │             │
         ▼                 ▼                  ▼             ▼
    Static/SSR      proxy.ts →        Server + Client   Route Handlers
                    updateSession()     Components        requireSession()
         │                 │                  │             │
         └─────────────────┴──────────────────┴─────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
            getDataProviderMode()            Rule Engines
            supabase | demo (dev only)         flourishing, HPI, twin…
                    │                               │
         ┌──────────┴──────────┐                    │
         ▼                     ▼                    ▼
   Supabase (prod)      Demo in-memory         OpenAI (coach, mentors)
   PostgreSQL + RLS      stores (dev)           gpt-4o-mini
```

**Entry points:**
- `src/proxy.ts` — session refresh, UI route protection
- `src/lib/auth/session.ts` — `getSessionUser()`
- `src/lib/providers/index.ts` — provider mode selection
- `src/lib/data/*` — data orchestration layer

---

## Data Flow Map

| Layer | Path | Role |
|-------|------|------|
| UI | `src/app/(app)/**` | Pages, client fetch to APIs |
| API | `src/app/api/**` | Auth, validation, persistence |
| Data | `src/lib/data/` | Supabase vs demo branching |
| Services | `src/lib/services/supabase-upgrade.ts` | Upgrade-table CRUD |
| Engines | `src/lib/engines/` | Scoring, AI context, reports |
| DB | `supabase/*.sql` | Schema, RLS, triggers |

**Production path:** UI → API → `getSessionUser()` → Supabase `createClient()` → RLS-enforced tables.

**Development path (no Supabase):** UI → API → `isDemoMode()` → in-memory demo stores (guarded by `NODE_ENV=development`).

---

## Authentication Flow

```
Signup/Login (client)
  → supabase.auth.signUp / signInWithPassword
  → Cookies via @supabase/ssr
  → proxy.ts refreshes session (getUser)
  → Protected pages: getSessionUser() on server

Password reset
  → resetPasswordForEmail → /auth/confirm (server)
  → verifyOtp / exchangeCodeForSession → cookies
  → /auth/reset-password → updateUser({ password })

Logout
  → supabase.auth.signOut()
```

**Public routes:** `/`, `/auth/*`, `/privacy`  
**Protected:** All `(app)` routes including `/getting-started`, `/settings/*`

---

## AI Flow

```
User message (Coach/Mentors UI)
  → POST /api/coach | /api/mentors
  → requireSession / getSessionUser
  → getUpgradeContext() + getAIMemoryContext() [memory-engine trends]
  → OpenAI chat.completions (gpt-4o-mini) OR fallback template
  → storeAIMemory() → ai_memory table
  → Persist conversation (coach) → ai_conversations
  → JSON response to client
```

**Non-LLM "AI" features:** Insights (rule engine), Architect (templates), Twin (rules), Intelligence pipeline (lexicon/heuristics).

---

## Database Flow

| Table | Written by | Read by |
|-------|-----------|---------|
| `profiles` | Auth trigger | user-data, profile |
| `assessment_results` | assessments API | dashboard, engines |
| `mood_logs` | mood API | flourishing engine |
| `hpi_snapshots` | recordHPIIfNeeded | blueprint, research |
| `ai_conversations` | coach API | coach page |
| `ai_memory` | coach, mentors | memory context |
| `vault_entries` | vault API | vault, intelligence |
| V5 tables | v5-data | Life OS modules |

---

## Fixes Applied (This Audit)

| Issue | Fix |
|-------|-----|
| Fake research stats in production | `computePersonalResearchStats()` — user data only |
| Empty HPI trends in production | `getHPITrend()` in hpi/blueprint APIs |
| Future self history empty in prod | `sbGetFutureSelfScenarios()` |
| Mentors OpenAI no error handling | try/catch + timeout |
| Mentors GET unauthenticated | `requireSession()` |
| Demo banner on production builds | `isProductionRuntime()` guard |
| AI memory without trends | `memory-engine.ts` |
| No privacy center | `/settings/privacy` |
| No onboarding | `/getting-started` |

---

## Technical Debt

| Item | Priority | Notes |
|------|----------|-------|
| In-memory rate limits | Medium | Ineffective on serverless multi-instance |
| API routes excluded from proxy | Medium | Each route must self-guard |
| Self-service account deletion | Medium | Documented; not implemented |
| Cross-user research aggregates | Low | Requires privacy-reviewed analytics pipeline |
| Architect/Future Self not LLM | Low | UI says "AI" but rule-based |
| pgvector / Python AI layer | Future | See ARCHITECTURE_ROADMAP.md |
| Tutorial Academy (Phase 12) | Future | Getting Started is MVP |
| Human Networks (Phase 17) | Future | After core stability |

---

## Risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Missing Vercel env vars | High | `/api/health`, login banners |
| RLS misconfiguration | High | SECURITY_AUDIT.md checklist |
| OpenAI outage | Medium | Fallback responses |
| Demo cookie forgery | Low | Dev only, guarded |

---

## File Inventory

- **Routes:** 68+ app routes, 29 API routes
- **Demo:** `src/lib/demo/*` (6 files, in-memory only)
- **Providers:** `src/lib/providers/*`
- **Data:** `src/lib/data/*` (4 files)
- **Engines:** 15+ under `src/lib/engines/`

See `FINAL_PLATFORM_AUDIT.md` for production readiness score.
