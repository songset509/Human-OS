import type {
  AssessmentResult,
  FlourishingScores,
  FutureSelfInput,
  FutureSelfScenario,
  MoodLog,
} from "@/types";
import { calculateFlourishingScores } from "@/lib/flourishing-engine";
import { calculateHPI } from "@/lib/engines/hpi-engine";

function predict(
  base: FlourishingScores,
  hpiOverall: number,
  modifier: number,
  input: FutureSelfInput
): {
  flourishingScore: number;
  mentalWellbeing: number;
  relationships: number;
  productivity: number;
  purpose: number;
  narrative: string;
} {
  const flourishingScore = Math.min(100, Math.max(0, Math.round(base.overall + modifier)));
  const mentalWellbeing = Math.min(100, Math.round((base.emotionalHealth + base.mindfulness) / 2 + modifier * 0.8));
  const relationships = Math.min(100, Math.round(base.socialConnection + modifier * 0.7));
  const productivity = Math.min(100, Math.round(base.resilience * 0.4 + base.mindfulness * 0.3 + hpiOverall * 0.3 + modifier * 0.6));
  const purpose = Math.min(100, Math.round(50 + modifier * 0.9));

  const narrative =
    modifier >= 0
      ? `With improved habits around "${input.goals.slice(0, 60)}...", your wellbeing trajectory strengthens. Relationships deepen, focus improves, and sense of purpose expands over 6-12 months.`
      : `Continuing current patterns may plateau flourishing around ${flourishingScore}/100. Digital habits and stress may gradually affect relationships and purpose unless intentional change begins.`;

  return { flourishingScore, mentalWellbeing, relationships, productivity, purpose, narrative };
}

export function simulateFutureSelf(
  input: FutureSelfInput,
  results: AssessmentResult[],
  moods: MoodLog[]
): FutureSelfScenario {
  const flourishing = calculateFlourishingScores(results, moods);
  const hpi = calculateHPI(results, moods);

  const lifestylePenalty =
    input.lifestyle.toLowerCase().includes("sedentary") ||
    input.lifestyle.toLowerCase().includes("high screen")
      ? -8
      : 0;

  const scenarioA = predict(flourishing, hpi.overall, -5 + lifestylePenalty, input);
  scenarioA.narrative = `Scenario A — Continue Current Habits: ${scenarioA.narrative}`;

  const goalsBonus = input.goals.length > 20 ? 12 : 6;
  const habitsBonus = input.habits.toLowerCase().includes("exercise") ||
    input.habits.toLowerCase().includes("meditat") ? 8 : 4;

  const scenarioB = predict(flourishing, hpi.overall, goalsBonus + habitsBonus, input);
  scenarioB.narrative = `Scenario B — Improved Habits: ${scenarioB.narrative}`;

  return { scenarioA, scenarioB, timeframe: "6-12 months" };
}
