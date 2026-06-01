import Link from "next/link";
import { format } from "date-fns";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/page-header";
import { FlourishingRadar, ScoreBarChart } from "@/components/charts/flourishing-charts";
import { getFlourishingData, getAssessmentResults } from "@/lib/data/user-data";
import { ASSESSMENTS } from "@/lib/assessments-data";
import { getScoreColor, formatScore } from "@/lib/utils";
import { ClipboardList, ArrowRight } from "lucide-react";

export default async function ResultsPage() {
  const { scores, insight } = await getFlourishingData();
  const results = await getAssessmentResults();

  const latestByAssessment = new Map<string, typeof results[0]>();
  for (const result of results) {
    if (!latestByAssessment.has(result.assessment_id)) {
      latestByAssessment.set(result.assessment_id, result);
    }
  }

  if (results.length === 0) {
    return (
      <div>
        <PageHeader title="Your Results" description="Assessment scores and flourishing analysis" />
        <EmptyState
          icon={<ClipboardList className="h-6 w-6 text-zinc-400" />}
          title="No results yet"
          description="Complete an assessment to see your scores and personalized insights."
          action={
            <Link href="/assessments">
              <Button>Take an Assessment</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Your Results"
        description="Human Flourishing Engine — combined assessment analysis"
      />

      <div className="mb-8 rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-600/10 to-teal-600/10 p-8 text-center">
        <p className="text-sm text-zinc-400 mb-2">Human Flourishing Score</p>
        <p className={`text-6xl font-bold ${getScoreColor(scores.overall)}`}>
          {formatScore(scores.overall)}
        </p>
        <p className="text-zinc-500 mt-1">out of 100</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-emerald-400">Strengths</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {insight.strengths.map((s, i) => (
                <li key={i} className="text-sm text-zinc-300 flex gap-2">
                  <span className="text-emerald-400 shrink-0">✦</span>
                  {s}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-amber-400">Growth Areas</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {insight.growthAreas.map((g, i) => (
                <li key={i} className="text-sm text-zinc-300 flex gap-2">
                  <span className="text-amber-400 shrink-0">→</span>
                  {g}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <FlourishingRadar scores={scores} />
        <ScoreBarChart scores={scores} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assessment History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {ASSESSMENTS.map((assessment) => {
              const latest = latestByAssessment.get(assessment.id);
              return (
                <div
                  key={assessment.id}
                  className="flex items-center justify-between rounded-xl border border-white/8 p-4"
                >
                  <div>
                    <p className="text-sm font-medium text-zinc-200">{assessment.title}</p>
                    {latest ? (
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Last taken {format(new Date(latest.created_at), "MMM d, yyyy")}
                      </p>
                    ) : (
                      <p className="text-xs text-zinc-500 mt-0.5">Not completed</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {latest ? (
                      <Badge variant="default">{Math.round(latest.normalized_score)}/100</Badge>
                    ) : (
                      <Link href={`/assessments/${assessment.id}`}>
                        <Button size="sm" variant="outline">
                          Take
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
