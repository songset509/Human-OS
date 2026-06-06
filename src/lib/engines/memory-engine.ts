import type { AssessmentResult } from "@/types";

export interface MemoryTrend {
  dimension: string;
  earlier: number;
  latest: number;
  delta: number;
  direction: "up" | "down" | "stable";
}

/** Detect score changes across assessment history for AI context. */
export function detectAssessmentTrends(results: AssessmentResult[]): MemoryTrend[] {
  const byAssessment = new Map<string, AssessmentResult[]>();
  for (const r of results) {
    const list = byAssessment.get(r.assessment_id) ?? [];
    list.push(r);
    byAssessment.set(r.assessment_id, list);
  }

  const trends: MemoryTrend[] = [];

  for (const [id, entries] of byAssessment) {
    if (entries.length < 2) continue;
    const sorted = [...entries].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    const earlier = sorted[0].normalized_score;
    const latest = sorted[sorted.length - 1].normalized_score;
    const delta = latest - earlier;
    trends.push({
      dimension: id.replace(/-/g, " "),
      earlier,
      latest,
      delta,
      direction: delta > 3 ? "up" : delta < -3 ? "down" : "stable",
    });
  }

  return trends.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)).slice(0, 5);
}

export function formatMemoryContext(
  memories: { memory_type: string; content: unknown }[],
  trends: MemoryTrend[]
): string {
  const parts: string[] = [];

  if (trends.length > 0) {
    const trendText = trends
      .map((t) => {
        const arrow = t.direction === "up" ? "↑" : t.direction === "down" ? "↓" : "→";
        return `${t.dimension}: ${t.earlier}→${t.latest} (${arrow}${Math.abs(t.delta)})`;
      })
      .join("; ");
    parts.push(`Growth trends: ${trendText}`);
  }

  if (memories.length > 0) {
    parts.push(
      `Recent memory: ${JSON.stringify(memories.slice(0, 5).map((m) => ({ type: m.memory_type, content: m.content })))}`
    );
  }

  return parts.join("\n");
}
