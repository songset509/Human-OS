import { describe, it, expect } from "vitest";
import { computeConsistencyScore } from "./consistency";
import { computeResultConfidence } from "./confidence";
import { getQuestionPool } from "@/lib/assessments/question-banks";

describe("Assessment V2", () => {
  it("has 200+ questions per core assessment pool", () => {
    const pool = getQuestionPool("resilience");
    expect(pool.length).toBeGreaterThanOrEqual(200);
  });

  it("computes consistency from answer pairs", () => {
    const { level } = computeConsistencyScore(
      { 1: 5, 2: 5 },
      [{ idA: 1, idB: 2, polarity: "positive" }],
      [
        { id: 1, text: "a", category: "x", difficulty: 2, trait: "t", weight: 1, format: "likert" },
        { id: 2, text: "b", category: "x", difficulty: 2, trait: "t", weight: 1, format: "likert" },
      ]
    );
    expect(level).toBe("high");
  });

  it("returns confidence with reason", () => {
    const c = computeResultConfidence({
      consistencyLevel: "high",
      questionsAnswered: 10,
      priorResultsCount: 2,
      moodLogCount: 10,
      behavioralEventCount: 3,
    });
    expect(c.level).toBeDefined();
    expect(c.reason.length).toBeGreaterThan(10);
  });
});
