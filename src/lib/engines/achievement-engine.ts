import type { Achievement, AssessmentResult, ChallengeProgress, MoodLog } from "@/types";

export const ACHIEVEMENT_DEFINITIONS = [
  {
    id: "self-awareness-explorer",
    title: "Self-Awareness Explorer",
    description: "Complete 3 core assessments",
    icon: "eye",
    check: (r: AssessmentResult[]) => r.length >= 3,
  },
  {
    id: "resilience-builder",
    title: "Resilience Builder",
    description: "Score 70+ on Resilience Assessment",
    icon: "shield",
    check: (r: AssessmentResult[]) =>
      r.some((x) => x.assessment_id === "resilience" && x.normalized_score >= 70),
  },
  {
    id: "mindfulness-master",
    title: "Mindfulness Master",
    description: "Log mood for 7 consecutive days",
    icon: "brain",
    check: (_r: AssessmentResult[], moods: MoodLog[]) => moods.length >= 7,
  },
  {
    id: "relationship-architect",
    title: "Relationship Architect",
    description: "Complete Relationship Intelligence Assessment",
    icon: "heart-handshake",
    check: (r: AssessmentResult[]) =>
      r.some((x) => x.assessment_id === "relationship-intelligence"),
  },
  {
    id: "flourishing-champion",
    title: "Human Flourishing Champion",
    description: "Complete all core + 3 advanced assessments",
    icon: "trophy",
    check: (r: AssessmentResult[]) => {
      const core = ["emotional-intelligence", "self-esteem", "loneliness", "resilience", "digital-wellness"];
      const advanced = ["big-five", "purpose-meaning", "attention-health"];
      const ids = new Set(r.map((x) => x.assessment_id));
      return core.every((c) => ids.has(c)) && advanced.filter((a) => ids.has(a)).length >= 3;
    },
  },
  {
    id: "challenge-warrior",
    title: "Challenge Warrior",
    description: "Complete any growth challenge",
    icon: "flame",
    check: (_r: AssessmentResult[], _m: MoodLog[], challenges: ChallengeProgress[]) =>
      challenges.some((c) => !c.is_active && (c.completed_days?.length ?? 0) >= 7),
  },
  {
    id: "cognitive-explorer",
    title: "Cognitive Explorer",
    description: "Complete IQ and Big Five assessments",
    icon: "zap",
    check: (r: AssessmentResult[]) => {
      const ids = new Set(r.map((x) => x.assessment_id));
      return ids.has("iq-assessment") && ids.has("big-five");
    },
  },
  {
    id: "purpose-seeker",
    title: "Purpose Seeker",
    description: "Complete Purpose & Meaning Assessment",
    icon: "compass",
    check: (r: AssessmentResult[]) => r.some((x) => x.assessment_id === "purpose-meaning"),
  },
];

export function computeAchievements(
  results: AssessmentResult[],
  moods: MoodLog[],
  challenges: ChallengeProgress[],
  unlockedIds: string[] = []
): Achievement[] {
  return ACHIEVEMENT_DEFINITIONS.map((def) => {
    const unlocked = unlockedIds.includes(def.id) || def.check(results, moods, challenges);
    let progress = 0;
    if (def.id === "self-awareness-explorer") progress = Math.min(100, (results.length / 3) * 100);
    else if (def.id === "mindfulness-master") progress = Math.min(100, (moods.length / 7) * 100);
    else progress = unlocked ? 100 : 0;

    return {
      id: def.id,
      title: def.title,
      description: def.description,
      icon: def.icon,
      unlocked,
      unlockedAt: unlockedIds.includes(def.id) ? new Date().toISOString() : undefined,
      progress: Math.round(progress),
      requirement: def.description,
    };
  });
}

export function getNewlyUnlocked(
  results: AssessmentResult[],
  moods: MoodLog[],
  challenges: ChallengeProgress[],
  previouslyUnlocked: string[]
): string[] {
  const current = computeAchievements(results, moods, challenges, previouslyUnlocked);
  return current.filter((a) => a.unlocked && !previouslyUnlocked.includes(a.id)).map((a) => a.id);
}
