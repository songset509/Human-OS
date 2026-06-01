"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { Trophy, TrendingUp, ClipboardList, Gauge } from "lucide-react";

interface TimelineEvent {
  id: string;
  event_type: string;
  title: string;
  value?: number;
  recorded_at: string;
}

const icons: Record<string, React.ElementType> = {
  flourishing: TrendingUp,
  hpi: Gauge,
  assessment: ClipboardList,
  achievement: Trophy,
  mood: TrendingUp,
};

export default function TimelinePage() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);

  useEffect(() => {
    fetch("/api/timeline").then((r) => r.json()).then((d) => setEvents(d.events ?? []));
  }, []);

  return (
    <div>
      <PageHeader title="Growth Timeline" description="Track your flourishing journey over time" />

      {events.length === 0 ? (
        <p className="text-center text-zinc-500 py-16">Complete assessments and log moods to build your timeline.</p>
      ) : (
        <div className="relative max-w-2xl mx-auto">
          <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-violet-500/50 to-teal-500/50" />
          <div className="space-y-6">
            {events.map((e, i) => {
              const Icon = icons[e.event_type] ?? TrendingUp;
              return (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="relative flex gap-4 pl-14"
                >
                  <div className="absolute left-3 flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900 border border-violet-500/30">
                    <Icon className="h-3.5 w-3.5 text-violet-400" />
                  </div>
                  <div className="flex-1 rounded-xl border border-white/8 bg-zinc-900/50 p-4">
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-medium text-zinc-200">{e.title}</p>
                      {e.value !== undefined && (
                        <span className="text-lg font-bold text-teal-400">{Math.round(e.value)}</span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 mt-1">
                      {format(new Date(e.recorded_at), "MMMM d, yyyy")}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
