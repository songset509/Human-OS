"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { shouldShowDemoUIClient } from "@/lib/demo/ui";
import { User, LogOut, Mail, Calendar } from "lucide-react";
import { format } from "date-fns";

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const demoMode = shouldShowDemoUIClient();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (demoMode) {
        const res = await fetch("/api/profile");
        if (cancelled) return;
        if (res.ok) {
          const data = await res.json();
          setProfile(data.profile);
          setFullName(data.profile.full_name ?? "");
        }
        setLoading(false);
        return;
      }

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (cancelled) return;

      if (user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        setProfile({
          id: user.id,
          email: user.email ?? "",
          full_name: profileData?.full_name ?? user.user_metadata?.full_name ?? null,
          created_at: user.created_at,
        });
        setFullName(profileData?.full_name ?? user.user_metadata?.full_name ?? "");
      }
      setLoading(false);
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [demoMode]);

  async function handleSave() {
    if (!profile) return;
    setSaving(true);

    if (demoMode) {
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName }),
      });
    } else {
      const supabase = createClient();
      await supabase
        .from("profiles")
        .upsert({ id: profile.id, full_name: fullName, updated_at: new Date().toISOString() });
    }

    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 3000);
  }

  async function handleSignOut() {
    if (demoMode) {
      await fetch("/api/demo/auth", { method: "DELETE" });
    } else {
      const supabase = createClient();
      await supabase.auth.signOut();
    }
    router.push("/");
    router.refresh();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Profile" description="Manage your account and preferences" />

      <div className="grid lg:grid-cols-2 gap-6 max-w-4xl">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-teal-500">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle>{fullName || "HumanOS User"}</CardTitle>
                <CardDescription className="flex items-center gap-1 mt-1">
                  <Mail className="h-3 w-3" />
                  {profile?.email}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-white/8 p-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-zinc-500" />
                <div>
                  <p className="text-sm text-zinc-300">Member since</p>
                  <p className="text-xs text-zinc-500">
                    {profile?.created_at
                      ? format(new Date(profile.created_at), "MMMM d, yyyy")
                      : "—"}
                  </p>
                </div>
              </div>
              <Badge variant={demoMode ? "default" : "success"}>
                {demoMode ? "Demo" : "Active"}
              </Badge>
            </div>

            <Button variant="destructive" onClick={handleSignOut} className="w-full">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
