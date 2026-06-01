"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingState, ErrorState } from "@/components/shared/async-state";
import { useFetch } from "@/hooks/use-fetch";
import { Download } from "lucide-react";

export default function ReportsPage() {
  const { data, loading, error, refetch } = useFetch<{ report: Record<string, unknown> }>("/api/reports");
  const { data: roadmap } = useFetch<{ roadmap: { year1: string[]; year3: string[]; year5: string[] } }>("/api/reports?type=roadmap");

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const r = data?.report as {
    flourishing?: { overall: number };
    lifeBalance?: number;
    moods?: number;
    recommendations?: string[];
  } | undefined;

  const flourishingScore =
    typeof r?.flourishing === "object" && r?.flourishing !== null
      ? r.flourishing.overall
      : typeof r?.flourishing === "number"
        ? r.flourishing
        : null;

  return (
    <div>
      <PageHeader title="Life Reports" description="Monthly reports and future roadmaps">
        <Button variant="secondary" size="sm" onClick={() => window.print()}>
          <Download className="h-4 w-4" /> Export PDF
        </Button>
      </PageHeader>
      <Card className="mb-6 print:border-none">
        <CardHeader><CardTitle>Monthly Life Report</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>Flourishing Score: <strong>{flourishingScore ?? "—"}</strong></p>
          <p>Life Balance: <strong>{r?.lifeBalance ?? "—"}</strong></p>
          <p>Mood entries (30d): <strong>{r?.moods ?? 0}</strong></p>
          {r?.recommendations?.map((rec) => <p key={rec} className="text-zinc-400">• {rec}</p>)}
        </CardContent>
      </Card>
      {roadmap?.roadmap && (
        <div className="grid md:grid-cols-3 gap-4">
          {(["year1", "year3", "year5"] as const).map((y) => (
            <Card key={y}>
              <CardHeader><CardTitle>{y === "year1" ? "1 Year" : y === "year3" ? "3 Years" : "5 Years"}</CardTitle></CardHeader>
              <CardContent>
                <ul className="text-xs text-zinc-400 space-y-1">
                  {roadmap.roadmap[y].map((item) => <li key={item}>→ {item}</li>)}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
