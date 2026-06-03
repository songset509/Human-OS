# HumanOS V5 — Supabase Checklist

Use this when setting up a new project or fixing production auth/data issues.

## 1. Supabase project setup

- [ ] Create project at [supabase.com](https://supabase.com)
- [ ] Note **Project URL** (`https://<ref>.supabase.co`)
- [ ] Note **anon / publishable** key from **Settings → API**
- [ ] Do **not** put `service_role` in `NEXT_PUBLIC_*` or client code

## 2. SQL migrations (run in order)

In **SQL Editor**, run each file once (re-runs are safe for upgrade files):

| Order | File | Purpose |
|-------|------|---------|
| 1 | `supabase/schema.sql` | Core tables, RLS, profile trigger |
| 2 | `supabase/seed.sql` | Assessments, challenges catalog |
| 3 | `supabase/schema-upgrades.sql` | Blueprint, HPI, timeline, community |
| 4 | `supabase/schema-v5.sql` | Life OS, vault, mission, burnout, etc. |
| 5 | `supabase/schema-assessment-v2.sql` | Assessment V2 sessions |

See `supabase/MIGRATIONS.md` for details.

## 3. Authentication URLs

**Authentication → URL Configuration**

| Setting | Local | Production |
|---------|-------|------------|
| Site URL | `http://localhost:3000` | `https://your-app.vercel.app` |
| Redirect URLs | `http://localhost:3000/auth/callback` | `https://your-app.vercel.app/auth/callback` |

## 4. Environment variables

### Local (`.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
NEXT_PUBLIC_APP_URL=http://localhost:3000
OPENAI_API_KEY=sk-...
```

### Vercel (Production)

Same keys; `NEXT_PUBLIC_APP_URL` = production domain.

**Validate:** `curl https://your-app.vercel.app/api/health`  
Expect: `"status":"ok"`, `"provider":"supabase"`, empty `errors`.

## 5. Tables to verify

| Table | Purpose |
|-------|---------|
| `profiles` | User profile (extends `auth.users`) |
| `assessments` | Catalog |
| `assessment_results` | User scores |
| `mood_logs` | Daily mood |
| `challenges` / `challenge_progress` | Growth challenges |
| `ai_conversations` | Coach history |
| `insights` | Generated insights |
| `human_blueprints` | Blueprint V2+ |
| `hpi_snapshots` | Human Potential Index |
| `ai_memory` | Long-term AI memory |
| Life OS V5 tables | From `schema-v5.sql` |

## 6. RLS

- [ ] Row Level Security enabled on user tables
- [ ] Policies use `auth.uid() = user_id` (or equivalent)
- [ ] Re-run upgrade SQL if policies failed on first deploy (`DROP POLICY IF EXISTS` patterns included)

## 7. Auth flows (manual test)

| Step | Expected |
|------|----------|
| Sign up | User in `auth.users`; row in `profiles` |
| Email confirm (if enabled) | Link opens `/auth/callback` → dashboard |
| Login | Session cookie set; `/dashboard` loads |
| Logout | Session cleared; redirect to login |
| Forgot password | Reset email received |
| Refresh page | Still logged in |
| Save assessment | Row in `assessment_results` |
| Mood log | Row in `mood_logs` |
| AI coach message | Row in `ai_conversations` / memory |

## 8. Common failures

| Symptom | Fix |
|---------|-----|
| `ENOENT .data` on Vercel | Set Supabase env vars; redeploy (demo disabled in prod) |
| `missing_supabase_config` on login | Add env vars to **Production** environment |
| `Invalid API key` | Use anon key, not service role; check URL has no `/rest/v1` |
| Redirect loop | Fix Site URL / callback URL in Supabase |
| 401 on all APIs | Session not set — check callback URL and cookie domain |
| Profile missing | Re-run `schema.sql` trigger for `profiles` insert |

## 9. OpenAI (optional)

- `OPENAI_API_KEY` for full Coach / mentor responses
- Without it, app uses template fallbacks (no Supabase impact)

## 10. Post-deploy smoke test

1. Open production URL
2. Sign up / log in
3. Dashboard loads with scores (may be empty for new user)
4. Complete one assessment → appears in Results
5. Log mood → appears on Mood page
6. Send Coach message → no 500 error
7. Visit Life OS, Vault, Mission — no Unauthorized

---

**Status after V5 production fix:** Demo storage removed from production path; Supabase required on Vercel. Complete checklist above before declaring production ready.
