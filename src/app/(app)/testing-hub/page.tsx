import Link from "next/link";
import {
  Brain, Zap, Target, Compass, Briefcase, HeartHandshake,
  Clock, CheckCircle2, ArrowRight, FlaskConical,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAdvancedAssessmentsList } from "@/lib/assessments-data";
import { getAssessmentResults } from "@/lib/data/user-data";

const iconMap: Record<string, React.ElementType> = {
  brain: Brain, zap: Zap, target: Target, compass: Compass,
  briefcase: Briefcase, "heart-handshake": HeartHandshake,
};

const INTELLIGENCE_CATEGORIES = [
  "Cognitive Intelligence",
  "Emotional Intelligence",
  "Personality",
  "Leadership",
  "Productivity",
  "Burnout",
  "Career Alignment",
  "Learning Style",
];

export default async function TestingHubPage() {
  const assessments = getAdvancedAssessmentsList();
  const results = await getAssessmentResults();
  const latest = new Map<string, (typeof results)[0]>();
  for (const r of results) {
    if (!latest.has(r.assessment_id)) latest.set(r.assessment_id, r);
  }

  return (
    <div>
      <PageHeader
        title="Human Intelligence Center"
        description="Measure growth scientifically — history, trends, radar charts, and AI-powered reports"
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {INTELLIGENCE_CATEGORIES.map((cat) => (
          <span
            key={cat}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-zinc-400"
          >
            {cat}
          </span>
        ))}
      </div>

      <div className="mb-8 rounded-2xl border border-violet-500/20 bg-violet-500/5 p-6 flex items-start gap-4">
        <FlaskConical className="h-6 w-6 text-violet-400 shrink-0" />
        <div>
          <p className="text-sm text-zinc-300 font-medium">Assessment history stored in Supabase</p>
          <p className="text-xs text-zinc-500 mt-1">
            Results power your Blueprint, HPI, Digital Twin, and AI memory. Retake tests to track growth over time.
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-6">
        {assessments.map((a) => {
          const Icon = iconMap[a.icon ?? ""] ?? Brain;
          const done = latest.get(a.id);
          return (
            <Card key={a.id} className="hover:border-violet-500/30 transition-all group">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-600/10 text-teal-400">
                    <Icon className="h-5 w-5" />
                  </div>
                  {done ? (
                    <Badge variant="success"><CheckCircle2 className="h-3 w-3 mr-1" />{Math.round(done.normalized_score)}</Badge>
                  ) : (
                    <Badge variant="secondary">Advanced</Badge>
                  )}
                </div>
                <CardTitle className="mt-4">{a.title}</CardTitle>
                <CardDescription>{a.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-between items-center">
                <span className="text-sm text-zinc-500 flex items-center gap-1">
                  <Clock className="h-4 w-4" />{a.question_count} questions
                </span>
                <Link href={`/assessments/${a.id}`}>
                  <Button size="sm">{done ? "Retake" : "Start"}<ArrowRight className="h-4 w-4" /></Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
