import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/demo/config";
import { isProductionRuntime } from "@/lib/env/runtime";
import { DEMO_SESSION_COOKIE } from "@/lib/demo/config";
import { demoSignIn, demoSignUp } from "@/lib/demo/store";
import { serializeDemoSession } from "@/lib/demo/session-cookie";
import { getRateLimitKey, rateLimit } from "@/lib/security/rate-limit";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 30,
};

export async function POST(request: Request) {
  if (isProductionRuntime() || !isDemoMode()) {
    return NextResponse.json(
      { error: "Demo auth is only available in local development without Supabase." },
      { status: 403 }
    );
  }

  const rl = rateLimit(getRateLimitKey(request, "demo-auth"), 10, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
  }

  try {
    const body = await request.json();
    const { action, email, password, fullName } = body as {
      action: "signup" | "login";
      email: string;
      password: string;
      fullName?: string;
    };

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    let user;
    if (action === "signup") {
      user = demoSignUp(email, password, fullName ?? "HumanOS User");
    } else {
      user = demoSignIn(email, password);
    }

    const response = NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
      },
      demo: true,
    });

    response.cookies.set(
      DEMO_SESSION_COOKIE,
      serializeDemoSession(user),
      COOKIE_OPTIONS
    );

    return response;
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Authentication failed" },
      { status: 400 }
    );
  }
}

export async function DELETE() {
  if (isProductionRuntime()) {
    return NextResponse.json({ error: "Not available" }, { status: 403 });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(DEMO_SESSION_COOKIE, "", { ...COOKIE_OPTIONS, maxAge: 0 });
  return response;
}
