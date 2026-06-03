import { cookies } from "next/headers";
import type { SessionUser } from "@/lib/auth/session-types";
import { DEMO_SESSION_COOKIE, isDemoMode, assertNotDemoInProduction } from "@/lib/demo/config";
import { assertSupabaseProviderOnly } from "@/lib/providers";
import { parseDemoSessionCookie } from "@/lib/demo/session-cookie";
import { demoGetUserById } from "@/lib/demo/store";
import { createClient } from "@/lib/supabase/server";

function demoUserToSession(user: {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
}): SessionUser {
  return {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    created_at: user.created_at,
    demo: true,
  };
}

export async function getSessionUser(): Promise<SessionUser | null> {
  assertSupabaseProviderOnly();

  if (isDemoMode()) {
    assertNotDemoInProduction();
    const cookieStore = await cookies();
    const parsed = parseDemoSessionCookie(cookieStore.get(DEMO_SESSION_COOKIE)?.value);
    if (!parsed) return null;
    const user = demoGetUserById(parsed.id);
    return user ? demoUserToSession(user) : null;
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    return {
      id: user.id,
      email: user.email ?? "",
      full_name: (user.user_metadata?.full_name as string) ?? null,
      created_at: user.created_at,
    };
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.error("[getSessionUser] Supabase auth failed:", err);
    }
    return null;
  }
}
