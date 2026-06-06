"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Flame, Target, Brain, TrendingUp } from "lucide-react";

function readOnboardingPct(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem("humanos_onboarding_progress");
    if (raw) {
      const done = (JSON.parse(raw) as string[]).length;
      return Math.round((done / 8) * 100);
    }
  } catch {
    // ignore
  }
  return 0;
}

function useOnboardingPct() {
  return useSyncExternalStore(
    () => () => {},
    () => readOnboardingPct(),
    () => 0
  );
}

export default function GrowthAnalyticsPage() {
  const onboardingPct = useOnboardingPct();

  return (
    <div>
      <PageHeader
        title="Growth Analytics"
        description="Streaks, consistency, and milestones — your personal progress dashboard"
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Flame, label: "Onboarding", value: `${onboardingPct}%`, sub: "Getting started" },
          { icon: Target, label: "Assessments", value: "—", sub: "Complete in Testing Hub" },
          { icon: Brain, label: "AI Sessions", value: "—", sub: "Coach & mentors" },
          { icon: TrendingUp, label: "HPI Trend", value: "—", sub: "View in Blueprint" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <Icon className="h-5 w-5 text-violet-400 mb-2" />
                <p className="text-2xl font-bold text-zinc-100">{stat.value}</p>
                <p className="text-sm text-zinc-400">{stat.label}</p>
                <p className="text-xs text-zinc-600 mt-1">{stat.sub}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Privacy-respecting analytics</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-zinc-400 space-y-3">
          <p>
            Detailed retention and feature analytics respect your choices in{" "}
            <Link href="/settings/privacy" className="text-violet-400 hover:underline">
              Privacy & Security
            </Link>
            . Product metrics are aggregated — never sold.
          </p>
          <Link href="/getting-started">
            <Button size="sm">Continue onboarding</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
