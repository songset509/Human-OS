const PLACEHOLDER_VALUES = [
  "your_supabase_project_url",
  "your_supabase_anon_key",
  "",
];

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url || !key) return false;
  if (PLACEHOLDER_VALUES.includes(url) || PLACEHOLDER_VALUES.includes(key)) {
    return false;
  }

  return url.startsWith("https://") && key.length > 20;
}

export function getSupabaseEnv(): { url: string; key: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase is not configured. Copy .env.local.example to .env.local and add your project URL and anon key from https://supabase.com/dashboard/project/_/settings/api"
    );
  }

  return { url: url!, key: key! };
}
