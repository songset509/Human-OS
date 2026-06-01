import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { AdaptiveAssessmentShell } from "@/components/assessments/adaptive-assessment-shell";
import { AssessmentTaker } from "@/components/assessments/assessment-taker";
import Link from "next/link";
import { getAssessmentById, getQuestionsByAssessmentId } from "@/lib/assessments-data";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AssessmentPage({ params }: Props) {
  const { id } = await params;
  const assessment = getAssessmentById(id);
  const questions = getQuestionsByAssessmentId(id);

  if (!assessment || questions.length === 0) {
    notFound();
  }

  const useLegacy = id === "iq-assessment";

  return (
    <div>
      <PageHeader
        title={assessment.title}
        description={
          useLegacy
            ? `${assessment.question_count} questions · Full assessment`
            : `Adaptive V2 · Progressive phases · Unique question draw`
        }
      />
      {useLegacy ? (
        <>
          <AssessmentTaker
            assessmentId={assessment.id}
            title={assessment.title}
            questions={questions}
            questionType={assessment.questionType ?? "likert"}
          />
          <p className="text-center text-xs text-zinc-600 mt-6">
            <Link href={`/assessments/${id}?mode=v2`} className="text-violet-400 hover:underline">
              Try adaptive mode (where available)
            </Link>
          </p>
        </>
      ) : (
        <AdaptiveAssessmentShell
          assessmentId={assessment.id}
          title={assessment.title}
          questionType={assessment.questionType ?? "likert"}
        />
      )}
    </div>
  );
}
