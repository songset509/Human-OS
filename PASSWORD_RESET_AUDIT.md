# HumanOS V5 — Password Reset Audit

**Date:** 2026-05-31

## Issue

Password reset emails redirected to:

```
/auth/reset-password?code=...
```

**Result:** 404 — route did not exist.

---

## Root Cause

`src/app/auth/forgot-password/page.tsx` correctly called:

```ts
supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${origin}/auth/reset-password`,
});
```

No matching page existed under `src/app/auth/reset-password/`.

---

## Fix Applied

### Created `src/app/auth/reset-password/page.tsx`

**Flow:**

1. User opens link from email (`?code=...` or `?token_hash=...&type=recovery`)
2. Page establishes recovery session:
   - PKCE: `exchangeCodeForSession(code)`
   - OTP: `verifyOtp({ type: "recovery", token_hash })`
   - Fallback: existing session from hash/cookies
3. User enters **New password** + **Confirm password**
4. Validation: min 8 chars, passwords match
5. `supabase.auth.updateUser({ password })`
6. Signs out recovery session
7. Redirects to `/auth/login?message=password_updated`

**UI states:** initializing, form, success, error with link to request new reset.

### Middleware

Added `/auth/reset-password` to **public paths** in `src/lib/supabase/middleware.ts`.

Excluded from “already logged in → dashboard” redirect (only login/signup/forgot-password redirect).

### Login page

Shows success banner when `?message=password_updated`.

---

## Supabase Configuration Required

**Authentication → URL Configuration:**

| Setting | Value |
|---------|--------|
| Site URL | Production domain |
| Redirect URLs | `https://<domain>/auth/reset-password` |
| | `https://<domain>/auth/callback` |

---

## Verification Checklist

| Step | Expected |
|------|----------|
| Forgot password | Email sent |
| Click email link | `/auth/reset-password` loads (not 404) |
| Enter new password | Success message |
| Redirect | `/auth/login` with banner |
| Login with new password | Dashboard loads |

---

## Files Modified

- `src/app/auth/reset-password/page.tsx` — **created**
- `src/lib/supabase/middleware.ts` — public route
- `src/app/auth/login/page.tsx` — success message

---

## Remaining Risks

| Risk | Mitigation |
|------|------------|
| Expired reset link | Error UI + link to forgot-password |
| Email confirm vs recovery type mismatch | Supports `code` and `token_hash` |
| User stays on reset without Supabase env | `createClient()` throws clear error |

---

## Deployment Status

| Item | Status |
|------|--------|
| Route exists in build | ✅ |
| Recovery session handling | ✅ |
| Redirect after update | ✅ |
