import { buildFeatureVector } from "./features";
import { predictBurnoutRisk } from "./burnout-predictor";
import { segmentUser } from "./segmentation";
import { analyzeJournalCorpus } from "./journal-analysis";
import { generateRecommendations } from "@/lib/engines/recommendations/engine";
import type { AssessmentResult, MoodLog, ChallengeProgress } from "@/types";

export interface IntelligenceSnapshot {
  burnout: { level: string; score: number; explanation: string };
  segment: { id: string; label: string; explanation: string };
  journal: { sentiment: string; stress: number; motivation: number; optimism: number; summary: string };
  recommendations: ReturnType<typeof generateRecommendations>;
  generatedAt: string;
}

export function runIntelligencePipeline(params: {
  flourishingOverall: number;
  results: AssessmentResult[];
  moods: MoodLog[];
  challenges: ChallengeProgress[];
  journalTexts: string[];
  behavioralLoginDays: number;
}): IntelligenceSnapshot {
  const journal = analyzeJournalCorpus(params.journalTexts);
  const features = buildFeatureVector({
    flourishingOverall: params.flourishingOverall,
    results: params.results,
    moods: params.moods,
    challenges: params.challenges,
    behavioralLoginDays: params.behavioralLoginDays,
    journalSentiment: { stress: journal.stress, optimism: journal.optimism },
  });

  const burnout = predictBurnoutRisk(features);
  const segment = segmentUser(features, burnout.level);
  const recommendations = generateRecommendations({
    segment: segment.segment,
    burnoutLevel: burnout.level,
    features,
    flourishingOverall: params.flourishingOverall,
  });

  return {
    burnout,
    segment: { id: segment.segment, label: segment.label, explanation: segment.explanation },
    journal,
    recommendations,
    generatedAt: new Date().toISOString(),
  };
}
