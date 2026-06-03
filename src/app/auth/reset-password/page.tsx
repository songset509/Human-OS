"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  buildConfirmRecoveryUrl,
  hasRecoveryQueryParams,
  recoveryErrorMessage,
  type RecoveryLinkError,
} from "@/lib/auth/recovery";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/shared/page-header";
import { Sparkles, CheckCircle2 } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const linkError = searchParams.get("error") as RecoveryLinkError | null;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(
    linkError ? recoveryErrorMessage(linkError) : null
  );
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [initializing, setInitializing] = useState(() => !linkError);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (linkError) return;

    if (hasRecoveryQueryParams(searchParams)) {
      router.replace(buildConfirmRecoveryUrl(searchParams));
      return;
    }

    let cancelled = false;

    async function ensureRecoverySession() {
      const supabase = createClient();

      try {
        const hash = typeof window !== "undefined" ? window.location.hash : "";
        if (hash.includes("access_token")) {
          const params = new URLSearchParams(hash.replace(/^#/, ""));
          const access_token = params.get("access_token");
          const refresh_token = params.get("refresh_token");
          if (access_token && refresh_token) {
            const { error: sessionError } = await supabase.auth.setSession({
              access_token,
              refresh_token,
            });
            if (sessionError) throw sessionError;
            window.history.replaceState(null, "", window.location.pathname);
          }
        }

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) {
          throw new Error("invalid");
        }

        if (!cancelled) {
          setSessionReady(true);
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setError(recoveryErrorMessage("invalid"));
          setSessionReady(false);
        }
      } finally {
        if (!cancelled) setInitializing(false);
      }
    }

    ensureRecoverySession();

    return () => {
      cancelled = true;
    };
  }, [searchParams, router, linkError]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;

      await supabase.auth.signOut();
      setSuccess(true);
      setTimeout(() => {
        router.push("/auth/login?message=password_updated");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update password.");
      setLoading(false);
    }
  }

  const showExpiredOrInvalid = !initializing && !success && !sessionReady && Boolean(error);

  return (
    <Card className="relative w-full max-w-md border-white/10">
      <CardHeader className="text-center">
        <Link href="/" className="inline-flex items-center justify-center gap-2 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-teal-500">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
        </Link>
        <CardTitle className="text-2xl">Set new password</CardTitle>
        <CardDescription>Choose a strong password for your account</CardDescription>
      </CardHeader>
      <CardContent>
        {initializing && (
          <div className="flex flex-col items-center py-8 gap-3">
            <LoadingSpinner />
            <p className="text-sm text-zinc-400">Verifying reset link…</p>
          </div>
        )}

        {!initializing && success && (
          <div className="text-center py-4">
            <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
            <p className="text-zinc-300 mb-2">Password updated</p>
            <p className="text-sm text-zinc-500">Redirecting to sign in…</p>
          </div>
        )}

        {!initializing && !success && sessionReady && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            {error && (
              <p className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Updating…" : "Update password"}
            </Button>
          </form>
        )}

        {showExpiredOrInvalid && (
          <div className="space-y-4">
            <p className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
            <Link href="/auth/forgot-password" className="block">
              <Button variant="secondary" className="w-full">
                Request new reset link
              </Button>
            </Link>
            <Link
              href="/auth/login"
              className="block text-center text-sm text-violet-400 hover:underline"
            >
              Back to sign in
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-zinc-950">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.1),transparent_50%)]" />
      <Suspense fallback={<LoadingSpinner />}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
