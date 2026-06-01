"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Orbit, TrendingDown, TrendingUp } from "lucide-react";
import type { FutureSelfScenario } from "@/types";

export default function FutureSelfPage() {
  const [habits, setHabits] = useState("");
  const [goals, setGoals] = useState("");
  const [lifestyle, setLifestyle] = useState("");
  const [scenario, setScenario] = useState<FutureSelfScenario | null>(null);
  const [confidence, setConfidence] = useState<{ level: string; reason: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function simulate() {
    setLoading(true);
    const res = await fetch("/api/future-self", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ habits, goals, lifestyle }),
    });
    const data = await res.json();
    setScenario(data.scenario);
    setConfidence(data.confidence ?? null);
    setLoading(false);
  }

  const metrics = (pred: FutureSelfScenario["scenarioA"]) => [
    { label: "Flourishing", value: pred.flourishingScore },
    { label: "Mental Wellbeing", value: pred.mentalWellbeing },
    { label: "Relationships", value: pred.relationships },
    { label: "Productivity", value: pred.productivity },
    { label: "Purpose", value: pred.purpose },
  ];

  return (
    <div>
      <PageHeader title="Future Self Simulator" description="AI prediction engine — see where your habits lead you" />

      {!scenario ? (
        <Card className="max-w-2xl">
          <CardContent className="pt-6 space-y-4">
            <div><Label>Current Habits</Label><Textarea value={habits} onChange={(e) => setHabits(e.target.value)} placeholder="e.g. late-night scrolling, irregular sleep..." className="mt-2" /></div>
            <div><Label>Goals</Label><Textarea value={goals} onChange={(e) => setGoals(e.target.value)} placeholder="e.g. better relationships, daily meditation..." className="mt-2" /></div>
            <div><Label>Lifestyle</Label><Textarea value={lifestyle} onChange={(e) => setLifestyle(e.target.value)} placeholder="e.g. sedentary work, high screen time..." className="mt-2" /></div>
            <Button onClick={simulate} disabled={loading || !habits || !goals} className="w-full">
              <Orbit className="h-4 w-4" />{loading ? "Simulating..." : "Simulate Future Self"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <p className="text-center text-sm text-zinc-500">Timeline: {scenario.timeframe}</p>
          {confidence && (
            <p className="text-center text-xs text-zinc-500 max-w-lg mx-auto rounded-lg border border-white/8 px-4 py-2">
              Prediction confidence: <span className="text-violet-400 capitalize">{confidence.level}</span> — {confidence.reason}
            </p>
          )}
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: "Scenario A — Current Path", data: scenario.scenarioA, icon: TrendingDown, color: "rose" },
              { title: "Scenario B — Improved Habits", data: scenario.scenarioB, icon: TrendingUp, color: "teal" },
            ].map(({ title, data, icon: Icon, color }) => (
              <motion.div key={title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className={`border-${color}-500/20`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Icon className={`h-5 w-5 text-${color}-400`} />{title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 mb-4">
                      {metrics(data).map((m) => (
                        <div key={m.label} className="flex justify-between text-sm">
                          <span className="text-zinc-400">{m.label}</span>
                          <span className="font-medium text-zinc-200">{m.value}/100</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-zinc-500 leading-relaxed">{data.narrative}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          <Button variant="secondary" onClick={() => setScenario(null)} className="mx-auto block">Run Again</Button>
        </div>
      )}
    </div>
  );
}
