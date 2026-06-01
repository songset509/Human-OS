import type { AssessmentResult, MoodLog, ChallengeProgress } from "@/types";

export interface UserFeatureVector {
  flourishingOverall: number;
  moodStressRatio: number;
  moodTrend: number;
  assessmentCount: number;
  avgAssessmentScore: number;
  challengeCompletionRate: number;
  loginConsistency: number;
  journalStressScore: number;
  purposeScore: number;
  resilienceScore: number;
  lonelinessScore: number;
}

const MOOD_VALENCE: Record<string, number> = {
  happy: 1,
  calm: 0.7,
  neutral: 0.5,
  stressed: 0.2,
  sad: 0.1,
};

export function buildFeatureVector(params: {
  flourishingOverall: number;
  results: AssessmentResult[];
  moods: MoodLog[];
  challenges: ChallengeProgress[];
  behavioralLoginDays: number;
  journalSentiment?: { stress: number; optimism: number };
}): UserFeatureVector {
  const moods = params.moods.slice(0, 30);
  const stressCount = moods.filter((m) => m.mood === "stressed" || m.mood === "sad").length;
  const moodStressRatio = moods.length ? stressCount / moods.length : 0.5;

  let moodTrend = 0;
  if (moods.length >= 4) {
    const recent = moods.slice(0, Math.floor(moods.length / 2));
    const older = moods.slice(Math.floor(moods.length / 2));
    const avg = (list: MoodLog[]) =>
      list.reduce((s, m) => s + (MOOD_VALENCE[m.mood] ?? 0.5), 0) / (list.length || 1);
    moodTrend = avg(recent) - avg(older);
  }

  const scores = params.results.map((r) => Number(r.normalized_score));
  const avgAssessmentScore =
    scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 50;

  const latest = (id: string) =>
    params.results.find((r) => r.assessment_id === id)?.normalized_score ?? 50;

  const active = params.challenges.filter((c) => c.is_active);
  const completed = params.challenges.filter((c) => c.completed_at);
  const challengeCompletionRate =
    params.challenges.length > 0
      ? completed.length / params.challenges.length
      : active.length > 0
        ? 0.3
        : 0;

  return {
    flourishingOverall: params.flourishingOverall,
    moodStressRatio,
    moodTrend,
    assessmentCount: params.results.length,
    avgAssessmentScore,
    challengeCompletionRate,
    loginConsistency: Math.min(1, params.behavioralLoginDays / 14),
    journalStressScore: params.journalSentiment?.stress ?? 0.5,
    purposeScore: latest("purpose-meaning"),
    resilienceScore: latest("resilience"),
    lonelinessScore: latest("loneliness"),
  };
}
