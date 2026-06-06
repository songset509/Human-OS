/**
 * UI-only demo detection — separate from data provider isDemoMode().
 * Demo banners must NEVER appear outside local development on localhost.
 */

function isValidSupabaseUrl(url: string): boolean {
  return url.startsWith("https://") && url.includes(".supabase.co");
}

function isValidAnonKey(key: string): boolean {
  if (!key || key.includes("your_supabase")) return false;
  if (key.startsWith("eyJ")) return key.length >= 80;
  if (key.startsWith("sb_publishable_")) return key.length >= 20;
  return key.length > 20;
}

/** True when Supabase public env vars look configured (build or runtime). */
export function hasSupabasePublicConfig(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
  return isValidSupabaseUrl(url) && isValidAnonKey(key);
}

function isHostedDeployment(): boolean {
  if (process.env.VERCEL === "1") return true;
  const vercelEnv =
    process.env.VERCEL_ENV ??
    process.env.NEXT_PUBLIC_VERCEL_ENV ??
    "";
  if (vercelEnv === "production" || vercelEnv === "preview") return true;
  if (process.env.NODE_ENV === "production") return true;
  return false;
}

/** Server / RSC: should demo UI render? */
export function shouldShowDemoUI(): boolean {
  if (isHostedDeployment()) return false;
  if (process.env.NODE_ENV !== "development") return false;
  if (hasSupabasePublicConfig()) return false;
  return true;
}

/** Client: never show demo UI on production hostnames. */
export function shouldShowDemoUIClient(): boolean {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    const isLocal =
      host === "localhost" ||
      host === "127.0.0.1" ||
      host.endsWith(".local");
    if (!isLocal) return false;
  }

  if (process.env.NODE_ENV === "production") return false;
  if (process.env.NEXT_PUBLIC_VERCEL_ENV === "production") return false;
  if (process.env.NEXT_PUBLIC_VERCEL_ENV === "preview") return false;
  if (hasSupabasePublicConfig()) return false;

  return process.env.NODE_ENV === "development";
}
