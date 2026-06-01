import type { ConsistencyPair } from "@/lib/assessments/question-banks/types";
import type { BankQuestion } from "@/lib/assessments/question-banks/types";

export type ConsistencyLevel = "high" | "medium" | "low";

export function computeConsistencyScore(
  answers: Record<number, number>,
  pairs: ConsistencyPair[],
  questions: BankQuestion[]
): { score: number; level: ConsistencyLevel } {
  if (pairs.length === 0) return { score: 0.75, level: "medium" };

  const qMap = new Map(questions.map((q) => [q.id, q]));
  let aligned = 0;
  let checked = 0;

  for (const pair of pairs) {
    const a = answers[pair.idA];
    const b = answers[pair.idB];
    if (a === undefined || b === undefined) continue;

    checked++;
    const qa = qMap.get(pair.idA);
    const qb = qMap.get(pair.idB);
    const normA = qa?.reverseScored ? 6 - a : a;
    const normB = qb?.reverseScored ? 6 - b : b;
    const diff = Math.abs(normA - normB);

    if (pair.polarity === "positive" && diff <= 1.5) aligned++;
    if (pair.polarity === "negative" && diff >= 2) aligned++;
  }

  if (checked === 0) return { score: 0.7, level: "medium" };

  const score = aligned / checked;
  const level: ConsistencyLevel =
    score >= 0.75 ? "high" : score >= 0.5 ? "medium" : "low";
  return { score, level };
}
