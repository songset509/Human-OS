import type { AssessmentResult, HPIDimensions, HPIScore, MoodLog } from "@/types";
import { calculateFlourishingScores } from "@/lib/flourishing-engine";

function latestScore(results: AssessmentResult[], id: string, fallback = 50): number {
  const r = results.find((res) => res.assessment_id === id);
  return r?.normalized_score ?? fallback;
}

function latestDetail(results: AssessmentResult[], id: string, key: string, fallback = 50): number {
  const r = results.find((res) => res.assessment_id === id);
  return r?.detail_scores?.[key] ?? r?.normalized_score ?? fallback;
}

export function calculateHPI(
  results: AssessmentResult[],
  moods: MoodLog[] = []
): HPIScore {
  const flourishing = calculateFlourishingScores(results, moods);

  const dimensions: HPIDimensions = {
    iq: latestDetail(results, "iq-assessment", "iqMid", 75),
    eq: latestScore(results, "emotional-intelligence", flourishing.emotionalHealth),
    resilience: latestScore(results, "resilience", flourishing.resilience),
    purpose: latestScore(results, "purpose-meaning", 50),
    relationships: latestScore(results, "relationship-intelligence", flourishing.socialConnection),
    attention: latestScore(results, "attention-health", 50),
    digitalWellness: latestScore(results, "digital-wellness", flourishing.digitalWellness),
    selfEsteem: latestScore(results, "self-esteem", flourishing.selfEsteem),
  };

  const weights = {
    iq: 0.12,
    eq: 0.15,
    resilience: 0.13,
    purpose: 0.14,
    relationships: 0.14,
    attention: 0.12,
    digitalWellness: 0.1,
    selfEsteem: 0.1,
  };

  const overall = Math.round(
    dimensions.iq * weights.iq +
      dimensions.eq * weights.eq +
      dimensions.resilience * weights.resilience +
      dimensions.purpose * weights.purpose +
      dimensions.relationships * weights.relationships +
      dimensions.attention * weights.attention +
      dimensions.digitalWellness * weights.digitalWellness +
      dimensions.selfEsteem * weights.selfEsteem
  );

  let label = "Developing Potential";
  if (overall >= 85) label = "Exceptional Potential";
  else if (overall >= 70) label = "High Potential";
  else if (overall >= 55) label = "Growing Potential";

  return { overall, dimensions, label };
}

export function hpiToRadarData(hpi: HPIScore) {
  return [
    { dimension: "IQ", score: hpi.dimensions.iq },
    { dimension: "EQ", score: hpi.dimensions.eq },
    { dimension: "Resilience", score: hpi.dimensions.resilience },
    { dimension: "Purpose", score: hpi.dimensions.purpose },
    { dimension: "Relationships", score: hpi.dimensions.relationships },
    { dimension: "Attention", score: hpi.dimensions.attention },
    { dimension: "Digital", score: hpi.dimensions.digitalWellness },
    { dimension: "Self-Esteem", score: hpi.dimensions.selfEsteem },
  ];
}
