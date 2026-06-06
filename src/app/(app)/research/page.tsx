"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import type { ResearchStats } from "@/types";

export default function ResearchPage() {
  const [stats, setStats] = useState<ResearchStats | null>(null);
  const [scope, setScope] = useState<"personal" | "platform">("personal");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/research")
      .then((r) => {
        if (!r.ok) throw new Error("Unable to load research data");
        return r.json();
      })
      .then((d) => {
        setStats(d.stats);
        setScope(d.scope ?? "personal");
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"));
  }, []);

  if (error) {
    return (
      <div className="text-center py-20 text-rose-400">
        <p>{error}</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  if (!stats.hasData) {
    return (
      <div>
        <PageHeader
          title="Research Dashboard"
          description="Your personal growth analytics"
        />
        <Card className="mt-6">
          <CardContent className="py-12 text-center">
            <p className="text-zinc-300 mb-2">No research data yet</p>
            <p className="text-sm text-zinc-500 mb-6 max-w-md mx-auto">
              Complete assessments to build your personal flourishing profile. We never show
              fake platform statistics — your data is computed from your real results.
            </p>
            <Link href="/testing-hub">
              <Button>Start an assessment</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const bars = [
    { name: "Flourishing", value: stats.avgFlourishing },
    { name: "Digital", value: stats.avgDigitalWellness },
    { name: "Relationships", value: stats.avgRelationship },
    { name: "Purpose", value: stats.avgPurpose },
    { name: "HPI", value: stats.avgHPI },
  ];

  return (
    <div>
      <PageHeader
        title="Research Dashboard"
        description={
          scope === "personal"
            ? "Your personal flourishing profile and growth trends"
            : "Anonymized aggregate analytics (demo environment)"
        }
      />

      <p className="text-xs text-zinc-600 mb-6">
        {scope === "personal"
          ? "Based on your assessments and HPI history · Your data only"
          : `Sample size: ${stats.sampleSize} anonymized profiles · No individual data exposed`}
      </p>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{scope === "personal" ? "Your Scores" : "Average Scores"}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={bars}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: "#71717a", fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fill: "#71717a", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: "#18181b",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12,
                  }}
                />
                <Bar dataKey="value" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Growth Trends</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.trends.length === 0 ? (
              <p className="text-sm text-zinc-500 py-8 text-center">
                Complete more assessments to see trends over time.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={stats.trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fill: "#71717a", fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: "#71717a", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      background: "#18181b",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 12,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="flourishing"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    name="Flourishing"
                  />
                  <Line
                    type="monotone"
                    dataKey="hpi"
                    stroke="#2dd4bf"
                    strokeWidth={2}
                    name="HPI"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
