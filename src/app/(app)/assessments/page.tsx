import Link from "next/link";
import {
  HeartPulse,
  Sparkles,
  Users,
  Shield,
  Smartphone,
  Clock,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ASSESSMENTS } from "@/lib/assessments-data";
import { getAssessmentResults } from "@/lib/data/user-data";

const iconMap: Record<string, React.ElementType> = {
  "heart-pulse": HeartPulse,
  sparkles: Sparkles,
  users: Users,
  shield: Shield,
  smartphone: Smartphone,
};

export default async function AssessmentsPage() {
  const results = await getAssessmentResults();
  const latestByAssessment = new Map<string, typeof results[0]>();

  for (const result of results) {
    if (!latestByAssessment.has(result.assessment_id)) {
      latestByAssessment.set(result.assessment_id, result);
    }
  }

  return (
    <div>
      <PageHeader
        title="Assessment Center"
        description="Science-informed assessments to understand your well-being dimensions"
      />

      <div className="grid sm:grid-cols-2 gap-6">
        {ASSESSMENTS.map((assessment) => {
          const Icon = iconMap[assessment.icon ?? ""] ?? HeartPulse;
          const latest = latestByAssessment.get(assessment.id);
          const completed = !!latest;

          return (
            <Card
              key={assessment.id}
              className="group hover:border-violet-500/30 transition-all duration-300"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600/10 text-violet-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  {completed ? (
                    <Badge variant="success">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      {Math.round(latest.normalized_score)}/100
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Not taken</Badge>
                  )}
                </div>
                <CardTitle className="mt-4">{assessment.title}</CardTitle>
                <CardDescription>{assessment.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-zinc-500">
                    <Clock className="h-4 w-4" />
                    {assessment.question_count} questions · ~{Math.ceil(assessment.question_count * 0.5)} min
                  </div>
                  <Link href={`/assessments/${assessment.id}`}>
                    <Button size="sm" variant={completed ? "secondary" : "default"}>
                      {completed ? "Retake" : "Start"}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
