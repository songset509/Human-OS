"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Download } from "lucide-react";

export default function PrivacyPage() {
  const [consent, setConsent] = useState({
    analytics: false,
    ai_personalization: true,
    research_aggregate: false,
  });

  useEffect(() => {
    fetch("/api/governance")
      .then((r) => r.json())
      .then((d) => d.consent && setConsent(d.consent));
  }, []);

  async function save() {
    await fetch("/api/governance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(consent),
    });
  }

  async function exportData() {
    const res = await fetch("/api/governance?export=1");
    const data = await res.json();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `humanos-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  }

  return (
    <div>
      <PageHeader title="Privacy & Data" description="Consent, export, and explainable AI governance" />

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Shield className="h-4 w-4 text-teal-400" /> Consent preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {(
            [
              ["analytics", "Usage analytics", "Help improve HumanOS with anonymized usage patterns"],
              ["ai_personalization", "AI personalization", "Allow AI to use your growth data for tailored coaching"],
              ["research_aggregate", "Research (aggregate)", "Contribute de-identified data to flourishing research"],
            ] as const
          ).map(([key, label, desc]) => (
            <label key={key} className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consent[key]}
                onChange={(e) => setConsent((c) => ({ ...c, [key]: e.target.checked }))}
                className="mt-1"
              />
              <span>
                <span className="text-zinc-200">{label}</span>
                <p className="text-xs text-zinc-500">{desc}</p>
              </span>
            </label>
          ))}
          <Button onClick={save}>Save preferences</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm">Your data</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm text-zinc-400">
          <p>Export all assessments, mood logs, and life events as JSON. Deletion requests: contact support or delete your account in Supabase auth.</p>
          <Button variant="secondary" onClick={exportData}>
            <Download className="h-4 w-4" /> Export my data
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
