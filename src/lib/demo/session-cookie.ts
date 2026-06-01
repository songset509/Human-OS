import type { SessionUser } from "@/lib/auth/session-types";

/** Edge-safe: parse cookie only, no file system access. */
export function parseDemoSessionCookie(value: string | undefined): SessionUser | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(value)) as {
      id: string;
      email?: string;
      full_name?: string;
      created_at?: string;
    };
    if (!parsed.id) return null;
    return {
      id: parsed.id,
      email: parsed.email ?? "",
      full_name: parsed.full_name ?? null,
      created_at: parsed.created_at ?? new Date().toISOString(),
      demo: true,
    };
  } catch {
    return null;
  }
}

export function serializeDemoSession(user: {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
}): string {
  return encodeURIComponent(
    JSON.stringify({
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      created_at: user.created_at,
    })
  );
}
