import { describe, it, expect } from "vitest";
import { calculateFlourishingScores, generateInsights } from "@/lib/flourishing-engine";
import { calculateHPI } from "@/lib/engines/hpi-engine";
import { computeLifeBalance, computeBurnoutRisk } from "@/lib/engines/v5";
import { scoreAssessment } from "@/lib/engines/advanced-scoring";

describe("Flourishing Engine", () => {
  it("returns default scores with no data", () => {
    const scores = calculateFlourishingScores([], []);
    expect(scores.overall).toBeGreaterThan(0);
    expect(scores.emotionalHealth).toBe(50);
  });

  it("generates insights", () => {
    const scores = calculateFlourishingScores([], []);
    const insight = generateInsights(scores);
    expect(insight.strengths.length).toBeGreaterThan(0);
    expect(insight.recommendations.length).toBeGreaterThan(0);
  });
});

describe("HPI Engine", () => {
  it("calculates HPI with defaults", () => {
    const hpi = calculateHPI([], []);
    expect(hpi.overall).toBeGreaterThan(0);
    expect(hpi.label).toBeDefined();
  });
});

describe("V5 Engines", () => {
  it("computes life balance", () => {
    const score = computeLifeBalance({ health: 4, career: 3, relationships: 5, learning: 3, finance: 3, purpose: 4, emotional: 4 });
    expect(score).toBeGreaterThan(50);
  });

  it("computes burnout risk", () => {
    const result = computeBurnoutRisk([], []);
    expect(["low", "medium", "high"]).toContain(result.level);
  });
});

describe("Advanced Scoring", () => {
  it("scores likert assessment", () => {
    const questions = [{ id: 1, text: "test" }, { id: 2, text: "test2" }];
    const result = scoreAssessment("purpose-meaning", { 1: 4, 2: 5 }, questions);
    expect(result.normalizedScore).toBeGreaterThan(0);
  });
});
