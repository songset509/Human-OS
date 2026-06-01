"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { GrowthPlanWeek } from "@/types";

export default function ArchitectPage() {
  const [weekly, setWeekly] = useState<GrowthPlanWeek[]>([]);
  const [monthly, setMonthly] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/architect").then((r) => r.json()).then((d) => {
      setWeekly(d.plan?.weekly ?? []);
      setMonthly(d.plan?.monthly ?? []);
    });
  }, []);

  return (
    <div>
      <PageHeader
        title="AI Life Architect"
        description="Personalized weekly growth plans and monthly roadmaps based on your full profile"
      />

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader><CardTitle>4-Week Growth Plan</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {weekly.map((w) => (
              <div key={w.week} className="rounded-xl border border-white/8 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge>Week {w.week}</Badge>
                  <span className="font-medium text-zinc-200">{w.focus}</span>
                </div>
                <ul className="space-y-1">
                  {w.actions.map((a) => (
                    <li key={a} className="text-xs text-zinc-400">• {a}</li>
                  ))}
                </ul>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Monthly Roadmap</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {monthly.map((m, i) => (
              <div key={i} className="rounded-xl border border-violet-500/15 bg-violet-500/5 p-4 text-sm text-zinc-300">
                {m}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-teal-500/20">
        <CardContent className="pt-6 text-center text-sm text-zinc-400">
          Life Architect uses your assessment history, mood trends, challenge progress, and flourishing scores.
          Visit <strong className="text-zinc-300">AI Coach</strong> for daily reflection and guidance.
        </CardContent>
      </Card>
    </div>
  );
}
