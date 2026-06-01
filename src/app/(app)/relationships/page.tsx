"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingState, ErrorState } from "@/components/shared/async-state";
import { useFetch } from "@/hooks/use-fetch";

export default function RelationshipsPage() {
  const { data, loading, error, refetch } = useFetch<{
    nodes: { id: string; name: string; strength: number; category: string }[];
    healthScore: number;
  }>("/api/relationships");
  const [name, setName] = useState("");
  const [strength, setStrength] = useState(3);

  async function add() {
    await fetch("/api/relationships", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, strength, category: "friend" }),
    });
    setName("");
    refetch();
  }

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const nodes = data?.nodes ?? [];

  return (
    <div>
      <PageHeader title="Relationship Network" description="Map and strengthen your social connections" />
      <div className="mb-6 text-center rounded-2xl border border-violet-500/20 p-6">
        <p className="text-sm text-zinc-500">Relationship Health Score</p>
        <p className="text-4xl font-bold text-violet-400">{data?.healthScore ?? 50}</p>
      </div>
      <Card className="mb-6">
        <CardContent className="pt-6 flex gap-3 flex-wrap items-end">
          <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-40" /></div>
          <div><Label>Strength (1-5)</Label><Input type="number" min={1} max={5} value={strength} onChange={(e) => setStrength(+e.target.value)} className="mt-1 w-20" /></div>
          <Button onClick={add} disabled={!name}>Add</Button>
        </CardContent>
      </Card>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {nodes.map((n) => (
          <Card key={n.id} className={n.strength <= 2 ? "border-rose-500/30 opacity-80" : n.strength >= 4 ? "border-teal-500/30" : ""}>
            <CardContent className="pt-4">
              <p className="font-medium text-zinc-200">{n.name}</p>
              <p className="text-xs text-zinc-500 capitalize">{n.category} · Strength {n.strength}/5</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
