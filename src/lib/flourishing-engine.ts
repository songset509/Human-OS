import type {
  AssessmentResult,
  FlourishingInsight,
  FlourishingScores,
  MoodLog,
  MoodType,
} from "@/types";

const MOOD_SCORES: Record<MoodType, number> = {
  happy: 100,
  calm: 85,
  neutral: 60,
  stressed: 35,
  sad: 20,
};

const CATEGORY_WEIGHTS = {
  emotionalHealth: 0.2,
  selfEsteem: 0.15,
  resilience: 0.15,
  mindfulness: 0.15,
  socialConnection: 0.2,
  digitalWellness: 0.15,
};

const ASSESSMENT_CATEGORY_MAP: Record<string, keyof Omit<FlourishingScores, "overall" | "mindfulness">> = {
  "emotional-intelligence": "emotionalHealth",
  "self-esteem": "selfEsteem",
  loneliness: "socialConnection",
  resilience: "resilience",
  "digital-wellness": "digitalWellness",
};

function getLatestResultsByAssessment(
  results: AssessmentResult[]
): Record<string, AssessmentResult> {
  const latest: Record<string, AssessmentResult> = {};
  for (const result of results) {
    const existing = latest[result.assessment_id];
    if (!existing || new Date(result.created_at) > new Date(existing.created_at)) {
      latest[result.assessment_id] = result;
    }
  }
  return latest;
}

function computeMindfulnessFromMoods(moods: MoodLog[]): number | null {
  if (moods.length === 0) return null;
  const recent = moods.slice(0, 14);
  const calmHappy = recent.filter((m) => m.mood === "calm" || m.mood === "happy").length;
  const moodAvg =
    recent.reduce((sum, m) => sum + MOOD_SCORES[m.mood], 0) / recent.length;
  const presenceBonus = (calmHappy / recent.length) * 20;
  return Math.min(100, moodAvg * 0.7 + presenceBonus);
}

export function calculateFlourishingScores(
  results: AssessmentResult[],
  moods: MoodLog[] = []
): FlourishingScores {
  const latest = getLatestResultsByAssessment(results);

  const scores: FlourishingScores = {
    overall: 0,
    emotionalHealth: 50,
    selfEsteem: 50,
    resilience: 50,
    mindfulness: 50,
    socialConnection: 50,
    digitalWellness: 50,
  };

  for (const [assessmentId, result] of Object.entries(latest)) {
    const category = ASSESSMENT_CATEGORY_MAP[assessmentId];
    if (category) {
      scores[category] = result.normalized_score;
    }
  }

  const mindfulnessFromMood = computeMindfulnessFromMoods(moods);
  if (mindfulnessFromMood !== null) {
    scores.mindfulness = mindfulnessFromMood;
  } else if (latest["emotional-intelligence"] && latest["resilience"]) {
    scores.mindfulness =
      (scores.emotionalHealth * 0.5 + scores.resilience * 0.5);
  }

  scores.overall = Math.round(
    scores.emotionalHealth * CATEGORY_WEIGHTS.emotionalHealth +
      scores.selfEsteem * CATEGORY_WEIGHTS.selfEsteem +
      scores.resilience * CATEGORY_WEIGHTS.resilience +
      scores.mindfulness * CATEGORY_WEIGHTS.mindfulness +
      scores.socialConnection * CATEGORY_WEIGHTS.socialConnection +
      scores.digitalWellness * CATEGORY_WEIGHTS.digitalWellness
  );

  return scores;
}

export function generateInsights(scores: FlourishingScores): FlourishingInsight {
  const dimensions = [
    { key: "emotionalHealth", label: "Emotional Health", score: scores.emotionalHealth },
    { key: "selfEsteem", label: "Self-Esteem", score: scores.selfEsteem },
    { key: "resilience", label: "Resilience", score: scores.resilience },
    { key: "mindfulness", label: "Mindfulness", score: scores.mindfulness },
    { key: "socialConnection", label: "Social Connection", score: scores.socialConnection },
    { key: "digitalWellness", label: "Digital Wellness", score: scores.digitalWellness },
  ];

  const sorted = [...dimensions].sort((a, b) => b.score - a.score);
  const strengths = sorted
    .filter((d) => d.score >= 70)
    .slice(0, 3)
    .map((d) => `Your ${d.label.toLowerCase()} is a notable strength (${Math.round(d.score)}/100).`);

  const growthAreas = sorted
    .filter((d) => d.score < 60)
    .slice(-3)
    .reverse()
    .map((d) => `${d.label} could use attention (${Math.round(d.score)}/100).`);

  const recommendations: string[] = [];
  const nextActions: string[] = [];

  if (scores.socialConnection < 60) {
    recommendations.push(
      "Strengthen social bonds through regular, meaningful interactions."
    );
    nextActions.push("Complete the Call a Friend Challenge this week.");
  }
  if (scores.digitalWellness < 60) {
    recommendations.push(
      "Create healthier boundaries with technology to improve focus and sleep."
    );
    nextActions.push("Start the Digital Detox Challenge for 7 days.");
  }
  if (scores.mindfulness < 60) {
    recommendations.push(
      "Daily mindfulness practice can reduce stress and increase self-awareness."
    );
    nextActions.push("Try the Mindfulness Challenge — 10 minutes daily.");
  }
  if (scores.selfEsteem < 60) {
    recommendations.push(
      "Practice self-compassion and celebrate small wins to build confidence."
    );
    nextActions.push("Retake the Self-Esteem Test after two weeks of growth work.");
  }
  if (scores.resilience < 60) {
    recommendations.push(
      "Build resilience through reflection on past challenges you've overcome."
    );
    nextActions.push("Journal about a difficult experience and what you learned.");
  }
  if (scores.emotionalHealth < 60) {
    recommendations.push(
      "Develop emotional awareness by naming feelings as they arise."
    );
    nextActions.push("Use the AI Life Coach to explore your emotional patterns.");
  }

  if (strengths.length === 0) {
    strengths.push("You're building a foundation — every step of self-awareness counts.");
  }
  if (growthAreas.length === 0) {
    growthAreas.push("Continue maintaining balance across all dimensions.");
  }
  if (recommendations.length === 0) {
    recommendations.push("You're doing well across dimensions. Keep nurturing your growth.");
    nextActions.push("Explore a new Growth Challenge to deepen your practice.");
  }

  const highResilience = scores.resilience >= 70;
  const lowSocial = scores.socialConnection < 55;
  if (highResilience && lowSocial) {
    recommendations.unshift(
      "Your resilience is high, but your social connection score is below average. Consider channeling your strength into building deeper relationships."
    );
  }

  return {
    strengths: strengths.slice(0, 3),
    growthAreas: growthAreas.slice(0, 3),
    recommendations: recommendations.slice(0, 4),
    nextActions: nextActions.slice(0, 4),
  };
}

export function calculateAssessmentScore(
  answers: Record<number, number>,
  questions: { id: number; reverseScored?: boolean }[]
): { score: number; maxScore: number; normalizedScore: number } {
  let score = 0;
  const maxScore = questions.length * 5;

  for (const q of questions) {
    const answer = answers[q.id] ?? 3;
    score += q.reverseScored ? 6 - answer : answer;
  }

  const normalizedScore = Math.round((score / maxScore) * 100);
  return { score, maxScore, normalizedScore };
}
