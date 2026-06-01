"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState, ErrorState } from "@/components/shared/async-state";
import { useFetch } from "@/hooks/use-fetch";
import { LIFE_OS_DIMENSIONS } from "@/lib/engines/v5";

export default function LifeOsPage() {
  const { data, loading, error, refetch } = useFetch<{
    dimensions: Record<string, number>;
    balanceScore: number;
    recommendations: string[];
  }>("/api/life-os");

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const dims = data?.dimensions ?? {};

  return (
    <div>
      <PageHeader title="Life Operating System" description="Track balance across 7 life dimensions" />
      <div className="mb-8 text-center rounded-3xl border border-teal-500/25 bg-teal-500/10 p-8">
        <p className="text-sm text-zinc-400 mb-1">Life Balance Score</p>
        <p className="text-6xl font-bold text-teal-400">{data?.balanceScore ?? 50}</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {LIFE_OS_DIMENSIONS.map((d) => (
          <Card key={d}>
            <CardContent className="pt-6">
              <p className="text-sm capitalize text-zinc-400">{d}</p>
              <p className="text-2xl font-bold text-zinc-100">{dims[d] ?? 3}/5</p>
              <div className="h-2 rounded-full bg-white/10 mt-2">
                <div className="h-full rounded-full bg-teal-500" style={{ width: `${((dims[d] ?? 3) / 5) * 100}%` }} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {data?.recommendations && (
        <Card>
          <CardHeader><CardTitle>AI Recommendations</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {data.recommendations.map((r) => (
              <p key={r} className="text-sm text-zinc-400">• {r}</p>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
