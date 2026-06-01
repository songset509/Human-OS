"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { MoodTrendChart } from "@/components/charts/flourishing-charts";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MOOD_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { MoodLog, MoodType } from "@/types";
import { CheckCircle2 } from "lucide-react";

export default function MoodPage() {
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [note, setNote] = useState("");
  const [moods, setMoods] = useState<MoodLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchMoods();
  }, []);

  async function fetchMoods() {
    const res = await fetch("/api/mood");
    const data = await res.json();
    if (data.moods) setMoods(data.moods);
  }

  async function handleSave() {
    if (!selectedMood) return;
    setLoading(true);
    setSaved(false);

    const res = await fetch("/api/mood", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mood: selectedMood, note: note || undefined }),
    });

    if (res.ok) {
      setSaved(true);
      setNote("");
      await fetchMoods();
      setTimeout(() => setSaved(false), 3000);
    }
    setLoading(false);
  }

  const today = format(new Date(), "yyyy-MM-dd");
  const todayLog = moods.find((m) => m.logged_at === today);

  const chartData = moods
    .slice()
    .reverse()
    .map((m) => ({
      date: format(new Date(m.logged_at), "MMM d"),
      score: 0,
      mood: m.mood,
    }));

  return (
    <div>
      <PageHeader
        title="Mood Tracker"
        description="Log how you're feeling today and track patterns over time"
      />

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>
              {todayLog ? "Update today's mood" : "How are you feeling today?"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-3 mb-6">
              {MOOD_OPTIONS.map((option) => (
                <motion.button
                  key={option.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedMood(option.value)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-2xl border p-4 transition-all",
                    selectedMood === option.value || todayLog?.mood === option.value
                      ? option.color + " ring-2 ring-violet-500/50"
                      : "border-white/8 bg-white/3 hover:bg-white/5"
                  )}
                >
                  <span className="text-3xl">{option.emoji}</span>
                  <span className="text-xs text-zinc-400">{option.label}</span>
                </motion.button>
              ))}
            </div>

            <Textarea
              placeholder="Add a note (optional)..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="mb-4"
            />

            <Button
              onClick={handleSave}
              disabled={!selectedMood || loading}
              className="w-full"
            >
              {loading ? "Saving..." : saved ? (
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> Saved!
                </span>
              ) : "Log Mood"}
            </Button>
          </CardContent>
        </Card>

        <MoodTrendChart data={chartData} />
      </div>

      {moods.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {moods.slice(0, 14).map((log) => {
                const option = MOOD_OPTIONS.find((o) => o.value === log.mood);
                return (
                  <div
                    key={log.id}
                    className="flex items-center gap-4 rounded-xl border border-white/8 px-4 py-3"
                  >
                    <span className="text-2xl">{option?.emoji}</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-zinc-200">{option?.label}</p>
                      {log.note && (
                        <p className="text-xs text-zinc-500 mt-0.5">{log.note}</p>
                      )}
                    </div>
                    <span className="text-xs text-zinc-500">
                      {format(new Date(log.logged_at), "MMM d, yyyy")}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
