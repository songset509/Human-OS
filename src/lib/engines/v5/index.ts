import type { AssessmentResult, MoodLog } from "@/types";
import { calculateFlourishingScores } from "@/lib/flourishing-engine";
import { calculateHPI } from "@/lib/engines/hpi-engine";
import { generateHumanBlueprint } from "@/lib/engines/blueprint-engine";

export const LIFE_OS_DIMENSIONS = [
  "health", "career", "relationships", "learning", "finance", "purpose", "emotional",
] as const;

export type LifeOsDimension = (typeof LIFE_OS_DIMENSIONS)[number];

export function computeLifeBalance(dimensions: Record<string, number>): number {
  const vals = LIFE_OS_DIMENSIONS.map((d) => dimensions[d] ?? 3);
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  return Math.round((avg / 5) * 100);
}

export function deriveLifeOsFromProfile(
  results: AssessmentResult[],
  moods: MoodLog[]
): { dimensions: Record<string, number>; balanceScore: number; recommendations: string[] } {
  const f = calculateFlourishingScores(results, moods);
  const hpi = calculateHPI(results, moods);

  const dimensions: Record<string, number> = {
    health: Math.round((f.mindfulness + f.digitalWellness) / 40 * 5) || 3,
    career: results.find((r) => r.assessment_id === "career-alignment")?.normalized_score
      ? Math.round((results.find((r) => r.assessment_id === "career-alignment")!.normalized_score / 100) * 5)
      : 3,
    relationships: Math.round((f.socialConnection / 100) * 5) || 3,
    learning: Math.round((hpi.dimensions.iq / 100) * 5) || 3,
    finance: 3,
    purpose: Math.round((hpi.dimensions.purpose / 100) * 5) || 3,
    emotional: Math.round((f.emotionalHealth / 100) * 5) || 3,
  };

  const balanceScore = computeLifeBalance(dimensions);
  const recommendations: string[] = [];
  const lowest = Object.entries(dimensions).sort((a, b) => a[1] - b[1])[0];
  if (lowest) recommendations.push(`Focus on ${lowest[0]} — your lowest life dimension this week.`);
  if (dimensions.emotional < 3) recommendations.push("Log mood daily and try the Mindfulness Challenge.");
  if (dimensions.relationships < 3) recommendations.push("Use Growth Circles and Call a Friend Challenge.");

  return { dimensions, balanceScore, recommendations };
}

export function computeBurnoutRisk(
  moods: MoodLog[],
  results: AssessmentResult[]
): { score: number; level: "low" | "medium" | "high"; factors: string[]; interventions: string[] } {
  const stressCount = moods.filter((m) => m.mood === "stressed" || m.mood === "sad").length;
  const stressRatio = moods.length ? stressCount / moods.length : 0;
  const attention = results.find((r) => r.assessment_id === "attention-health")?.normalized_score ?? 50;
  const resilience = results.find((r) => r.assessment_id === "resilience")?.normalized_score ?? 50;

  let score = Math.round(stressRatio * 50 + (100 - attention) * 0.25 + (100 - resilience) * 0.25);
  score = Math.min(100, Math.max(0, score));

  const level = score >= 65 ? "high" : score >= 40 ? "medium" : "low";
  const factors: string[] = [];
  if (stressRatio > 0.4) factors.push("Elevated stress/sad mood frequency");
  if (attention < 50) factors.push("Attention health below average");
  if (resilience < 50) factors.push("Resilience needs strengthening");

  const interventions: string[] = [
    "Take a 24-hour digital detox",
    "Schedule one restorative activity daily",
    "Talk to AI Coach about stress patterns",
  ];
  if (level === "high") interventions.unshift("Consider speaking with a mental health professional");

  return { score, level, factors, interventions };
}

export function computeHumanCapital(results: AssessmentResult[]): {
  score: number;
  dimensions: Record<string, number>;
} {
  const eq = results.find((r) => r.assessment_id === "emotional-intelligence")?.normalized_score ?? 50;
  const rel = results.find((r) => r.assessment_id === "relationship-intelligence")?.normalized_score ?? 50;
  const resilience = results.find((r) => r.assessment_id === "resilience")?.normalized_score ?? 50;
  const iq = results.find((r) => r.assessment_id === "iq-assessment")?.normalized_score ?? 50;
  const bigFive = results.find((r) => r.assessment_id === "big-five")?.detail_scores ?? {};

  const dimensions = {
    communication: rel,
    leadership: Math.round((eq * 0.5 + (bigFive.extraversion ?? 50) * 0.5)),
    adaptability: resilience,
    creativity: bigFive.openness ?? eq,
    learningAgility: iq,
    emotionalIntelligence: eq,
  };

  const score = Math.round(
    Object.values(dimensions).reduce((a, b) => a + b, 0) / Object.keys(dimensions).length
  );
  return { score, dimensions };
}

export function generateMission(
  results: AssessmentResult[],
  moods: MoodLog[]
): { missionStatement: string; lifeVision: string; longTermDirection: string } {
  const blueprint = generateHumanBlueprint(results, moods);
  const hpi = calculateHPI(results, moods);

  return {
    missionStatement: `To live as ${blueprint.archetype.replace("The ", "a ")}, cultivating ${blueprint.strengths[0]?.toLowerCase() ?? "growth"} while addressing ${blueprint.growthAreas[0]?.toLowerCase() ?? "balance"}.`,
    lifeVision: `A life of ${hpi.label.toLowerCase()} where purpose (${hpi.dimensions.purpose}/100), relationships (${hpi.dimensions.relationships}/100), and wellbeing align with my deepest values.`,
    longTermDirection: blueprint.growthPath[0] ?? "Continue building human flourishing across all dimensions.",
  };
}

export function generateFutureRoadmap(
  results: AssessmentResult[],
  moods: MoodLog[]
): { year1: string[]; year3: string[]; year5: string[] } {
  const f = calculateFlourishingScores(results, moods);
  const hpi = calculateHPI(results, moods);

  return {
    year1: [
      `Reach flourishing score ${Math.min(100, f.overall + 10)}`,
      "Complete all core + advanced assessments",
      "Establish daily mood + mindfulness habit",
      "Define personal mission statement",
    ],
    year3: [
      `HPI target: ${Math.min(100, hpi.overall + 20)}`,
      "Build 3+ deep relationships (Relationship Map)",
      "Career alignment score above 75",
      "Monthly life reports tracking progress",
    ],
    year5: [
      "Human Flourishing Champion achievement",
      "Sustained Life Balance Score above 80",
      "Mentor others in Growth Circles",
      "Living aligned with mission and values",
    ],
  };
}

export function detectAnalyticsInsights(
  moods: MoodLog[],
  results: AssessmentResult[]
): string[] {
  const insights: string[] = [];
  const happyDays = moods.filter((m) => m.mood === "happy" || m.mood === "calm").length;
  if (moods.length >= 7 && happyDays / moods.length > 0.6) {
    insights.push("Trend: Positive mood pattern detected over recent entries.");
  }
  if (results.length >= 3) {
    insights.push(`Correlation: ${results.length} assessments completed — richer profile improves AI accuracy.`);
  }
  const f = calculateFlourishingScores(results, moods);
  if (f.socialConnection < f.resilience) {
    insights.push("Pattern: High resilience but lower social connection — channel strength into relationships.");
  }
  return insights;
}
