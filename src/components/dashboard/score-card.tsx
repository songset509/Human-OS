"use client";

import { motion } from "framer-motion";
import { cn, formatScore, getScoreColor, getScoreLabel } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface ScoreCardProps {
  title: string;
  score: number;
  icon?: React.ReactNode;
  description?: string;
  delay?: number;
  featured?: boolean;
}

export function ScoreCard({
  title,
  score,
  icon,
  description,
  delay = 0,
  featured = false,
}: ScoreCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={cn(
        "rounded-2xl border p-6 backdrop-blur-xl transition-all hover:border-white/15",
        featured
          ? "border-violet-500/30 bg-gradient-to-br from-violet-600/10 to-teal-600/10"
          : "border-white/8 bg-zinc-900/60"
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-zinc-400">{title}</p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={cn("text-3xl font-bold", getScoreColor(score))}>
              {formatScore(score)}
            </span>
            <span className="text-sm text-zinc-500">/100</span>
          </div>
        </div>
        {icon && (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
            {icon}
          </div>
        )}
      </div>
      <Progress value={score} className="mb-2" />
      <p className="text-xs text-zinc-500">{description ?? getScoreLabel(score)}</p>
    </motion.div>
  );
}
