import { NextResponse, type NextRequest } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { isRecoveryOtpType } from "@/lib/auth/recovery";
import type { EmailOtpType } from "@supabase/supabase-js";

function redirectWithRecoveryError(
  origin: string,
  error: "expired" | "invalid"
): NextResponse {
  const url = new URL("/auth/reset-password", origin);
  url.searchParams.set("error", error);
  return NextResponse.redirect(url);
}

/**
 * Server-side recovery / auth confirmation.
 * Exchanges token_hash or code and stores session in HTTP-only cookies (no PKCE localStorage).
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const { origin } = requestUrl;

  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(`${origin}/auth/login?error=missing_supabase_config`);
  }

  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/auth/reset-password";

  if (!tokenHash && !code) {
    return redirectWithRecoveryError(origin, "invalid");
  }

  const redirectUrl = new URL(next, origin);
  const response = NextResponse.redirect(redirectUrl);
  const supabase = createRouteHandlerClient(request, response);

  if (tokenHash && type && isRecoveryOtpType(type)) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as EmailOtpType,
      token_hash: tokenHash,
    });

    if (error) {
      console.error("[auth/confirm] verifyOtp failed:", error.message);
      const recoveryError =
        error.message.toLowerCase().includes("expired") ||
        error.message.toLowerCase().includes("invalid")
          ? "expired"
          : "invalid";
      return redirectWithRecoveryError(origin, recoveryError);
    }

    return response;
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("[auth/confirm] exchangeCodeForSession failed:", error.message);
      const isPkce =
        error.message.toLowerCase().includes("code verifier") ||
        error.message.toLowerCase().includes("pkce");
      return redirectWithRecoveryError(origin, isPkce ? "expired" : "invalid");
    }

    return response;
  }

  return redirectWithRecoveryError(origin, "invalid");
}
