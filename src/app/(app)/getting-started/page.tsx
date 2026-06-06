"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    id: "welcome",
    title: "Welcome to HumanOS",
    description: "Your Life Operating System for human flourishing.",
    href: "/dashboard",
  },
  {
    id: "assessment",
    title: "Complete a core assessment",
    description: "Establish your baseline flourishing score.",
    href: "/testing-hub",
  },
  {
    id: "blueprint",
    title: "View your Human Blueprint",
    description: "See your strengths, gaps, and growth map.",
    href: "/blueprint",
  },
  {
    id: "coach",
    title: "Meet your AI Coach",
    description: "Get personalized guidance based on your profile.",
    href: "/coach",
  },
  {
    id: "insight",
    title: "Read your first insight",
    description: "Actionable recommendations from your data.",
    href: "/insights",
  },
  {
    id: "goal",
    title: "Set your first goal",
    description: "Define direction in Mission or Vault.",
    href: "/mission",
  },
] as const;

const STORAGE_KEY = "humanos_onboarding_progress";

function loadProgress(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return new Set(JSON.parse(raw) as string[]);
  } catch {
    // ignore
  }
  return new Set();
}

export default function GettingStartedPage() {
  const [completed, setCompleted] = useState<Set<string>>(loadProgress);

  function toggleStep(id: string) {
    const next = new Set(completed);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setCompleted(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
  }

  const doneCount = STEPS.filter((s) => completed.has(s.id)).length;
  const progress = Math.round((doneCount / STEPS.length) * 100);

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Getting Started"
        description="Your guided path to flourishing on HumanOS"
      />

      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-zinc-400">Progress</span>
          <span className="text-violet-400">{progress}%</span>
        </div>
        <div className="h-2 rounded-full bg-white/5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-600 to-teal-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="space-y-3">
        {STEPS.map((step, i) => {
          const done = completed.has(step.id);
          return (
            <Card key={step.id} className={cn(done && "border-emerald-500/20")}>
              <CardContent className="flex items-start gap-4 py-4">
                <button
                  type="button"
                  onClick={() => toggleStep(step.id)}
                  className="mt-0.5 shrink-0 text-zinc-400 hover:text-violet-400"
                  aria-label={done ? "Mark incomplete" : "Mark complete"}
                >
                  {done ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-zinc-600 mb-1">Step {i + 1}</p>
                  <p className="font-medium text-zinc-100">{step.title}</p>
                  <p className="text-sm text-zinc-500 mt-1">{step.description}</p>
                </div>
                <Link href={step.href}>
                  <Button size="sm" variant="secondary" className="gap-1 shrink-0">
                    Go <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
