# HumanOS V5 — Production Fixes

**Repository:** [songset509/Human-OS](https://github.com/songset509/Human-OS)  
**Deployment:** Vercel (`human-os-nu.vercel.app`)

## Problem 1: `ENOENT: mkdir '/var/task/.data'`

### Root cause

On Vercel, when `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` were missing or still placeholders, `isSupabaseConfigured()` returned `false`, so the app entered **demo mode**. Demo auth and data mutations called `saveStore()` → `fs.mkdirSync('.data')` on a **read-only** serverless filesystem.

### Fixes applied

1. **`isDemoMode()`** — Returns `false` when `VERCEL=1`, `NODE_ENV=production`, or `NEXT_PUBLIC_VERCEL_ENV=production`.
2. **`canPersistDemoStoreToDisk()`** in `src/lib/demo/store.ts` — Skips all `mkdir` / `writeFile` on Vercel and in production builds; uses in-memory `global.__humanosDemoStore` only.
3. **`/api/demo/auth`** — Returns 403 in production.
4. **`validateAppConfig()`** — Surfaces misconfiguration via `/api/health` and login page banner (`?error=missing_supabase_config`).

### Required operator action

In **Vercel → Project → Settings → Environment Variables (Production)**:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon or sb_publishable_* key>
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
OPENAI_API_KEY=sk-...   # optional but recommended for AI Coach
```

Redeploy after saving. URL must be the project URL, **not** `/rest/v1/`.

---

## Problem 2: "Unauthorized" / "Access Denied"

### Root causes

1. Production ran without valid Supabase → `getSessionUser()` failed → APIs returned 401.
2. Middleware and pages disagreed on demo vs Supabase mode.
3. Some client pages used `useFetch` and displayed API errors as "Unauthorized" even when the user believed they were logged in.

### Fixes applied

1. Production always uses Supabase session path in `getSessionUser()`.
2. Middleware refreshes session via `@supabase/ssr` `getUser()` before protected route checks.
3. Unauthenticated users redirect to `/auth/login?redirect=<path>`.
4. `isDemoModeClient()` aligned with server rules (no demo on production).
5. `GET /api/community` requires session (was public).

### If users still see 401 after deploy

- Confirm env vars on **Production** (not only Preview).
- Supabase **Authentication → URL Configuration**:
  - Site URL: your Vercel URL
  - Redirect URLs: `https://<domain>/auth/callback`
- Confirm email confirmation settings if signup does not auto-login.

---

## Problem 3: Demo mode breaking production

### Before

```ts
isDemoMode() => !isSupabaseConfigured()  // anywhere, including Vercel
```

### After

```ts
isDemoMode() =>
  !isProductionRuntime() &&
  allowDemoProvider() &&
  !isSupabaseConfigured()
```

**Provider layer:** `src/lib/providers/index.ts`  
- `getDataProviderMode()` → `"supabase"` | `"demo"`  
- Production → always `"supabase"`

Local developers can set `HUMANOS_ALLOW_DEMO=false` to force Supabase-only locally.

---

## Problem 4: Middleware

### Changes

- **Public:** `/`, `/auth/*`, `/privacy`
- **Removed** `/privacy` from protected list
- Production without Supabase → redirect protected routes to login with config error
- Demo branch only when `isDemoMode()` (local)

**Entry:** `src/proxy.ts` → `updateSession()`

---

## Problem 5: Environment validation

| Variable | Required (prod) | Notes |
|----------|-----------------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | `https://*.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | JWT (`eyJ…`) or `sb_publishable_*` |
| `NEXT_PUBLIC_APP_URL` | Recommended | Auth redirects |
| `OPENAI_API_KEY` | Optional | Fallbacks without it |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Not used in app; server-only scripts |

**Diagnostics:** `GET /api/health`

---

## Problem 6: API routes

Pattern: `const session = await requireSession(); if (session.error) return session.error;`

No filesystem or demo store calls in production code paths when `isDemoMode()` is false.

---

## Verification Commands

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

---

## Remaining risks

| Risk | Mitigation |
|------|------------|
| Missing Vercel env | Health endpoint + login banner |
| Multi-instance rate limits | Move to Redis/KV later |
| Unsigned demo cookie | Local only; never production |
| Email confirm delay | Document in onboarding |

---

## Deployment checklist

- [ ] Supabase SQL migrations run in order (see `SUPABASE_CHECKLIST.md`)
- [ ] Vercel Production env vars set
- [ ] Supabase redirect URLs updated
- [ ] `npm run build` passes
- [ ] Login → dashboard → assessment save smoke test on production URL
