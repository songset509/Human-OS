import type {
  AssessmentResult,
  FlourishingScores,
  HumanBlueprint,
  MoodLog,
} from "@/types";
import { calculateFlourishingScores } from "@/lib/flourishing-engine";

const ARCHETYPES = [
  {
    name: "The Reflective Explorer",
    tagline: "Curious, empathetic, and driven by inner growth",
    match: (s: FlourishingScores, bigFive?: Record<string, number>) =>
      (bigFive?.openness ?? s.emotionalHealth) > 65 && s.mindfulness > 55,
  },
  {
    name: "The Resilient Builder",
    tagline: "Steady, determined, and growth-oriented through adversity",
    match: (s: FlourishingScores) => s.resilience > 70 && s.selfEsteem > 55,
  },
  {
    name: "The Connected Harmonizer",
    tagline: "Relationship-centered with strong emotional intelligence",
    match: (s: FlourishingScores) => s.socialConnection > 65 && s.emotionalHealth > 60,
  },
  {
    name: "The Mindful Creator",
    tagline: "Present, creative, and purpose-driven",
    match: (s: FlourishingScores, bigFive?: Record<string, number>) =>
      s.mindfulness > 65 && (bigFive?.openness ?? 50) > 60,
  },
  {
    name: "The Digital Navigator",
    tagline: "Tech-aware and working toward balanced digital life",
    match: (s: FlourishingScores) => s.digitalWellness < 55 && s.emotionalHealth > 50,
  },
  {
    name: "The Emerging Flourisher",
    tagline: "Building foundations across all dimensions of wellbeing",
    match: () => true,
  },
];

function getLatestDetail(
  results: AssessmentResult[],
  assessmentId: string
): Record<string, number> {
  const latest = results.find((r) => r.assessment_id === assessmentId);
  return latest?.detail_scores ?? {};
}

export function generateHumanBlueprint(
  results: AssessmentResult[],
  moods: MoodLog[] = []
): HumanBlueprint {
  const scores = calculateFlourishingScores(results, moods);
  const bigFive = getLatestDetail(results, "big-five");

  const archetype =
    ARCHETYPES.find((a) => a.match(scores, bigFive))?.name ?? "The Emerging Flourisher";
  const tagline =
    ARCHETYPES.find((a) => a.name === archetype)?.tagline ??
    "Building foundations across all dimensions of wellbeing";

  const strengths: string[] = [];
  const growthAreas: string[] = [];
  const riskFactors: string[] = [];
  const growthPath: string[] = [];

  const dims = [
    { label: "Emotional Intelligence", score: scores.emotionalHealth, strength: "Empathy", growth: "Emotional regulation" },
    { label: "Self-Esteem", score: scores.selfEsteem, strength: "Self-confidence", growth: "Self-compassion" },
    { label: "Resilience", score: scores.resilience, strength: "Adaptability", growth: "Stress recovery" },
    { label: "Social Connection", score: scores.socialConnection, strength: "Relationship capacity", growth: "Social confidence" },
    { label: "Mindfulness", score: scores.mindfulness, strength: "Present-moment awareness", growth: "Meditation practice" },
    { label: "Digital Wellness", score: scores.digitalWellness, strength: "Tech boundaries", growth: "Screen time reduction" },
  ];

  for (const d of dims.sort((a, b) => b.score - a.score)) {
    if (d.score >= 70) strengths.push(d.strength);
    if (d.score < 55) growthAreas.push(d.growth);
  }

  if (bigFive.openness && bigFive.openness > 70) strengths.push("Curiosity");
  if (bigFive.agreeableness && bigFive.agreeableness > 70) strengths.push("Empathy");
  if (bigFive.conscientiousness && bigFive.conscientiousness > 70) strengths.push("Discipline");

  if (scores.digitalWellness < 50) riskFactors.push("Doomscrolling");
  if (scores.socialConnection < 50) riskFactors.push("Social isolation");
  if (scores.selfEsteem < 50) riskFactors.push("Comparison behavior");
  if (scores.mindfulness < 45) riskFactors.push("Chronic distraction");
  if (bigFive.neuroticism && bigFive.neuroticism < 40) riskFactors.push("Emotional reactivity");

  if (growthAreas.includes("Social confidence")) {
    growthPath.push("Week 1-2: Call a Friend Challenge + relationship assessment retake");
  }
  if (growthAreas.includes("Screen time reduction") || scores.digitalWellness < 55) {
    growthPath.push("Week 2-3: Digital Detox Challenge + attention health assessment");
  }
  growthPath.push("Week 3-4: Mindfulness Challenge + Purpose & Meaning assessment");
  growthPath.push("Ongoing: Weekly AI Life Architect check-ins + mood tracking");

  if (strengths.length === 0) strengths.push("Self-awareness", "Growth mindset");
  if (growthAreas.length === 0) growthAreas.push("Continued balance across dimensions");
  if (riskFactors.length === 0) riskFactors.push("Maintain current healthy patterns");
  if (growthPath.length < 3) growthPath.push("Complete remaining assessments in Testing Hub");

  return {
    archetype,
    tagline,
    strengths: [...new Set(strengths)].slice(0, 5),
    growthAreas: [...new Set(growthAreas)].slice(0, 4),
    riskFactors: [...new Set(riskFactors)].slice(0, 4),
    growthPath: growthPath.slice(0, 5),
    generatedAt: new Date().toISOString(),
  };
}
