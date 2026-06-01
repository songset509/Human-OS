import { getQuestionsByAssessmentId } from "@/lib/assessments-data";
import type { AssessmentQuestion } from "@/types";
import { expandLikertPool, selectQuestions } from "./generator";
import { ASSESSMENT_STEMS } from "./stems";
import { ASSESSMENT_BANK_METADATA } from "./metadata";
import type { BankQuestion, ConsistencyPair } from "./types";

const POOL_TARGET = 200;
const bankCache = new Map<string, { questions: BankQuestion[]; pairs: ConsistencyPair[] }>();

function getBank(assessmentId: string): { questions: BankQuestion[]; pairs: ConsistencyPair[] } {
  if (bankCache.has(assessmentId)) return bankCache.get(assessmentId)!;

  const stems = ASSESSMENT_STEMS[assessmentId];
  if (stems) {
    const bank = expandLikertPool(assessmentId, stems, POOL_TARGET);
    bankCache.set(assessmentId, bank);
    return bank;
  }

  // Fallback: legacy static questions as bank
  const legacy = getQuestionsByAssessmentId(assessmentId);
  const questions: BankQuestion[] = legacy.map((q) => ({
    id: q.id,
    text: q.text,
    category: q.trait ?? "general",
    difficulty: 2,
    trait: q.trait ?? "general",
    weight: 1,
    format: q.options ? "multiple_choice" : "likert",
    reverseScored: q.reverseScored,
    options: q.options,
  }));
  const bank = { questions, pairs: [] as ConsistencyPair[] };
  bankCache.set(assessmentId, bank);
  return bank;
}

export function getQuestionPool(assessmentId: string): BankQuestion[] {
  return getBank(assessmentId).questions;
}

export function getConsistencyPairs(assessmentId: string): ConsistencyPair[] {
  return getBank(assessmentId).pairs;
}

export function drawQuestionsForSession(
  assessmentId: string,
  userId: string,
  count: number,
  excludeIds: number[] = []
): BankQuestion[] {
  const pool = getQuestionPool(assessmentId);
  const seed = `${userId}:${assessmentId}:${Date.now()}`;
  return selectQuestions(pool, count, seed, excludeIds);
}

export function bankQuestionToAssessmentQuestion(q: BankQuestion): AssessmentQuestion {
  return {
    id: q.id,
    text: q.text,
    reverseScored: q.reverseScored,
    trait: q.trait,
    options: q.options,
  };
}

export function getAssessmentMetadata(assessmentId: string) {
  return ASSESSMENT_BANK_METADATA[assessmentId] ?? null;
}

export { ASSESSMENT_BANK_METADATA };
