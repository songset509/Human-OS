"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Bot, Sparkles } from "lucide-react";
import type { DigitalTwinProfile } from "@/types";

export default function TwinPage() {
  const [twin, setTwin] = useState<DigitalTwinProfile | null>(null);
  const [question, setQuestion] = useState("");
  const [mode, setMode] = useState<"default" | "future" | "values" | "habit">("default");
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const presets = [
    { mode: "future" as const, label: "Future Self", placeholder: "Describe a decision you're facing..." },
    { mode: "values" as const, label: "Values Alignment", placeholder: "What choice are you weighing?" },
    { mode: "habit" as const, label: "Highest Impact Habit", placeholder: "What area do you want to improve?" },
  ];

  useEffect(() => {
    fetch("/api/twin")
      .then((r) => r.json())
      .then((d) => setTwin(d.twin ? { ...d.twin, confidence: d.confidence } : null));
  }, []);

  async function ask() {
    setLoading(true);
    const res = await fetch("/api/twin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, mode: mode === "default" ? undefined : mode }),
    });
    const data = await res.json();
    setAnswer(data.answer);
    setLoading(false);
  }

  if (!twin) {
    return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" /></div>;
  }

  return (
    <div>
      <PageHeader title="Human Digital Twin" description="Your personal AI model — ask what your best self would do" />

      <Card className="mb-6 border-violet-500/20 bg-gradient-to-br from-violet-600/10 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bot className="h-5 w-5 text-violet-400" />Your Digital Twin</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-zinc-300 leading-relaxed mb-4">{twin.personalitySummary}</p>
          {twin.confidence && (
            <p className="text-xs text-zinc-500 mb-4 rounded-lg border border-white/8 px-3 py-2">
              Twin confidence: <span className="text-teal-400 capitalize">{twin.confidence.level}</span> — {twin.confidence.reason}
            </p>
          )}
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div><p className="text-zinc-500 mb-1">Core Values</p><p className="text-zinc-300">{twin.coreValues.join(" · ")}</p></div>
            <div><p className="text-zinc-500 mb-1">Growth Priorities</p><p className="text-zinc-300">{twin.growthPriorities.join(" · ")}</p></div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader><CardTitle className="text-sm">Best Self Principles</CardTitle></CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {twin.bestSelfPrinciples.map((p) => (
              <li key={p} className="text-sm text-zinc-400 flex gap-2"><Sparkles className="h-4 w-4 text-teal-400 shrink-0" />{p}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            {presets.map((p) => (
              <Button
                key={p.mode}
                variant={mode === p.mode ? "default" : "secondary"}
                size="sm"
                onClick={() => { setMode(p.mode); setQuestion(""); }}
              >
                {p.label}
              </Button>
            ))}
          </div>
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={presets.find((p) => p.mode === mode)?.placeholder ?? "Ask your digital twin anything..."}
            rows={2}
          />
          <Button onClick={ask} disabled={loading || !question.trim()}>{loading ? "Thinking..." : "Ask Your Best Self"}</Button>
          {answer && (
            <div className="rounded-xl border border-teal-500/20 bg-teal-500/5 p-4 text-sm text-zinc-300 leading-relaxed">{answer}</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
