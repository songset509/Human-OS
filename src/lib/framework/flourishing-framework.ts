/**
 * HumanOS Human Flourishing Framework — canonical dimension map for all scoring systems.
 */
export const FLOURISHING_DIMENSIONS = [
  "emotional_health",
  "relationships",
  "purpose",
  "resilience",
  "attention",
  "digital_wellness",
  "human_capital",
  "life_satisfaction",
] as const;

export type FlourishingDimension = (typeof FLOURISHING_DIMENSIONS)[number];

export const ASSESSMENT_FRAMEWORK_MAP: Record<string, FlourishingDimension[]> = {
  "emotional-intelligence": ["emotional_health", "human_capital"],
  "self-esteem": ["emotional_health", "life_satisfaction"],
  loneliness: ["relationships", "emotional_health"],
  resilience: ["resilience", "emotional_health"],
  "digital-wellness": ["digital_wellness", "attention"],
  "big-five": ["emotional_health", "relationships", "human_capital"],
  "iq-assessment": ["human_capital", "attention"],
  "attention-health": ["attention", "digital_wellness"],
  "purpose-meaning": ["purpose", "life_satisfaction"],
  "career-alignment": ["purpose", "human_capital"],
  "relationship-intelligence": ["relationships", "emotional_health"],
};

export const DIMENSION_LABELS: Record<FlourishingDimension, string> = {
  emotional_health: "Emotional Health",
  relationships: "Relationships",
  purpose: "Purpose",
  resilience: "Resilience",
  attention: "Attention",
  digital_wellness: "Digital Wellness",
  human_capital: "Human Capital",
  life_satisfaction: "Life Satisfaction",
};

export function mapAssessmentToFramework(assessmentId: string): FlourishingDimension[] {
  return ASSESSMENT_FRAMEWORK_MAP[assessmentId] ?? ["life_satisfaction"];
}
