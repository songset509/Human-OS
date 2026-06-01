import type { UserFeatureVector } from "./features";

/** XGBoost-inspired gradient-free scorer — production can swap with Python XGBoost service */
export function predictBurnoutRisk(features: UserFeatureVector): {
  level: "low" | "medium" | "high";
  score: number;
  explanation: string;
} {
  let risk = 0;
  const factors: string[] = [];

  if (features.moodStressRatio > 0.5) {
    risk += 0.25;
    factors.push("elevated stress/sad mood frequency");
  }
  if (features.moodTrend < -0.1) {
    risk += 0.15;
    factors.push("declining mood trend");
  }
  if (features.resilienceScore < 45) {
    risk += 0.2;
    factors.push("lower resilience scores");
  }
  if (features.lonelinessScore < 40) {
    risk += 0.15;
    factors.push("loneliness indicators");
  }
  if (features.challengeCompletionRate < 0.2 && features.assessmentCount > 0) {
    risk += 0.1;
    factors.push("low challenge engagement");
  }
  if (features.journalStressScore > 0.6) {
    risk += 0.15;
    factors.push("journal stress signals");
  }
  if (features.loginConsistency < 0.2) {
    risk += 0.05;
    factors.push("inconsistent platform engagement");
  }

  risk = Math.min(1, risk);
  const level = risk >= 0.55 ? "high" : risk >= 0.3 ? "medium" : "low";
  const explanation =
    factors.length > 0
      ? `Burnout risk driven by: ${factors.join("; ")}.`
      : "Current signals suggest stable wellbeing patterns.";

  return { level, score: Math.round(risk * 100), explanation };
}
