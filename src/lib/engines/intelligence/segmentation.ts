import type { UserFeatureVector } from "./features";

export type UserSegment =
  | "purpose_seekers"
  | "growth_explorers"
  | "burnout_risk"
  | "high_potential";

const SEGMENT_LABELS: Record<UserSegment, string> = {
  purpose_seekers: "Purpose Seekers",
  growth_explorers: "Growth Explorers",
  burnout_risk: "Burnout Risk Users",
  high_potential: "High Potential Users",
};

/** K-Means-inspired rule classifier — replace with sklearn KMeans in ML service */
export function segmentUser(features: UserFeatureVector, burnoutLevel: string): {
  segment: UserSegment;
  label: string;
  explanation: string;
} {
  if (burnoutLevel === "high" || features.moodStressRatio > 0.55) {
    return {
      segment: "burnout_risk",
      label: SEGMENT_LABELS.burnout_risk,
      explanation: "Stress patterns and mood data suggest prioritizing recovery interventions.",
    };
  }

  if (
    features.flourishingOverall >= 70 &&
    features.avgAssessmentScore >= 65 &&
    features.challengeCompletionRate >= 0.4
  ) {
    return {
      segment: "high_potential",
      label: SEGMENT_LABELS.high_potential,
      explanation: "Strong scores and engagement — ideal for stretch goals and leadership challenges.",
    };
  }

  if (features.purposeScore < 55 || features.assessmentCount < 2) {
    return {
      segment: "purpose_seekers",
      label: SEGMENT_LABELS.purpose_seekers,
      explanation: "Purpose and meaning dimensions benefit from reflection and values work.",
    };
  }

  return {
    segment: "growth_explorers",
    label: SEGMENT_LABELS.growth_explorers,
    explanation: "Active growth trajectory — diversify assessments and community engagement.",
  };
}
