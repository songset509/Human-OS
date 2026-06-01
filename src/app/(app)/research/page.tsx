"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line,
} from "recharts";
import type { ResearchStats } from "@/types";

export default function ResearchPage() {
  const [stats, setStats] = useState<ResearchStats | null>(null);

  useEffect(() => {
    fetch("/api/research").then((r) => r.json()).then((d) => setStats(d.stats));
  }, []);

  if (!stats) {
    return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" /></div>;
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
        description="Anonymized aggregate analytics for human flourishing research"
      />

      <p className="text-xs text-zinc-600 mb-6">Sample size: {stats.sampleSize} anonymized profiles · No individual data exposed</p>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Average Scores</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={bars}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: "#71717a", fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fill: "#71717a", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
                <Bar dataKey="value" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Platform Trends</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={stats.trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: "#71717a", fontSize: 11 }} />
                <YAxis domain={[40, 100]} tick={{ fill: "#71717a", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
                <Line type="monotone" dataKey="flourishing" stroke="#8b5cf6" strokeWidth={2} name="Flourishing" />
                <Line type="monotone" dataKey="hpi" stroke="#2dd4bf" strokeWidth={2} name="HPI" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
