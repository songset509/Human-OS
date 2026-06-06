import type { AssessmentResult, MoodLog, ResearchStats } from "@/types";
import { calculateFlourishingScores } from "@/lib/flourishing-engine";
import { calculateHPI } from "@/lib/engines/hpi-engine";
import { format } from "date-fns";

const EMPTY_STATS: ResearchStats = {
  hasData: false,
  avgFlourishing: 0,
  avgDigitalWellness: 0,
  avgRelationship: 0,
  avgPurpose: 0,
  avgHPI: 0,
  sampleSize: 0,
  trends: [],
};

/** Demo only: aggregate across in-memory demo users. */
export function computeResearchStats(allUserResults: AssessmentResult[][]): ResearchStats {
  const flat = allUserResults.flat();
  if (flat.length === 0) return EMPTY_STATS;

  const userScores = allUserResults.map((results) => {
    const f = calculateFlourishingScores(results);
    const h = calculateHPI(results);
    return { f, h, results };
  });

  const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

  return {
    hasData: true,
    avgFlourishing: Math.round(avg(userScores.map((u) => u.f.overall))),
    avgDigitalWellness: Math.round(avg(userScores.map((u) => u.f.digitalWellness))),
    avgRelationship: Math.round(
      avg(
        userScores.map((u) => {
          const r = u.results.find((x) => x.assessment_id === "relationship-intelligence");
          return r?.normalized_score ?? u.f.socialConnection;
        })
      )
    ),
    avgPurpose: Math.round(
      avg(
        userScores.map((u) => {
          const r = u.results.find((x) => x.assessment_id === "purpose-meaning");
          return r?.normalized_score ?? 50;
        })
      )
    ),
    avgHPI: Math.round(avg(userScores.map((u) => u.h.overall))),
    sampleSize: userScores.length,
    trends: buildTrendSeries(
      userScores.map((u) => ({
        date: new Date().toISOString(),
        flourishing: u.f.overall,
        hpi: u.h.overall,
      }))
    ),
  };
}

/** Production: user-specific research from their assessments and HPI history. */
export function computePersonalResearchStats(
  results: AssessmentResult[],
  hpiSnapshots: { score: number; recorded_at: string }[],
  moods: MoodLog[] = []
): ResearchStats {
  if (results.length === 0 && hpiSnapshots.length === 0) return EMPTY_STATS;

  const flourishing = calculateFlourishingScores(results, moods);
  const hpi = calculateHPI(results, moods);

  const relationship = results.find((x) => x.assessment_id === "relationship-intelligence");
  const purpose = results.find((x) => x.assessment_id === "purpose-meaning");

  const trends =
    hpiSnapshots.length > 0
      ? buildTrendSeries(
          [...hpiSnapshots]
            .sort(
              (a, b) =>
                new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
            )
            .map((s) => ({
              date: s.recorded_at,
              flourishing: flourishing.overall,
              hpi: s.score,
            }))
        )
      : buildTrendSeries([
          {
            date: new Date().toISOString(),
            flourishing: flourishing.overall,
            hpi: hpi.overall,
          },
        ]);

  return {
    hasData: true,
    avgFlourishing: flourishing.overall,
    avgDigitalWellness: flourishing.digitalWellness,
    avgRelationship: relationship?.normalized_score ?? flourishing.socialConnection,
    avgPurpose: purpose?.normalized_score ?? 50,
    avgHPI: hpi.overall,
    sampleSize: 1,
    trends,
  };
}

function buildTrendSeries(
  points: { date: string; flourishing: number; hpi: number }[]
): ResearchStats["trends"] {
  return points.slice(-6).map((p) => ({
    month: format(new Date(p.date), "MMM d"),
    flourishing: Math.round(p.flourishing),
    hpi: Math.round(p.hpi),
  }));
}
