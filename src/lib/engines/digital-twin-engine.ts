import type {
  AssessmentResult,
  DigitalTwinProfile,
  FlourishingScores,
  HumanBlueprint,
  MoodLog,
} from "@/types";

export function buildDigitalTwin(
  blueprint: HumanBlueprint,
  scores: FlourishingScores,
  results: AssessmentResult[],
  moods: MoodLog[]
): DigitalTwinProfile {
  const bigFive = results.find((r) => r.assessment_id === "big-five")?.detail_scores ?? {};
  const purpose = results.find((r) => r.assessment_id === "purpose-meaning")?.normalized_score ?? 50;

  const calmMoods = moods.filter((m) => m.mood === "calm" || m.mood === "happy").length;
  const stressMoods = moods.filter((m) => m.mood === "stressed" || m.mood === "sad").length;

  const emotionalPatterns: string[] = [];
  if (calmMoods > stressMoods) emotionalPatterns.push("Tends toward emotional stability when tracking mood");
  if (stressMoods > calmMoods) emotionalPatterns.push("Periods of stress — benefits from regulation practices");
  if (scores.emotionalHealth > 65) emotionalPatterns.push("Strong emotional awareness");
  if (bigFive.neuroticism !== undefined && bigFive.neuroticism < 45) {
    emotionalPatterns.push("Higher emotional reactivity under pressure");
  }

  const coreValues: string[] = [];
  if (purpose > 65) coreValues.push("Meaning", "Contribution");
  if (scores.socialConnection > 60) coreValues.push("Connection", "Belonging");
  if (bigFive.openness && bigFive.openness > 65) coreValues.push("Growth", "Curiosity");
  if (scores.digitalWellness > 60) coreValues.push("Balance", "Presence");
  if (coreValues.length === 0) coreValues.push("Self-discovery", "Wellbeing");

  const growthPriorities = [...blueprint.growthAreas];
  const bestSelfPrinciples = [
    "Pause before reacting — choose response over impulse",
    "Invest in one meaningful relationship each week",
    "Protect deep work and recovery time daily",
    ...blueprint.strengths.slice(0, 2).map((s) => `Leverage your strength in ${s.toLowerCase()}`),
  ];

  return {
    personalitySummary: `${blueprint.archetype}: ${blueprint.tagline}. Flourishing at ${scores.overall}/100 with notable ${blueprint.strengths[0]?.toLowerCase() ?? "potential"}.`,
    coreValues: coreValues.slice(0, 5),
    emotionalPatterns: emotionalPatterns.length ? emotionalPatterns : ["Building emotional awareness through tracking"],
    growthPriorities: growthPriorities.slice(0, 4),
    bestSelfPrinciples: bestSelfPrinciples.slice(0, 5),
  };
}

export function answerBestSelfQuestion(
  question: string,
  twin: DigitalTwinProfile,
  blueprint: HumanBlueprint
): string {
  const q = question.toLowerCase();
  if (q.includes("stress") || q.includes("anxious")) {
    return `Your best self would pause, name the feeling, and choose one small grounding action aligned with your value of ${twin.coreValues[0]}. Given your pattern of ${twin.emotionalPatterns[0]?.toLowerCase() ?? "growth"}, a 5-minute breath practice before responding would serve you well.`;
  }
  if (q.includes("relationship") || q.includes("friend")) {
    return `Your best self — the ${blueprint.archetype} — would reach out with genuine curiosity, not performance. Lead with vulnerability about one real thing on your mind. Your strength in ${blueprint.strengths[0]?.toLowerCase() ?? "empathy"} is your bridge.`;
  }
  if (q.includes("phone") || q.includes("digital") || q.includes("scroll")) {
    return `Your best self recognizes ${blueprint.riskFactors[0] ?? "digital distraction"} as a risk. Set a 10-minute walk before opening apps. Your future flourishing self protects attention as sacred.`;
  }
  return `Your best self, guided by ${twin.bestSelfPrinciples[0]?.toLowerCase()}, would take one aligned action today toward ${twin.growthPriorities[0]?.toLowerCase() ?? "growth"}. Remember: ${blueprint.tagline}.`;
}
