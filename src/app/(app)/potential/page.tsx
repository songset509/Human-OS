"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import type { HPIScore } from "@/types";
import { formatScore, getScoreColor } from "@/lib/utils";

export default function PotentialPage() {
  const [hpi, setHpi] = useState<HPIScore | null>(null);
  const [radar, setRadar] = useState<{ dimension: string; score: number }[]>([]);
  const [trend, setTrend] = useState<{ recorded_at: string; score: number }[]>([]);

  useEffect(() => {
    fetch("/api/hpi").then((r) => r.json()).then((d) => {
      setHpi(d.hpi);
      setRadar(d.radar ?? []);
      setTrend((d.trend ?? []).map((t: { recorded_at: string; score: number }) => ({
        date: new Date(t.recorded_at).toLocaleDateString("en", { month: "short", day: "numeric" }),
        score: t.score,
      })));
    });
  }, []);

  if (!hpi) {
    return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" /></div>;
  }

  const dims = [
    { label: "IQ", value: hpi.dimensions.iq },
    { label: "EQ", value: hpi.dimensions.eq },
    { label: "Resilience", value: hpi.dimensions.resilience },
    { label: "Purpose", value: hpi.dimensions.purpose },
    { label: "Relationships", value: hpi.dimensions.relationships },
    { label: "Attention", value: hpi.dimensions.attention },
    { label: "Digital Wellness", value: hpi.dimensions.digitalWellness },
    { label: "Self-Esteem", value: hpi.dimensions.selfEsteem },
  ];

  return (
    <div>
      <PageHeader title="Human Potential Index" description="Master metric combining IQ, EQ, resilience, purpose, and more" />

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mb-8 rounded-3xl border border-teal-500/25 bg-gradient-to-br from-teal-600/10 to-violet-600/10 p-8 text-center"
      >
        <Badge className="mb-3">{hpi.label}</Badge>
        <p className={`text-7xl font-bold ${getScoreColor(hpi.overall)}`}>{formatScore(hpi.overall)}</p>
        <p className="text-zinc-500 mt-1">Human Potential Score / 100</p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader><CardTitle>HPI Radar</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radar}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="dimension" tick={{ fill: "#a1a1aa", fontSize: 10 }} />
                <Radar dataKey="score" stroke="#2dd4bf" fill="#2dd4bf" fillOpacity={0.25} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Growth Trend</CardTitle></CardHeader>
          <CardContent>
            {trend.length === 0 ? (
              <p className="text-sm text-zinc-500 py-12 text-center">Complete assessments to track HPI over time</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fill: "#71717a", fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fill: "#71717a", fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
                  <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: "#8b5cf6" }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Dimension Breakdown</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {dims.map((d) => (
            <div key={d.label}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-zinc-400">{d.label}</span>
                <span className={getScoreColor(d.value)}>{Math.round(d.value)}</span>
              </div>
              <div className="h-2 rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-teal-500 to-violet-500" style={{ width: `${d.value}%` }} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
