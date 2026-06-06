# Demo Mode Banner — Root Cause & Fix

**Date:** 2026-06-06  
**Symptom:** Production shows "Demo mode — all features work locally without Supabase..." while `/api/health` reports `provider=supabase`.

---

## Component Rendering the Banner

**File:** `src/components/layout/demo-banner.tsx`  
**Mounted in:** `src/app/(app)/layout.tsx` (all authenticated app pages)

**Also shows demo UI on:**
- `src/app/auth/login/page.tsx`
- `src/app/auth/signup/page.tsx`
- `src/app/(app)/profile/page.tsx`

---

## Root Causes

### 1. Overlapping detection logic (primary)

`DemoBanner` used `isDemoMode()` (data provider) combined with `isProductionRuntime()`. Data-layer `isDemoMode()` only checks `NODE_ENV === "development"` — but **UI should not mirror data provider logic**.

On some deployments:
- `NEXT_PUBLIC_*` vars present at **runtime** (health OK)
- Client bundle built **without** inlined public env → `isDemoModeClient()` returned `true`
- Or static layout segments cached from a build without env vars

### 2. Client env at build time

`isDemoModeClient()` relied on `NEXT_PUBLIC_SUPABASE_URL` at **build** time. If Vercel build lacked vars but runtime had them, health = supabase while client UI thought demo.

### 3. No hostname guard

Demo UI could theoretically render on any host if `NODE_ENV` checks failed or were misconfigured.

---

## Fix Applied

### New module: `src/lib/demo/ui.ts`

| Function | Rule |
|----------|------|
| `shouldShowDemoUI()` | Server: never on Vercel/preview/production; never if Supabase configured |
| `shouldShowDemoUIClient()` | Client: **never on non-localhost**; never if Supabase public config valid |
| `hasSupabasePublicConfig()` | Shared URL/key validation |

### `DemoBanner`

- Uses **only** `shouldShowDemoUI()` — not `isDemoMode()`
- Copy updated to "Local demo" (not generic "Demo mode")
- Removed "Get Supabase keys" as primary CTA tone for production

### `isDemoMode()` (data)

- Added explicit `if (process.env.VERCEL === "1") return false`

### App layout

- `export const dynamic = "force-dynamic"` — prevents static baking of banner state

### Auth pages

- Switched to `shouldShowDemoUIClient()` with hostname guard

---

## Verification

| Environment | Banner |
|-------------|--------|
| Vercel production | **Hidden** |
| Vercel preview | **Hidden** |
| localhost + Supabase | **Hidden** |
| localhost, no Supabase | **Shown** (intentional) |

```bash
# After deploy
curl https://your-app.vercel.app/api/health
# provider: "supabase"

# Visit /dashboard — no demo banner
```

---

## Files Changed

- `src/lib/demo/ui.ts` (new)
- `src/lib/demo/config.ts`
- `src/components/layout/demo-banner.tsx`
- `src/app/(app)/layout.tsx`
- `src/app/auth/login/page.tsx`
- `src/app/auth/signup/page.tsx`
- `src/app/(app)/profile/page.tsx`
