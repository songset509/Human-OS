import type { UserFeatureVector } from "@/lib/engines/intelligence/features";
import type { UserSegment } from "@/lib/engines/intelligence/segmentation";

export interface Recommendation {
  type: "challenge" | "habit" | "circle" | "mentor" | "reflection" | "assessment";
  id: string;
  title: string;
  reason: string;
  priority: number;
}

export function generateRecommendations(params: {
  segment: UserSegment;
  burnoutLevel: string;
  features: UserFeatureVector;
  flourishingOverall: number;
}): Recommendation[] {
  const recs: Recommendation[] = [];
  const { segment, burnoutLevel, features } = params;

  if (burnoutLevel === "high" || burnoutLevel === "medium") {
    recs.push({
      type: "habit",
      id: "recovery-breath",
      title: "5-minute daily recovery breath",
      reason: "Burnout signals suggest prioritizing nervous system regulation before productivity.",
      priority: 10,
    });
    recs.push({
      type: "mentor",
      id: "psychology",
      title: "Psychology Mentor",
      reason: "Stress patterns align with guided reflection on boundaries and recovery.",
      priority: 9,
    });
  }

  if (segment === "purpose_seekers") {
    recs.push({
      type: "assessment",
      id: "purpose-meaning",
      title: "Purpose & Meaning Assessment",
      reason: "Purpose scores are a growth lever — adaptive V2 assessment deepens clarity.",
      priority: 8,
    });
    recs.push({
      type: "reflection",
      id: "values-journal",
      title: "Values alignment reflection",
      reason: "Journaling on values improves purpose clarity (Human Flourishing Framework).",
      priority: 7,
    });
  }

  if (segment === "high_potential") {
    recs.push({
      type: "challenge",
      id: "deep-work-week",
      title: "Deep Work Week challenge",
      reason: "High engagement and scores — stretch with focused productivity habits.",
      priority: 8,
    });
    recs.push({
      type: "mentor",
      id: "career",
      title: "Career Mentor",
      reason: "Capitalize on momentum with strategic career alignment.",
      priority: 6,
    });
  }

  if (features.lonelinessScore < 50) {
    recs.push({
      type: "circle",
      id: "connection-circle",
      title: "Connection Growth Circle",
      reason: "Social connection dimension benefits from community accountability.",
      priority: 7,
    });
  }

  if (features.assessmentCount < 3) {
    recs.push({
      type: "assessment",
      id: "resilience",
      title: "Resilience Assessment (Adaptive V2)",
      reason: "More assessment data improves confidence scores and AI personalization.",
      priority: 6,
    });
  }

  recs.push({
    type: "reflection",
    id: "weekly-review",
    title: "Weekly growth review",
    reason: "Combining mood + behavioral data improves recommendation accuracy over time.",
    priority: 5,
  });

  return recs.sort((a, b) => b.priority - a.priority).slice(0, 8);
}
