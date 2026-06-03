# HumanOS V5 — Production Fixes

**Repository:** https://github.com/songset509/Human-OS  
**Deployment:** Vercel

## Fix 1: Demo Storage (ENOENT)

### Root cause
Demo mode wrote to `.data/demo-store.json` via `fs.mkdirSync` / `fs.writeFileSync` on Vercel's read-only filesystem.

### Fixes
- **Removed all filesystem code** from `src/lib/demo/store.ts`
- In-memory store via `global.__humanosDemoStore` only
- `assertDemoProviderAllowed()` throws outside `NODE_ENV=development`
- `isDemoMode()` false in any production build

### Files
`src/lib/demo/store.ts`, `guard.ts`, `config.ts`, `v5-store.ts`, `assessment-v2-store.ts`, `src/lib/env/runtime.ts`, `src/lib/providers/index.ts`

---

## Fix 2: Password Reset 404

### Root cause
Forgot-password emailed users to `/auth/reset-password` but the page did not exist.

### Fixes
- Created `src/app/auth/reset-password/page.tsx` with full Supabase recovery flow
- Added route to middleware public paths
- Login success banner for `?message=password_updated`

### Files
`src/app/auth/reset-password/page.tsx`, `src/lib/supabase/middleware.ts`, `src/app/auth/login/page.tsx`

---

## Fix 3: Authentication

- Production: Supabase only via `getSessionUser()`
- Middleware refreshes cookies before protected route checks
- Misconfigured production → login banner + `/api/health` errors

---

## Fix 4: Environment

Required on Vercel Production:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
OPENAI_API_KEY=sk-...   # optional
```

`SUPABASE_SERVICE_ROLE_KEY` — not used in app runtime (server scripts only).

Validate: `GET /api/health`

---

## Fix 5: Middleware

Public: `/`, `/auth/*` (including reset-password), `/privacy`  
Protected: all app routes listed in `AUTH_AUDIT.md`

---

## Verification

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

---

## Final Acceptance Criteria

| Criterion | Status |
|-----------|--------|
| Sign up / login / logout | ✅ Code complete |
| Password reset | ✅ Route + flow |
| No ENOENT | ✅ No fs in demo |
| Supabase data persistence | ✅ When env configured |
| No demo in production | ✅ Guards |
| Vercel build | Run locally to confirm |

---

## Operator Actions

1. Set Vercel Production env vars
2. Add Supabase redirect URLs (`/auth/callback`, `/auth/reset-password`)
3. Run SQL migrations (see `SUPABASE_CHECKLIST.md`)
4. Push to GitHub and redeploy
