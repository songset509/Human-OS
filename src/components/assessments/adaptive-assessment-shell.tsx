"use client";

import { useEffect, useState } from "react";
import { AssessmentTaker } from "@/components/assessments/assessment-taker";
import { LoadingState, ErrorState } from "@/components/shared/async-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AssessmentQuestion } from "@/types";

interface Props {
  assessmentId: string;
  title: string;
  questionType?: "likert" | "multiple_choice";
}

interface SessionPayload {
  session: {
    id: string;
    phase: number;
    questions: AssessmentQuestion[];
    daysSinceStart: number;
    totalPhases: number;
  };
}

interface MetaPayload {
  meta: {
    scientificBasis: string;
    whyItMatters: string;
    traitDimensions: { id: string; label: string; description: string }[];
  } | null;
  poolSize: number;
}

export function AdaptiveAssessmentShell({ assessmentId, title, questionType }: Props) {
  const [session, setSession] = useState<SessionPayload["session"] | null>(null);
  const [meta, setMeta] = useState<MetaPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/assessments/v2/session?assessmentId=${assessmentId}`).then((r) => r.json()),
      fetch(`/api/assessments/metadata?assessmentId=${assessmentId}`).then((r) => r.json()),
    ])
      .then(([sess, m]) => {
        if (sess.error) throw new Error(sess.error);
        setSession(sess.session);
        setMeta(m);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [assessmentId]);

  if (loading) return <LoadingState label="Preparing adaptive assessment..." />;
  if (error || !session) return <ErrorState message={error ?? "Session unavailable"} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">Adaptive V2</Badge>
        <Badge variant="secondary">Phase {session.phase} of {session.totalPhases}</Badge>
        <Badge variant="secondary">{session.questions.length} questions today</Badge>
        {meta && <Badge variant="secondary">Pool: {meta.poolSize}+ items</Badge>}
      </div>

      {meta?.meta && (
        <Card className="border-violet-500/20">
          <CardHeader>
            <CardTitle className="text-sm">Scientific basis</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-zinc-400 space-y-3">
            <p>{meta.meta.scientificBasis}</p>
            <p className="text-teal-400/90">{meta.meta.whyItMatters}</p>
            <div className="grid sm:grid-cols-2 gap-2">
              {meta.meta.traitDimensions.map((d) => (
                <div key={d.id} className="rounded-lg border border-white/8 px-3 py-2">
                  <p className="text-zinc-200 font-medium text-xs">{d.label}</p>
                  <p className="text-[11px] text-zinc-500">{d.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <AssessmentTaker
        assessmentId={assessmentId}
        title={title}
        questions={session.questions}
        questionType={questionType}
        sessionId={session.id}
        engineVersion="v2"
      />
    </div>
  );
}
