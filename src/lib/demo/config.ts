import { isSupabaseConfigured } from "@/lib/supabase/env";

/** Demo mode activates automatically when Supabase is not configured. */
export function isDemoMode(): boolean {
  return !isSupabaseConfigured();
}

export function isDemoModeClient(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
  if (!url || !key) return true;
  if (url.includes("your_supabase") || key.includes("your_supabase")) return true;
  return !url.startsWith("https://") || key.length <= 20;
}

export const DEMO_SESSION_COOKIE = "humanos_demo_session";
