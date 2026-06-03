# HumanOS V5 — Password Reset Audit (PKCE Fix)

**Date:** 2026-05-31  
**Repository:** https://github.com/songset509/Human-OS

## Symptom

After deploying `/auth/reset-password`, users saw:

```
PKCE code verifier not found in storage
```

Recovery email link loaded the page but password update failed.

---

## Root Cause

Password recovery used **client-side** `exchangeCodeForSession(code)` on `/auth/reset-password`.

With `@supabase/ssr` + PKCE:

1. `resetPasswordForEmail()` on the forgot-password page stores the **PKCE code verifier in browser storage** (localStorage).
2. The user opens the email link in the same or a **different** browser context (mobile mail app, new tab, etc.).
3. The verifier is **missing** when the reset page calls `exchangeCodeForSession(code)`.
4. Supabase returns: `PKCE code verifier not found in storage`.

PKCE recovery codes cannot be exchanged reliably on a client page after an email redirect. The session must be established **server-side** with cookies, or via **`verifyOtp({ token_hash, type: 'recovery' })`** which does not require the PKCE verifier.

---

## Fix Applied

### 1. Server confirmation route — `src/app/auth/confirm/route.ts`

- Handles recovery **before** the reset password UI.
- Uses `createRouteHandlerClient()` to write session cookies on the redirect response.
- **`token_hash` + `type=recovery`** → `verifyOtp()` (recommended; no PKCE verifier).
- **`code`** → `exchangeCodeForSession()` on the **server** (cookies, not localStorage).
- On failure → redirect to `/auth/reset-password?error=expired|invalid`.

### 2. Route handler Supabase client — `src/lib/supabase/route-handler.ts`

- Cookie `getAll` / `setAll` bound to `NextRequest` + `NextResponse`.
- Ensures recovery session survives SSR and is available to the client via HTTP-only cookies.

### 3. Recovery helpers — `src/lib/auth/recovery.ts`

- `getPasswordRecoveryConfirmUrl()` → `${NEXT_PUBLIC_APP_URL}/auth/confirm?next=/auth/reset-password`
- `buildConfirmRecoveryUrl()` for legacy links landing on reset-password with query params.
- User-facing messages for expired / invalid links.

### 4. Forgot password — `src/app/auth/forgot-password/page.tsx`

```ts
redirectTo: getPasswordRecoveryConfirmUrl()
```

Uses `NEXT_PUBLIC_APP_URL` when set (required on Vercel production).

### 5. Reset password page — `src/app/auth/reset-password/page.tsx`

- **Does not** call `exchangeCodeForSession` on the client.
- If URL has `code` or `token_hash` → redirects to `/auth/confirm?...`.
- After confirm, checks session via `getUser()` and shows password form.
- Supports legacy hash links (`#access_token=...`) via `setSession`.
- Maps `?error=expired|invalid` to clear copy.

### 6. Middleware

- `/auth/confirm` added to public paths.

---

## Flow (After Fix)

```
Forgot password
  → resetPasswordForEmail(redirectTo: /auth/confirm?next=/auth/reset-password)
  → Email link (code and/or token_hash)
  → GET /auth/confirm (server: verifyOtp or exchangeCode → Set cookies)
  → Redirect /auth/reset-password (session in cookies)
  → User sets password → updateUser({ password })
  → Sign out → /auth/login?message=password_updated
```

---

## Supabase Dashboard Configuration

**Authentication → URL Configuration → Redirect URLs** (add all):

- `https://<your-domain>/auth/confirm`
- `https://<your-domain>/auth/reset-password`
- `https://<your-domain>/auth/callback`

**Optional (recommended) — Email template “Reset password”:**

Point users at token_hash flow (avoids PKCE entirely):

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/auth/reset-password">
  Reset password
</a>
```

**Environment:**

```env
NEXT_PUBLIC_APP_URL=https://your-production-domain.vercel.app
```

Must match the domain users open from email.

---

## Files Changed

| File | Change |
|------|--------|
| `src/app/auth/confirm/route.ts` | **Created** — server recovery exchange |
| `src/lib/supabase/route-handler.ts` | **Created** — cookie-aware route client |
| `src/lib/auth/recovery.ts` | **Created** — URLs and error copy |
| `src/app/auth/forgot-password/page.tsx` | `redirectTo` → `/auth/confirm` |
| `src/app/auth/reset-password/page.tsx` | No client PKCE; redirect + session check |
| `src/lib/supabase/middleware.ts` | Public `/auth/confirm` |

---

## Verification Steps

| Step | Expected |
|------|----------|
| Set `NEXT_PUBLIC_APP_URL` on Vercel | Matches live domain |
| Add redirect URLs in Supabase | Includes `/auth/confirm` |
| Forgot password | Email received |
| Click recovery link | Brief redirect via `/auth/confirm` |
| Reset page | Password form (no PKCE error) |
| Submit new password | Success → login |
| Login | New password works |
| Expired link | “Reset link expired. Request a new one.” |
| Invalid link | “Invalid reset link.” |

---

## Remaining Risks

| Risk | Mitigation |
|------|------------|
| `NEXT_PUBLIC_APP_URL` wrong or unset | Email links hit wrong host; set in Vercel Production |
| Supabase redirect URL not allowlisted | Add `/auth/confirm` in dashboard |
| Old emails pointing only to reset-password with `code` | Page auto-redirects to `/auth/confirm` |
| Server `exchangeCodeForSession` still fails for some PKCE codes | Prefer `token_hash` email template |

---

## Deployment Status

| Item | Status |
|------|--------|
| PKCE client exchange removed | ✅ |
| Server confirm route | ✅ |
| Cookie-based session | ✅ |
| Build verification | Run `npm run build` before deploy |
