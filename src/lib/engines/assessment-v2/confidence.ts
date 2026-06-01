import type { ConsistencyLevel } from "./consistency";

export type ConfidenceLevel = "high" | "medium" | "low";

export interface ConfidenceResult {
  level: ConfidenceLevel;
  reason: string;
}

export function computeResultConfidence(params: {
  consistencyLevel: ConsistencyLevel;
  questionsAnswered: number;
  priorResultsCount: number;
  moodLogCount: number;
  behavioralEventCount: number;
}): ConfidenceResult {
  const {
    consistencyLevel,
    questionsAnswered,
    priorResultsCount,
    moodLogCount,
    behavioralEventCount,
  } = params;

  let points = 0;
  const reasons: string[] = [];

  if (consistencyLevel === "high") {
    points += 3;
    reasons.push("high response consistency");
  } else if (consistencyLevel === "medium") {
    points += 2;
    reasons.push("moderate response consistency");
  } else {
    points += 0;
    reasons.push("some contradictory responses detected");
  }

  if (questionsAnswered >= 15) {
    points += 2;
    reasons.push(`${questionsAnswered} questions in this session`);
  } else if (questionsAnswered >= 8) {
    points += 1;
    reasons.push(`${questionsAnswered} questions completed`);
  } else {
    reasons.push("limited questions in this session");
  }

  if (priorResultsCount >= 3) {
    points += 2;
    reasons.push("multiple prior assessments");
  }
  if (moodLogCount >= 7) {
    points += 1;
    reasons.push("mood tracking history");
  }
  if (behavioralEventCount >= 5) {
    points += 1;
    reasons.push("behavioral activity data");
  }

  const level: ConfidenceLevel =
    points >= 7 ? "high" : points >= 4 ? "medium" : "low";

  const reason = `Based on ${reasons.join(", ")}.`;

  return { level, reason };
}

export function computeTwinConfidence(params: {
  assessmentCount: number;
  moodCount: number;
  journalCount: number;
  lifeEventCount: number;
  challengeActive: number;
}): ConfidenceResult {
  const dataPoints =
    (params.assessmentCount >= 3 ? 2 : params.assessmentCount >= 1 ? 1 : 0) +
    (params.moodCount >= 14 ? 2 : params.moodCount >= 5 ? 1 : 0) +
    (params.journalCount >= 3 ? 2 : params.journalCount >= 1 ? 1 : 0) +
    (params.lifeEventCount >= 1 ? 1 : 0) +
    (params.challengeActive >= 1 ? 1 : 0);

  if (dataPoints >= 6) {
    return {
      level: "high",
      reason: "Rich cross-domain data: assessments, mood, journals, and activity.",
    };
  }
  if (dataPoints >= 3) {
    return {
      level: "medium",
      reason: "Moderate data available — twin insights will improve with more tracking.",
    };
  }
  return {
    level: "low",
    reason: "Insufficient data — complete assessments and log mood for reliable twin guidance.",
  };
}

export function computeFutureSelfConfidence(params: {
  moodWeeks: number;
  assessmentCount: number;
  behavioralWeeks: number;
}): ConfidenceResult {
  if (params.moodWeeks >= 4 && params.assessmentCount >= 2) {
    return {
      level: "high",
      reason: "Sufficient longitudinal mood and assessment data for projections.",
    };
  }
  if (params.assessmentCount >= 1) {
    return {
      level: "medium",
      reason: "Limited long-term behavioral data — predictions are directional estimates.",
    };
  }
  return {
    level: "low",
    reason: "Limited long-term behavioral data — complete assessments and mood tracking first.",
  };
}
