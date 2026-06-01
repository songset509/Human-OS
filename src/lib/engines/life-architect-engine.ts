import type { AssessmentResult, FlourishingScores, GrowthPlanWeek, MoodLog } from "@/types";
import { generateInsights } from "@/lib/flourishing-engine";

export function generateWeeklyPlan(
  scores: FlourishingScores,
  results: AssessmentResult[],
  moods: MoodLog[]
): GrowthPlanWeek[] {
  const insight = generateInsights(scores);
  const completed = new Set(results.map((r) => r.assessment_id));

  const weeks: GrowthPlanWeek[] = [
    {
      week: 1,
      focus: "Digital Detox",
      actions: [
        "Set 2 device-free hours daily",
        "Complete Digital Wellness assessment if not done",
        "Log mood each evening",
      ],
    },
    {
      week: 2,
      focus: "Mindfulness",
      actions: [
        "10-minute morning meditation",
        "Start Mindfulness Challenge",
        "Review mood trends in HumanOS",
      ],
    },
    {
      week: 3,
      focus: "Relationship Building",
      actions: [
        "Call a Friend Challenge — daily reach-out",
        "Complete Relationship Intelligence assessment",
        "Practice one vulnerable conversation",
      ],
    },
    {
      week: 4,
      focus: "Purpose Discovery",
      actions: [
        "Complete Purpose & Meaning assessment",
        "Journal: What would a meaningful day look like?",
        "Review Human Blueprint growth path",
      ],
    },
  ];

  if (scores.digitalWellness >= 70) weeks[0].focus = "Deep Focus";
  if (scores.socialConnection < 55) weeks[2].actions.unshift("Priority: rebuild one key relationship");
  if (!completed.has("purpose-meaning")) weeks[3].actions.unshift("Take Purpose & Meaning assessment");
  if (moods.length < 3) weeks[0].actions.push("Begin daily mood tracking");

  if (insight.nextActions[0]) {
    weeks[1].actions.push(insight.nextActions[0]);
  }

  return weeks;
}

export function generateMonthlyRoadmap(scores: FlourishingScores): string[] {
  return [
    `Month 1 — Foundation: Complete core assessments. Target flourishing score: ${Math.min(100, scores.overall + 8)}.`,
    `Month 2 — Depth: Advanced Testing Hub (Big Five, Attention, Purpose). Build 14-day mood streak.`,
    `Month 3 — Integration: AI Life Architect weekly plans. Future Self simulation review.`,
    `Month 4 — Flourishing: Human Potential Index target ${Math.min(100, scores.overall + 15)}. Community engagement.`,
  ];
}

export function buildArchitectContext(
  scores: FlourishingScores,
  results: AssessmentResult[],
  moods: MoodLog[],
  challengeSummary: string
): string {
  const recentMood = moods[0]?.mood ?? "unknown";
  const assessmentCount = new Set(results.map((r) => r.assessment_id)).size;
  return `User context — Flourishing: ${scores.overall}/100, EQ: ${scores.emotionalHealth}, Resilience: ${scores.resilience}, Social: ${scores.socialConnection}, Digital: ${scores.digitalWellness}. Assessments completed: ${assessmentCount}. Recent mood: ${recentMood}. Challenges: ${challengeSummary}.`;
}
