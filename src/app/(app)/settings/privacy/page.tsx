"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Download, Trash2, Brain, Database } from "lucide-react";

type ConsentState = {
  ai_processing?: boolean;
  analytics?: boolean;
  research_aggregate?: boolean;
};

export default function PrivacySecurityPage() {
  const [consent, setConsent] = useState<ConsentState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/governance")
      .then((r) => r.json())
      .then((d) => setConsent(d.consent ?? {}))
      .finally(() => setLoading(false));
  }, []);

  async function updateConsent(updates: ConsentState) {
    setSaving(true);
    setMessage(null);
    const res = await fetch("/api/governance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...consent, ...updates }),
    });
    const data = await res.json();
    if (res.ok) {
      setConsent(data.consent);
      setMessage("Preferences saved.");
    } else {
      setMessage(data.error ?? "Failed to save preferences.");
    }
    setSaving(false);
  }

  async function exportData() {
    setMessage(null);
    const res = await fetch("/api/governance?export=1");
    if (!res.ok) {
      setMessage("Export failed. Please try again.");
      return;
    }
    const data = await res.json();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `humanos-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage("Export downloaded.");
  }

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Privacy & Security"
        description="Understand and control your data on HumanOS"
      />

      <div className="space-y-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-violet-400" />
              What we store
            </CardTitle>
            <CardDescription>
              HumanOS stores your profile, assessment results, mood logs, vault entries, AI
              conversations, and growth history in Supabase. Data is isolated per user via Row
              Level Security.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-zinc-400 space-y-2">
            <p>• Account: email, name, auth metadata</p>
            <p>• Assessments: scores, responses, session history</p>
            <p>• Wellness: mood logs, burnout snapshots, life balance</p>
            <p>• AI: coach messages, mentor chats, memory summaries</p>
            <p>• Growth: achievements, timeline, vault, missions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-teal-400" />
              What AI sees
            </CardTitle>
            <CardDescription>
              When you use AI Coach or Mentors, we send your message plus summarized context
              (flourishing scores, recent memory, growth trends) to OpenAI. We do not send your
              password or payment data.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-violet-400" />
              Consent preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <p className="text-sm text-zinc-500">Loading…</p>
            ) : (
              <>
                <label className="flex items-center justify-between gap-4 text-sm">
                  <span>Allow AI processing of my data for coaching</span>
                  <input
                    type="checkbox"
                    checked={consent?.ai_processing ?? true}
                    onChange={(e) => updateConsent({ ai_processing: e.target.checked })}
                    disabled={saving}
                    className="h-4 w-4 rounded"
                  />
                </label>
                <label className="flex items-center justify-between gap-4 text-sm">
                  <span>Allow anonymized product analytics</span>
                  <input
                    type="checkbox"
                    checked={consent?.analytics ?? false}
                    onChange={(e) => updateConsent({ analytics: e.target.checked })}
                    disabled={saving}
                    className="h-4 w-4 rounded"
                  />
                </label>
              </>
            )}
            {message && <p className="text-sm text-emerald-400">{message}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your data rights</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={exportData} className="gap-2">
              <Download className="h-4 w-4" />
              Export my data
            </Button>
            <Link href="/reports">
              <Button variant="secondary" className="gap-2">
                <Download className="h-4 w-4" />
                Download reports
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-rose-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-rose-300">
              <Trash2 className="h-5 w-5" />
              Delete account
            </CardTitle>
            <CardDescription>
              To permanently delete your account and all associated data, contact support or use
              Supabase account deletion from your profile. Self-service deletion is coming in a
              future release.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/profile">
              <Button variant="secondary">Go to Profile</Button>
            </Link>
          </CardContent>
        </Card>

        <p className="text-xs text-zinc-600">
          See also{" "}
          <Link href="/privacy" className="text-violet-400 hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
