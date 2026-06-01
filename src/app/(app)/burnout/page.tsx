"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingState, ErrorState } from "@/components/shared/async-state";
import { useFetch } from "@/hooks/use-fetch";

export default function BurnoutPage() {
  const { data, loading, error, refetch } = useFetch<{
    analysis: { score: number; level: string; factors: string[]; interventions: string[] };
  }>("/api/burnout");

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  const a = data?.analysis;
  const levelColor = a?.level === "high" ? "destructive" : a?.level === "medium" ? "warning" : "success";

  return (
    <div>
      <PageHeader title="Burnout Prediction" description="Early warning system based on mood, assessments, and patterns" />
      <Card className="mb-6 text-center p-8">
        <Badge variant={levelColor as "destructive"} className="mb-3 capitalize">{a?.level} Risk</Badge>
        <p className="text-5xl font-bold text-zinc-100">{a?.score ?? 0}</p>
        <p className="text-zinc-500 text-sm">Burnout Risk Score</p>
      </Card>
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-rose-400">Risk Factors</CardTitle></CardHeader>
          <CardContent>{a?.factors.map((f) => <p key={f} className="text-sm text-zinc-400 mb-1">⚠ {f}</p>)}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-teal-400">Interventions</CardTitle></CardHeader>
          <CardContent>{a?.interventions.map((i) => <p key={i} className="text-sm text-zinc-400 mb-1">→ {i}</p>)}</CardContent>
        </Card>
      </div>
    </div>
  );
}
