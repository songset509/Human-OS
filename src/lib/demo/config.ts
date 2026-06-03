import { allowDemoProvider, isProductionRuntime } from "@/lib/env/runtime";
import { isSupabaseConfigured } from "@/lib/supabase/env";

/** Demo mode: local development only, when Supabase is not configured. Never on Vercel/production. */
export function isDemoMode(): boolean {
  if (isProductionRuntime()) return false;
  if (!allowDemoProvider()) return false;
  return !isSupabaseConfigured();
}

/** Client-side demo detection — must match server rules for production builds. */
export function isDemoModeClient(): boolean {
  if (
    process.env.NEXT_PUBLIC_VERCEL_ENV === "production" ||
    process.env.NODE_ENV === "production"
  ) {
    return false;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
  if (!url || !key) return true;
  if (url.includes("your_supabase") || key.includes("your_supabase")) return true;
  if (!url.startsWith("https://") || !url.includes(".supabase.co")) return true;
  if (key.startsWith("eyJ")) return key.length < 80;
  if (key.startsWith("sb_publishable_")) return key.length < 20;
  return key.length <= 20;
}

export const DEMO_SESSION_COOKIE = "humanos_demo_session";
