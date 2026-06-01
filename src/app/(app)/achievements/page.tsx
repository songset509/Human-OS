"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  Eye, Shield, Brain, HeartHandshake, Trophy, Flame, Zap, Compass, Lock,
} from "lucide-react";
import type { Achievement } from "@/types";

const iconMap: Record<string, React.ElementType> = {
  eye: Eye, shield: Shield, brain: Brain, "heart-handshake": HeartHandshake,
  trophy: Trophy, flame: Flame, zap: Zap, compass: Compass,
};

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    fetch("/api/blueprint").then((r) => r.json()).then((d) => setAchievements(d.achievements ?? []));
  }, []);

  const unlocked = achievements.filter((a) => a.unlocked).length;

  return (
    <div>
      <PageHeader
        title="Achievements"
        description={`${unlocked} of ${achievements.length} titles unlocked — gamified growth without vanity metrics`}
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((a, i) => {
          const Icon = iconMap[a.icon] ?? Trophy;
          return (
            <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className={cn(a.unlocked ? "border-teal-500/30 bg-teal-500/5" : "opacity-60")}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl",
                      a.unlocked ? "bg-teal-600/20 text-teal-400" : "bg-white/5 text-zinc-600"
                    )}>
                      {a.unlocked ? <Icon className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-zinc-200 text-sm">{a.title}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{a.description}</p>
                      {!a.unlocked && (
                        <Progress value={a.progress} className="mt-3 h-1" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
