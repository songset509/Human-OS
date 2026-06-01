import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getFlourishingData } from "@/lib/data/user-data";
import { getScoreColor, formatScore } from "@/lib/utils";
import {
  Lightbulb,
  ArrowRight,
  TrendingUp,
  Target,
  Sparkles,
  AlertCircle,
} from "lucide-react";

export default async function InsightsPage() {
  const { scores, insight, completedAssessments, totalAssessments } =
    await getFlourishingData();

  const hasData = completedAssessments > 0;

  return (
    <div>
      <PageHeader
        title="Personalized Insights"
        description="AI-generated recommendations based on your assessment data"
      />

      {!hasData && (
        <Card className="mb-8 border-amber-500/20 bg-amber-500/5">
          <CardContent className="flex items-start gap-4 pt-6">
            <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-zinc-300">
                Complete at least one assessment to unlock personalized insights.
                Scores shown below are baseline estimates.
              </p>
              <Link href="/assessments" className="inline-block mt-3">
                <Button size="sm" variant="outline">
                  Take an Assessment
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mb-8 rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-600/10 to-teal-600/10 p-8">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="h-5 w-5 text-violet-400" />
          <span className="text-sm text-zinc-400">Your Flourishing Summary</span>
        </div>
        <p className="text-lg text-zinc-200 leading-relaxed mb-4">
          {insight.recommendations[0] ??
            "Start your journey by completing assessments and logging your mood daily."}
        </p>
        <div className="flex items-center gap-4">
          <div>
            <span className={`text-3xl font-bold ${getScoreColor(scores.overall)}`}>
              {formatScore(scores.overall)}
            </span>
            <span className="text-zinc-500 ml-1">/100</span>
          </div>
          <Badge variant="secondary">
            {completedAssessments}/{totalAssessments} assessments
          </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-400" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {insight.strengths.map((item, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold">
                    {i + 1}
                  </span>
                  <p className="text-sm text-zinc-300 leading-relaxed">{item}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-amber-400" />
              Growth Areas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {insight.growthAreas.map((item, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold">
                    {i + 1}
                  </span>
                  <p className="text-sm text-zinc-300 leading-relaxed">{item}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-violet-400" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {insight.recommendations.map((rec, i) => (
                <li
                  key={i}
                  className="rounded-xl border border-white/8 bg-white/3 p-4 text-sm text-zinc-300"
                >
                  {rec}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5 text-teal-400" />
              Next Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {insight.nextActions.map((action, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/3 p-4"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-teal-600/10 text-teal-400 text-xs font-bold">
                    {i + 1}
                  </span>
                  <p className="text-sm text-zinc-300">{action}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
