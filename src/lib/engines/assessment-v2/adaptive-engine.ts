import {
  drawQuestionsForSession,
  getConsistencyPairs,
  getQuestionPool,
  bankQuestionToAssessmentQuestion,
} from "@/lib/assessments/question-banks";
import { scoreAssessment } from "@/lib/engines/advanced-scoring";
import type { AssessmentQuestion } from "@/types";
import type { BankQuestion } from "@/lib/assessments/question-banks/types";
import { computeConsistencyScore } from "./consistency";
import { computeResultConfidence } from "./confidence";
import { daysSince, PROGRESSIVE_PHASES } from "./progressive";

export interface AssessmentSessionState {
  id: string;
  assessmentId: string;
  phase: number;
  questionIds: number[];
  questions: AssessmentQuestion[];
  answers: Record<number, number>;
  status: "in_progress" | "completed";
  startedAt: string;
  daysSinceStart: number;
  nextPhaseAt?: number;
  totalPhases: number;
}

export function getQuestionsForPhase(
  assessmentId: string,
  userId: string,
  phase: number,
  excludeIds: number[] = []
): { questions: AssessmentQuestion[]; questionIds: number[] } {
  const phaseDef = PROGRESSIVE_PHASES.find((p) => p.phase === phase) ?? PROGRESSIVE_PHASES[0];
  const drawn = drawQuestionsForSession(
    assessmentId,
    userId,
    phaseDef.questionCount,
    excludeIds
  );
  return {
    questions: drawn.map(bankQuestionToAssessmentQuestion),
    questionIds: drawn.map((q) => q.id),
  };
}

export function scoreSessionBatch(
  assessmentId: string,
  answers: Record<number, number>,
  administeredIds: number[]
) {
  const pool = getQuestionPool(assessmentId);
  const administered = pool.filter((q) => administeredIds.includes(q.id));
  const questions: AssessmentQuestion[] = administered.map(bankQuestionToAssessmentQuestion);

  const scoring = scoreAssessment(assessmentId, answers, questions);
  const pairs = getConsistencyPairs(assessmentId);
  const { level: consistencyLevel, score: consistencyScore } = computeConsistencyScore(
    answers,
    pairs,
    administered as BankQuestion[]
  );

  return {
    ...scoring,
    consistencyLevel,
    consistencyScore,
    administeredIds,
    questions,
  };
}

export function buildSessionFromStored(
  stored: {
    id: string;
    assessment_id: string;
    phase: number;
    question_ids: number[];
    answers: Record<number, number>;
    status: string;
    started_at: string;
  },
  userId: string
): AssessmentSessionState {
  const days = daysSince(stored.started_at);
  const isComplete = stored.status === "completed";

  let questionIds = stored.question_ids;
  let questions: AssessmentQuestion[] = [];

  if (questionIds.length > 0) {
    const pool = getQuestionPool(stored.assessment_id);
    questions = pool
      .filter((q) => questionIds.includes(q.id))
      .map(bankQuestionToAssessmentQuestion);
  } else if (!isComplete) {
    const drawn = getQuestionsForPhase(stored.assessment_id, userId, stored.phase);
    questionIds = drawn.questionIds;
    questions = drawn.questions;
  }

  const nextPhase = PROGRESSIVE_PHASES.find((p) => p.phase === stored.phase + 1);

  return {
    id: stored.id,
    assessmentId: stored.assessment_id,
    phase: stored.phase,
    questionIds,
    questions,
    answers: stored.answers ?? {},
    status: isComplete ? "completed" : "in_progress",
    startedAt: stored.started_at,
    daysSinceStart: days,
    nextPhaseAt: nextPhase?.minDaysSinceStart,
    totalPhases: PROGRESSIVE_PHASES.length,
  };
}

export function finalizeSessionResult(
  assessmentId: string,
  allAnswers: Record<number, number>,
  allQuestionIds: number[],
  context: {
    priorResultsCount: number;
    moodLogCount: number;
    behavioralEventCount: number;
  }
) {
  const scored = scoreSessionBatch(assessmentId, allAnswers, allQuestionIds);
  const confidence = computeResultConfidence({
    consistencyLevel: scored.consistencyLevel,
    questionsAnswered: allQuestionIds.length,
    priorResultsCount: context.priorResultsCount,
    moodLogCount: context.moodLogCount,
    behavioralEventCount: context.behavioralEventCount,
  });

  return {
    score: scored.score,
    maxScore: scored.maxScore,
    normalizedScore: scored.normalizedScore,
    detailScores: scored.detailScores,
    consistencyLevel: scored.consistencyLevel,
    consistencyScore: scored.consistencyScore,
    confidenceLevel: confidence.level,
    confidenceReason: confidence.reason,
    administeredQuestionIds: allQuestionIds,
    engineVersion: "v2" as const,
  };
}
