"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FlourishingScores } from "@/types";

interface FlourishingRadarProps {
  scores: FlourishingScores;
}

export function FlourishingRadar({ scores }: FlourishingRadarProps) {
  const data = [
    { dimension: "Emotional", score: scores.emotionalHealth },
    { dimension: "Self-Esteem", score: scores.selfEsteem },
    { dimension: "Resilience", score: scores.resilience },
    { dimension: "Mindfulness", score: scores.mindfulness },
    { dimension: "Social", score: scores.socialConnection },
    { dimension: "Digital", score: scores.digitalWellness },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Flourishing Dimensions</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={data}>
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis
              dataKey="dimension"
              tick={{ fill: "#a1a1aa", fontSize: 12 }}
            />
            <Radar
              name="Score"
              dataKey="score"
              stroke="#8b5cf6"
              fill="#8b5cf6"
              fillOpacity={0.3}
            />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

interface MoodTrendChartProps {
  data: { date: string; score: number; mood: string }[];
}

const MOOD_VALUES: Record<string, number> = {
  happy: 5,
  calm: 4,
  neutral: 3,
  stressed: 2,
  sad: 1,
};

export function MoodTrendChart({ data }: MoodTrendChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    value: MOOD_VALUES[d.mood] ?? 3,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mood Trend</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex h-[200px] items-center justify-center text-zinc-500 text-sm">
            Log your mood to see trends
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fill: "#71717a", fontSize: 11 }} />
              <YAxis domain={[1, 5]} hide />
              <Tooltip
                contentStyle={{
                  background: "#18181b",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  color: "#fafafa",
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#8b5cf6"
                fill="url(#moodGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

interface ScoreBarChartProps {
  scores: FlourishingScores;
}

export function ScoreBarChart({ scores }: ScoreBarChartProps) {
  const data = [
    { name: "Emotional", score: scores.emotionalHealth },
    { name: "Self-Esteem", score: scores.selfEsteem },
    { name: "Resilience", score: scores.resilience },
    { name: "Mindfulness", score: scores.mindfulness },
    { name: "Social", score: scores.socialConnection },
    { name: "Digital", score: scores.digitalWellness },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Score Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((item) => (
          <div key={item.name}>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="text-zinc-400">{item.name}</span>
              <span className="text-zinc-200 font-medium">{Math.round(item.score)}</span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-600 to-teal-500 transition-all duration-700"
                style={{ width: `${item.score}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
