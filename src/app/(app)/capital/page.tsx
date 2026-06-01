"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState, ErrorState } from "@/components/shared/async-state";
import { useFetch } from "@/hooks/use-fetch";

export default function CapitalPage() {
  const { data, loading, error, refetch } = useFetch<{
    capital: { score: number; dimensions: Record<string, number> };
  }>("/api/capital");

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const c = data?.capital;

  return (
    <div>
      <PageHeader title="Human Capital Index" description="Communication, leadership, adaptability, creativity, learning, EQ" />
      <div className="mb-8 text-center rounded-3xl border border-violet-500/25 p-8">
        <p className="text-6xl font-bold text-violet-400">{c?.score ?? 50}</p>
        <p className="text-zinc-500">Human Capital Score</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Dimensions</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(c?.dimensions ?? {}).map(([k, v]) => (
            <div key={k}>
              <div className="flex justify-between text-sm mb-1">
                <span className="capitalize text-zinc-400">{k.replace(/([A-Z])/g, " $1")}</span>
                <span className="text-zinc-200">{Math.round(v)}</span>
              </div>
              <div className="h-2 rounded-full bg-white/10">
                <div className="h-full rounded-full bg-violet-500" style={{ width: `${v}%` }} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
