import Link from "next/link";
import { format } from "date-fns";
import {
  Heart,
  Sparkles,
  Shield,
  Brain,
  Users,
  Smartphone,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { ScoreCard } from "@/components/dashboard/score-card";
import {
  FlourishingRadar,
  MoodTrendChart,
  ScoreBarChart,
} from "@/components/charts/flourishing-charts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getFlourishingData, getCurrentUser } from "@/lib/data/user-data";
import { redirect } from "next/navigation";
import { getScoreColor, formatScore } from "@/lib/utils";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const { scores, insight, moods, completedAssessments, totalAssessments } =
    await getFlourishingData();

  const moodChartData = moods
    .slice()
    .reverse()
    .map((m) => ({
      date: format(new Date(m.logged_at), "MMM d"),
      score: 0,
      mood: m.mood,
    }));

  const scoreIcons = [
    { key: "emotionalHealth", title: "Emotional Health", icon: <Heart className="h-5 w-5 text-rose-400" /> },
    { key: "selfEsteem", title: "Self-Esteem", icon: <Sparkles className="h-5 w-5 text-amber-400" /> },
    { key: "resilience", title: "Resilience", icon: <Shield className="h-5 w-5 text-blue-400" /> },
    { key: "mindfulness", title: "Mindfulness", icon: <Brain className="h-5 w-5 text-violet-400" /> },
    { key: "socialConnection", title: "Social Connection", icon: <Users className="h-5 w-5 text-teal-400" /> },
    { key: "digitalWellness", title: "Digital Wellness", icon: <Smartphone className="h-5 w-5 text-cyan-400" /> },
  ] as const;

  return (
    <div>
      <PageHeader
        title={`Welcome back${user.full_name ? `, ${user.full_name.split(" ")[0]}` : ""}`}
        description="Your human flourishing overview"
      >
        <Link href="/assessments">
          <Button variant="secondary" size="sm">
            Take Assessment
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </PageHeader>

      {/* Hero score */}
      <div className="mb-8 rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-600/10 via-zinc-900/60 to-teal-600/10 p-8 glow">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <Badge variant="secondary" className="mb-3">
              <TrendingUp className="h-3 w-3 mr-1" />
              Human Flourishing Score
            </Badge>
            <div className="flex items-baseline gap-3">
              <span className={`text-6xl font-bold ${getScoreColor(scores.overall)}`}>
                {formatScore(scores.overall)}
              </span>
              <span className="text-xl text-zinc-500">/100</span>
            </div>
            <p className="mt-2 text-zinc-400 text-sm">
              {completedAssessments}/{totalAssessments} assessments completed
            </p>
          </div>
          <div className="flex flex-col gap-2 w-full sm:w-auto">
            {insight.strengths[0] && (
              <p className="text-sm text-emerald-400/90">{insight.strengths[0]}</p>
            )}
            {insight.growthAreas[0] && (
              <p className="text-sm text-amber-400/90">{insight.growthAreas[0]}</p>
            )}
            <Link href="/insights">
              <Button variant="outline" size="sm" className="w-full sm:w-auto mt-2">
                View Insights
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Score grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {scoreIcons.map((item, i) => (
          <ScoreCard
            key={item.key}
            title={item.title}
            score={scores[item.key]}
            icon={item.icon}
            delay={i * 0.05}
          />
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <FlourishingRadar scores={scores} />
        <ScoreBarChart scores={scores} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <MoodTrendChart data={moodChartData} />
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { href: "/mood", label: "Log today's mood", desc: "Track how you're feeling" },
              { href: "/coach", label: "Talk to AI Coach", desc: "Reflect and get guidance" },
              { href: "/challenges", label: "Start a challenge", desc: "Build growth habits" },
              { href: "/assessments", label: "Complete assessments", desc: "Unlock deeper insights" },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center justify-between rounded-xl border border-white/8 bg-white/3 p-4 hover:bg-white/5 hover:border-white/15 transition-all group"
              >
                <div>
                  <p className="text-sm font-medium text-zinc-200">{action.label}</p>
                  <p className="text-xs text-zinc-500">{action.desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-zinc-600 group-hover:text-violet-400 transition-colors" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
