"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isDemoModeClient } from "@/lib/demo/config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Zap } from "lucide-react";
import { LoadingSpinner } from "@/components/shared/page-header";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const demoMode = isDemoModeClient() || searchParams.get("demo") === "1";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (demoMode) {
        const res = await fetch("/api/demo/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "signup",
            email,
            password,
            fullName,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Signup failed");
          setLoading(false);
          return;
        }
      } else {
        const supabase = createClient();
        const { error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (authError) {
          setError(authError.message);
          setLoading(false);
          return;
        }
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create account");
      setLoading(false);
    }
  }

  return (
    <Card className="relative w-full max-w-md border-white/10">
      <CardHeader className="text-center">
        <Link href="/" className="inline-flex items-center justify-center gap-2 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-teal-500">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
        </Link>
        <CardTitle className="text-2xl">Create your account</CardTitle>
        <CardDescription>Start your journey toward human flourishing</CardDescription>
      </CardHeader>
      <CardContent>
        {demoMode && (
          <div className="mb-4 flex gap-3 rounded-xl border border-teal-500/30 bg-teal-500/10 p-4 text-sm text-teal-200">
            <Zap className="h-5 w-5 shrink-0 text-teal-400" />
            <div>
              <p className="font-medium text-teal-100">Try HumanOS instantly</p>
              <p className="mt-1 text-xs text-teal-200/80">
                Create a free local account — assessments, mood tracking, challenges,
                and AI coach all work without Supabase setup.
              </p>
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="Jane Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>
          {error && (
            <p className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-zinc-400">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-violet-400 hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-zinc-950">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.1),transparent_50%)]" />
      <Suspense fallback={<LoadingSpinner />}>
        <SignupForm />
      </Suspense>
    </div>
  );
}
