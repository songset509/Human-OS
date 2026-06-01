import type { AssessmentResult, ResearchStats } from "@/types";
import { calculateFlourishingScores } from "@/lib/flourishing-engine";
import { calculateHPI } from "@/lib/engines/hpi-engine";

/** Aggregate anonymized stats from all users (demo: global store stats) */
export function computeResearchStats(allUserResults: AssessmentResult[][]): ResearchStats {
  const flat = allUserResults.flat();
  if (flat.length === 0) {
    return {
      avgFlourishing: 58,
      avgDigitalWellness: 52,
      avgRelationship: 55,
      avgPurpose: 54,
      avgHPI: 56,
      sampleSize: 0,
      trends: [
        { month: "Jan", flourishing: 55, hpi: 53 },
        { month: "Feb", flourishing: 57, hpi: 55 },
        { month: "Mar", flourishing: 58, hpi: 56 },
        { month: "Apr", flourishing: 60, hpi: 58 },
        { month: "May", flourishing: 62, hpi: 60 },
        { month: "Jun", flourishing: 63, hpi: 61 },
      ],
    };
  }

  const userScores = allUserResults.map((results) => {
    const f = calculateFlourishingScores(results);
    const h = calculateHPI(results);
    return { f, h, results };
  });

  const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

  return {
    avgFlourishing: Math.round(avg(userScores.map((u) => u.f.overall))),
    avgDigitalWellness: Math.round(avg(userScores.map((u) => u.f.digitalWellness))),
    avgRelationship: Math.round(
      avg(userScores.map((u) => {
        const r = u.results.find((x) => x.assessment_id === "relationship-intelligence");
        return r?.normalized_score ?? u.f.socialConnection;
      }))
    ),
    avgPurpose: Math.round(
      avg(userScores.map((u) => {
        const r = u.results.find((x) => x.assessment_id === "purpose-meaning");
        return r?.normalized_score ?? 50;
      }))
    ),
    avgHPI: Math.round(avg(userScores.map((u) => u.h.overall))),
    sampleSize: userScores.length,
    trends: [
      { month: "Jan", flourishing: 58, hpi: 56 },
      { month: "Feb", flourishing: 60, hpi: 58 },
      { month: "Mar", flourishing: 62, hpi: 60 },
      { month: "Apr", flourishing: 64, hpi: 62 },
      { month: "May", flourishing: 66, hpi: 64 },
      { month: "Jun", flourishing: Math.round(avg(userScores.map((u) => u.f.overall))), hpi: Math.round(avg(userScores.map((u) => u.h.overall))) },
    ],
  };
}
