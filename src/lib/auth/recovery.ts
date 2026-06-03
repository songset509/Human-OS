import type { EmailOtpType } from "@supabase/supabase-js";

export type RecoveryLinkError = "expired" | "invalid";

export function getAppOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  return "http://localhost:3000";
}

/** Where Supabase should send users after verifying the recovery email. */
export function getPasswordRecoveryConfirmUrl(): string {
  return `${getAppOrigin()}/auth/confirm?next=${encodeURIComponent("/auth/reset-password")}`;
}

export function hasRecoveryQueryParams(searchParams: URLSearchParams): boolean {
  return (
    searchParams.has("code") ||
    (searchParams.has("token_hash") && searchParams.has("type"))
  );
}

export function buildConfirmRecoveryUrl(searchParams: URLSearchParams): string {
  const confirm = new URL("/auth/confirm", getAppOrigin());
  for (const key of ["code", "token_hash", "type"] as const) {
    const value = searchParams.get(key);
    if (value) confirm.searchParams.set(key, value);
  }
  confirm.searchParams.set("next", "/auth/reset-password");
  return confirm.pathname + confirm.search;
}

export function recoveryErrorMessage(error: RecoveryLinkError | string | null): string {
  switch (error) {
    case "expired":
      return "Reset link expired. Request a new one.";
    case "invalid":
      return "Invalid reset link.";
    default:
      return "Invalid reset link.";
  }
}

export function isRecoveryOtpType(type: string | null): type is EmailOtpType {
  return type === "recovery" || type === "signup" || type === "invite" || type === "email";
}
