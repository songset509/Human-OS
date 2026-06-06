import { allowDemoProvider } from "@/lib/env/runtime";
import { assertDemoProviderAllowed } from "@/lib/demo/guard";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { shouldShowDemoUIClient } from "@/lib/demo/ui";

/** Data provider demo mode — never on Vercel or production builds. */
export function isDemoMode(): boolean {
  if (process.env.VERCEL === "1") return false;
  if (process.env.NODE_ENV !== "development") return false;
  if (!allowDemoProvider()) return false;
  return !isSupabaseConfigured();
}

export function assertNotDemoInProduction(): void {
  if (isDemoMode()) {
    assertDemoProviderAllowed("isDemoMode");
  }
}

/** @deprecated Use shouldShowDemoUIClient() for UI; kept for auth pages. */
export function isDemoModeClient(): boolean {
  return shouldShowDemoUIClient();
}

export const DEMO_SESSION_COOKIE = "humanos_demo_session";
