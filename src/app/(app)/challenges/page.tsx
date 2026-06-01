"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CHALLENGES } from "@/lib/constants";
import type { ChallengeProgress } from "@/types";
import {
  Smartphone,
  Heart,
  Brain,
  Phone,
  Flame,
  CheckCircle2,
  Play,
} from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  "smartphone-off": Smartphone,
  heart: Heart,
  brain: Brain,
  phone: Phone,
};

export default function ChallengesPage() {
  const [progressList, setProgressList] = useState<ChallengeProgress[]>([]);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchProgress();
  }, []);

  async function fetchProgress() {
    const res = await fetch("/api/challenges");
    const data = await res.json();
    if (data.progress) setProgressList(data.progress);
  }

  function getActiveProgress(challengeId: string) {
    return progressList.find((p) => p.challenge_id === challengeId && p.is_active);
  }

  async function startChallenge(challengeId: string) {
    setLoading(challengeId);
    await fetch("/api/challenges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ challengeId, action: "start" }),
    });
    await fetchProgress();
    setLoading(null);
  }

  async function completeDay(challengeId: string, day: number) {
    setLoading(`${challengeId}-${day}`);
    await fetch("/api/challenges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ challengeId, action: "complete_day", day }),
    });
    await fetchProgress();
    setLoading(null);
  }

  return (
    <div>
      <PageHeader
        title="Growth Challenges"
        description="Build lasting habits through guided 7-day challenges"
      />

      <div className="grid sm:grid-cols-2 gap-6">
        {CHALLENGES.map((challenge, i) => {
          const Icon = iconMap[challenge.icon ?? ""] ?? Heart;
          const active = getActiveProgress(challenge.id);
          const completedDays = active?.completed_days ?? [];
          const progress = (completedDays.length / challenge.duration_days) * 100;
          const isComplete = active && !active.is_active && completedDays.length >= 7;
          const nextDay = completedDays.length + 1;

          return (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-600/10 text-teal-400">
                      <Icon className="h-5 w-5" />
                    </div>
                    {active && (
                      <Badge variant="default" className="flex items-center gap-1">
                        <Flame className="h-3 w-3" />
                        {active.streak} day streak
                      </Badge>
                    )}
                    {isComplete && (
                      <Badge variant="success">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Complete
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="mt-4">{challenge.title}</CardTitle>
                  <CardDescription>{challenge.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {active ? (
                    <div>
                      <div className="flex justify-between text-sm text-zinc-500 mb-2">
                        <span>{completedDays.length}/{challenge.duration_days} days</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="mb-4" />

                      <div className="flex flex-wrap gap-2 mb-4">
                        {Array.from({ length: challenge.duration_days }, (_, d) => d + 1).map(
                          (day) => (
                            <div
                              key={day}
                              className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium ${
                                completedDays.includes(day)
                                  ? "bg-teal-600/20 text-teal-400 border border-teal-500/30"
                                  : "bg-white/5 text-zinc-500 border border-white/8"
                              }`}
                            >
                              {day}
                            </div>
                          )
                        )}
                      </div>

                      {active.is_active && nextDay <= 7 && !completedDays.includes(nextDay) && (
                        <Button
                          className="w-full"
                          onClick={() => completeDay(challenge.id, nextDay)}
                          disabled={loading === `${challenge.id}-${nextDay}`}
                        >
                          {loading === `${challenge.id}-${nextDay}`
                            ? "Saving..."
                            : `Complete Day ${nextDay}`}
                        </Button>
                      )}
                    </div>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => startChallenge(challenge.id)}
                      disabled={loading === challenge.id}
                    >
                      <Play className="h-4 w-4" />
                      {loading === challenge.id ? "Starting..." : "Start Challenge"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
