import type { AssessmentQuestion } from "@/types";
import { calculateAssessmentScore } from "@/lib/flourishing-engine";

export function scoreMultipleChoice(
  answers: Record<number, number>,
  questions: AssessmentQuestion[]
): { score: number; maxScore: number; normalizedScore: number; detailScores: Record<string, number> } {
  let score = 0;
  const traits: Record<string, { correct: number; total: number }> = {};

  for (const q of questions) {
    const answer = answers[q.id];
    const trait = q.trait ?? "general";
    if (!traits[trait]) traits[trait] = { correct: 0, total: 0 };
    traits[trait].total++;

    const selected = q.options?.find((o) => o.value === answer);
    if (selected?.correct) {
      score++;
      traits[trait].correct++;
    }
  }

  const maxScore = questions.length;
  const normalizedScore = Math.round((score / maxScore) * 100);

  const detailScores: Record<string, number> = {};
  for (const [trait, data] of Object.entries(traits)) {
    detailScores[trait] = Math.round((data.correct / data.total) * 100);
  }

  // IQ estimate: 85-130 range based on performance
  const iqLow = Math.round(85 + (normalizedScore / 100) * 30);
  const iqHigh = Math.min(145, iqLow + 8);
  detailScores.iqEstimateLow = iqLow;
  detailScores.iqEstimateHigh = iqHigh;
  detailScores.iqMid = Math.round((iqLow + iqHigh) / 2);

  return { score, maxScore, normalizedScore, detailScores };
}

export function scoreBigFive(
  answers: Record<number, number>,
  questions: AssessmentQuestion[]
): { score: number; maxScore: number; normalizedScore: number; detailScores: Record<string, number> } {
  const traits = ["openness", "conscientiousness", "extraversion", "agreeableness", "neuroticism"];
  const detailScores: Record<string, number> = {};
  let totalScore = 0;
  let totalMax = 0;

  for (const trait of traits) {
    const traitQs = questions.filter((q) => q.trait === trait);
    const { score, maxScore, normalizedScore } = calculateAssessmentScore(
      answers,
      traitQs.map((q) => ({ id: q.id, reverseScored: q.reverseScored }))
    );
    detailScores[trait] = trait === "neuroticism" ? 100 - normalizedScore : normalizedScore;
    totalScore += score;
    totalMax += maxScore;
  }

  const normalizedScore = Math.round((totalScore / totalMax) * 100);
  return { score: totalScore, maxScore: totalMax, normalizedScore, detailScores };
}

export function scoreByTrait(
  answers: Record<number, number>,
  questions: AssessmentQuestion[],
  traits: string[]
): { score: number; maxScore: number; normalizedScore: number; detailScores: Record<string, number> } {
  const detailScores: Record<string, number> = {};
  let totalScore = 0;
  let totalMax = 0;

  for (const trait of traits) {
    const traitQs = questions.filter((q) => q.trait === trait);
    if (traitQs.length === 0) continue;
    const { score, maxScore, normalizedScore } = calculateAssessmentScore(
      answers,
      traitQs.map((q) => ({ id: q.id, reverseScored: q.reverseScored }))
    );
    detailScores[trait] = normalizedScore;
    totalScore += score;
    totalMax += maxScore;
  }

  if (traits.length === 0) {
    return calculateAssessmentScore(answers, questions) as ReturnType<typeof scoreByTrait> & { detailScores: Record<string, number> };
  }

  const normalizedScore = Math.round((totalScore / totalMax) * 100);
  return { score: totalScore, maxScore: totalMax, normalizedScore, detailScores };
}

export function scoreAssessment(
  assessmentId: string,
  answers: Record<number, number>,
  questions: AssessmentQuestion[]
) {
  if (assessmentId === "iq-assessment") {
    return scoreMultipleChoice(answers, questions);
  }
  if (assessmentId === "big-five") {
    return scoreBigFive(answers, questions);
  }
  if (assessmentId === "attention-health") {
    return scoreByTrait(answers, questions, ["focus", "distraction", "overload", "multitasking"]);
  }
  const base = calculateAssessmentScore(answers, questions);
  return { ...base, detailScores: {} as Record<string, number> };
}
