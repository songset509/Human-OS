import { isProductionRuntime } from "@/lib/env/runtime";

const PLACEHOLDER_VALUES = [
  "your_supabase_project_url",
  "your_supabase_anon_key",
  "",
];

function isValidSupabaseUrl(url: string): boolean {
  return url.startsWith("https://") && url.includes(".supabase.co");
}

function isValidAnonKey(key: string): boolean {
  if (PLACEHOLDER_VALUES.includes(key)) return false;
  if (key.startsWith("eyJ")) return key.length >= 80;
  if (key.startsWith("sb_publishable_")) return key.length >= 20;
  return key.length > 20;
}

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !key) return false;
  if (!isValidSupabaseUrl(url) || !isValidAnonKey(key)) return false;
  return true;
}

export function getSupabaseEnv(): { url: string; key: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!isSupabaseConfigured()) {
    const hint = isProductionRuntime()
      ? "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel → Project → Settings → Environment Variables (Production), then redeploy."
      : "Copy .env.local.example to .env.local and add your project URL and anon key from https://supabase.com/dashboard/project/_/settings/api";

    throw new Error(`Supabase is not configured. ${hint}`);
  }

  return { url: url!, key: key! };
}

export type ConfigValidation = {
  ok: boolean;
  mode: "supabase" | "demo" | "misconfigured";
  errors: string[];
  warnings: string[];
};

/** Startup / health validation for ops and debugging. */
export function validateAppConfig(): ConfigValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (isProductionRuntime()) {
    if (!isSupabaseConfigured()) {
      errors.push("Production requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
    }
    if (process.env.HUMANOS_ALLOW_DEMO === "true") {
      warnings.push("HUMANOS_ALLOW_DEMO is ignored in production.");
    }
  } else if (!isSupabaseConfigured()) {
    warnings.push("Running in local demo mode (in-memory). Add Supabase keys for cloud auth.");
  }

  const openai = process.env.OPENAI_API_KEY?.trim();
  if (!openai || openai.includes("your_openai")) {
    warnings.push("OPENAI_API_KEY not set — AI features use fallback responses.");
  }

  if (!process.env.NEXT_PUBLIC_APP_URL?.trim()) {
    warnings.push("NEXT_PUBLIC_APP_URL not set — auth redirects may use localhost.");
  }

  return {
    ok: errors.length === 0,
    mode: isProductionRuntime()
      ? isSupabaseConfigured()
        ? "supabase"
        : "misconfigured"
      : isSupabaseConfigured()
        ? "supabase"
        : "demo",
    errors,
    warnings,
  };
}
