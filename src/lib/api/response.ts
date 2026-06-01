import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function requireSession() {
  const user = await getSessionUser();
  if (!user) return { user: null, error: jsonError("Unauthorized", 401) };
  return { user, error: null };
}

export function safeErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return "Internal server error";
}
