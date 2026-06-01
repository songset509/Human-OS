"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState, ErrorState } from "@/components/shared/async-state";
import { useFetch } from "@/hooks/use-fetch";

export default function MissionPage() {
  const { data, loading, error, refetch } = useFetch<{
    mission: { missionStatement: string; lifeVision: string; longTermDirection: string };
  }>("/api/mission");

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;
  const m = data?.mission;

  return (
    <div>
      <PageHeader title="Life Mission Generator" description="Personal mission from your values, personality, and purpose" />
      <div className="grid gap-6 max-w-3xl">
        {[
          { title: "Personal Mission Statement", content: m?.missionStatement },
          { title: "Life Vision", content: m?.lifeVision },
          { title: "Long-Term Direction", content: m?.longTermDirection },
        ].map((block) => (
          <Card key={block.title} className="border-violet-500/20">
            <CardHeader><CardTitle className="text-violet-300">{block.title}</CardTitle></CardHeader>
            <CardContent>
              <p className="text-zinc-300 leading-relaxed">{block.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
