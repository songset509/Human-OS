"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingState, ErrorState } from "@/components/shared/async-state";
import { useFetch } from "@/hooks/use-fetch";
import { Brain, Sparkles } from "lucide-react";

export default function IntelligencePage() {
  const { data, loading, error, refetch } = useFetch<{ snapshot: Record<string, unknown> | null }>("/api/intelligence");
  const [running, setRunning] = useState(false);

  async function runPipeline() {
    setRunning(true);
    await fetch("/api/intelligence", { method: "POST" });
    await refetch();
    setRunning(false);
  }

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const s = data?.snapshot as {
    burnout?: { level: string; score: number; explanation: string };
    segment?: { label: string; explanation: string };
    journal?: { sentiment: string; summary: string };
    recommendations?: { type: string; title: string; reason: string }[];
  } | null;

  return (
    <div>
      <PageHeader title="HumanOS Intelligence" description="Adaptive analytics · segmentation · explainable recommendations">
        <Button onClick={runPipeline} disabled={running}>
          <Brain className="h-4 w-4" /> {running ? "Analyzing..." : "Run analysis"}
        </Button>
      </PageHeader>

      {!s ? (
        <Card>
          <CardContent className="py-12 text-center text-zinc-500 text-sm">
            Run analysis to generate burnout risk, user segment, and personalized recommendations.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-sm">Burnout prediction</CardTitle></CardHeader>
            <CardContent className="text-sm text-zinc-400">
              <p className="text-2xl font-bold text-rose-400 capitalize mb-2">{s.burnout?.level ?? "—"}</p>
              <p className="text-xs">{s.burnout?.explanation}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">User segment</CardTitle></CardHeader>
            <CardContent className="text-sm text-zinc-400">
              <p className="text-lg font-semibold text-violet-400 mb-2">{s.segment?.label}</p>
              <p className="text-xs">{s.segment?.explanation}</p>
            </CardContent>
          </Card>
          <Card className="md:col-span-2">
            <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Sparkles className="h-4 w-4" /> Recommendations (explainable)</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {s.recommendations?.map((r) => (
                <div key={r.title} className="rounded-lg border border-white/8 px-4 py-3">
                  <p className="text-sm text-zinc-200">{r.title}</p>
                  <p className="text-xs text-zinc-500 mt-1"><strong>Why:</strong> {r.reason}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
