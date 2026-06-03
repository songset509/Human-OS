# HumanOS V5 — Supabase Checklist

## 1. Project setup

- [ ] Create Supabase project
- [ ] Copy **Project URL**: `https://<ref>.supabase.co` (not REST URL)
- [ ] Copy **anon** or **publishable** key from Settings → API

## 2. SQL migrations (order)

| # | File |
|---|------|
| 1 | `supabase/schema.sql` |
| 2 | `supabase/seed.sql` |
| 3 | `supabase/schema-upgrades.sql` |
| 4 | `supabase/schema-v5.sql` |
| 5 | `supabase/schema-assessment-v2.sql` |

## 3. Authentication URLs

| Setting | Production example |
|---------|-------------------|
| Site URL | `https://human-os-nu.vercel.app` |
| Redirect URLs | `https://<domain>/auth/callback` |
| | `https://<domain>/auth/reset-password` |

## 4. Environment variables

### Vercel Production

```env
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<key>
NEXT_PUBLIC_APP_URL=https://<domain>
OPENAI_API_KEY=sk-...
```

### Optional (never expose to client)

```env
SUPABASE_SERVICE_ROLE_KEY=...  # admin scripts only
```

### Health check

```bash
curl https://<domain>/api/health
```

Expected: `"status":"ok"`, `"provider":"supabase"`, `"errors":[]`

## 5. Tables to verify

| Table | Purpose |
|-------|---------|
| `profiles` | Auto-created on signup (trigger) |
| `assessments` | Catalog |
| `assessment_results` | User scores |
| `mood_logs` | Mood tracker |
| `human_blueprints` | Blueprint |
| `hpi_snapshots` | HPI |
| `ai_memory` | Coach memory |
| `ai_conversations` | Chat history |
| V5 tables | `schema-v5.sql` |

## 6. CRUD smoke tests

| Action | Verify |
|--------|--------|
| Sign up | Row in `auth.users` + `profiles` |
| Login | Session cookie; dashboard loads |
| Save assessment | Row in `assessment_results` |
| Log mood | Row in `mood_logs` |
| Coach message | `ai_conversations` updated |
| Password reset | Email → reset page → login works |
| RLS | User A cannot read User B data |

## 7. Common failures

| Symptom | Fix |
|---------|-----|
| `ENOENT .data` | Redeploy with latest code; set Supabase env vars |
| 404 reset password | Deploy build with `/auth/reset-password` |
| 401 on all APIs | Check env vars on **Production**; verify callback URL |
| Invalid API key | Use anon key; correct project URL |
| Profile missing | Re-run `schema.sql` profile trigger |

## 8. Production readiness

- [ ] Migrations applied
- [ ] Vercel env vars (Production)
- [ ] Supabase redirect URLs
- [ ] `/api/health` returns ok
- [ ] Signup → login → dashboard → assessment save
- [ ] Password reset end-to-end

**Status:** Ready after operator completes checklist and redeploys.
