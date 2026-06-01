import { randomUUID } from "crypto";
import { isDemoMode } from "@/lib/demo/config";
import { getSessionUser } from "@/lib/auth/session";
import {
  getAssessmentResults,
  getMoodLogs,
  getChallengeProgress,
  getFlourishingData,
} from "@/lib/data/user-data";
import { getVaultEntries } from "@/lib/data/v5-data";
import { demoSaveAssessmentResult, demoAddTimelineEvent } from "@/lib/demo/store";
import { syncAchievements, recordHPIIfNeeded, addTimelineEvent } from "@/lib/data/upgrade-data";
import { createClient } from "@/lib/supabase/server";
import {
  demoGetActiveSession,
  demoCreateSession,
  demoSaveSession,
  demoGetSessionById,
  demoGetSessions,
  demoGetLifeEvents,
  demoAddLifeEvent,
  demoGetConsent,
  demoSetConsent,
  demoGetBehavioralCount,
  demoRecordBehavioral,
  demoSaveIntelligenceSnapshot,
  demoGetLatestIntelligence,
} from "@/lib/demo/assessment-v2-store";
import {
  getQuestionsForPhase,
  buildSessionFromStored,
  finalizeSessionResult,
} from "@/lib/engines/assessment-v2";
import { runIntelligencePipeline } from "@/lib/engines/intelligence/pipeline";
import { computeTwinConfidence, computeFutureSelfConfidence } from "@/lib/engines/assessment-v2/confidence";
import { buildDigitalTwin } from "@/lib/engines/digital-twin-engine";
import { getUpgradeContext } from "@/lib/data/upgrade-data";
import { getAssessmentMetadata } from "@/lib/assessments/question-banks";
import type { AssessmentResult } from "@/types";

export async function getOrCreateAssessmentSession(assessmentId: string) {
  const user = await getSessionUser();
  if (!user) return null;

  if (isDemoMode()) {
    let session = demoGetActiveSession(user.id, assessmentId);
    if (!session) {
      const completed = demoGetSessions(user.id, assessmentId).filter((s) => s.status === "completed");
      const phase = completed.length > 0 ? Math.min(5, completed.length + 1) : 1;
      const { questionIds } = getQuestionsForPhase(assessmentId, user.id, phase);
      session = demoCreateSession(user.id, assessmentId, questionIds, phase);
    }
    return buildSessionFromStored(
      {
        id: session.id,
        assessment_id: session.assessment_id,
        phase: session.phase,
        question_ids: session.question_ids,
        answers: session.answers,
        status: session.status,
        started_at: session.started_at,
      },
      user.id
    );
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("assessment_sessions")
    .select("*")
    .eq("user_id", user.id)
    .eq("assessment_id", assessmentId)
    .eq("status", "in_progress")
    .maybeSingle();

  if (existing) {
    return buildSessionFromStored(
      {
        id: existing.id,
        assessment_id: existing.assessment_id,
        phase: existing.phase,
        question_ids: existing.question_ids ?? [],
        answers: (existing.answers as Record<number, number>) ?? {},
        status: existing.status,
        started_at: existing.started_at,
      },
      user.id
    );
  }

  const { data: completed } = await supabase
    .from("assessment_sessions")
    .select("id")
    .eq("user_id", user.id)
    .eq("assessment_id", assessmentId)
    .eq("status", "completed");

  const phase = (completed?.length ?? 0) > 0 ? Math.min(5, (completed?.length ?? 0) + 1) : 1;
  const { questionIds } = getQuestionsForPhase(assessmentId, user.id, phase);

  const { data: created } = await supabase
    .from("assessment_sessions")
    .insert({
      user_id: user.id,
      assessment_id: assessmentId,
      phase,
      question_ids: questionIds,
      answers: {},
      status: "in_progress",
    })
    .select()
    .single();

  if (!created) return null;
  return buildSessionFromStored(
    {
      id: created.id,
      assessment_id: created.assessment_id,
      phase: created.phase,
      question_ids: created.question_ids ?? [],
      answers: {},
      status: created.status,
      started_at: created.started_at,
    },
    user.id
  );
}

export async function submitAssessmentSessionBatch(
  sessionId: string,
  batchAnswers: Record<number, number>
) {
  const user = await getSessionUser();
  if (!user) return null;

  const moods = await getMoodLogs();
  const results = await getAssessmentResults();
  const behavioralCount = isDemoMode()
    ? demoGetBehavioralCount(user.id)
    : 0;

  if (isDemoMode()) {
    const session = demoGetSessionById(user.id, sessionId);
    if (!session) return null;

    const allAnswers = { ...session.answers, ...batchAnswers };
    const allIds = session.question_ids;

    const finalized = finalizeSessionResult(session.assessment_id, allAnswers, allIds, {
      priorResultsCount: results.length,
      moodLogCount: moods.length,
      behavioralEventCount: behavioralCount,
    });

    demoSaveSession(user.id, {
      ...session,
      answers: allAnswers,
      status: "completed",
      consistency_level: finalized.consistencyLevel,
      confidence_level: finalized.confidenceLevel,
      updated_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
    });

    const result: AssessmentResult = {
      id: randomUUID(),
      user_id: user.id,
      assessment_id: session.assessment_id,
      score: finalized.score,
      max_score: finalized.maxScore,
      normalized_score: finalized.normalizedScore,
      answers: allAnswers,
      detail_scores: finalized.detailScores,
      created_at: new Date().toISOString(),
    };

    demoSaveAssessmentResult(user.id, result);
    demoAddTimelineEvent(user.id, {
      event_type: "assessment",
      title: `Adaptive V2: ${session.assessment_id} phase ${session.phase}`,
      value: finalized.normalizedScore,
      recorded_at: new Date().toISOString(),
    });
    await syncAchievements(user.id);
    await recordHPIIfNeeded(user.id);

    return { result: finalized, sessionComplete: true };
  }

  const supabase = await createClient();
  const { data: session } = await supabase
    .from("assessment_sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .single();

  if (!session) return null;

  const allAnswers = { ...(session.answers as Record<number, number>), ...batchAnswers };
  const allIds = session.question_ids as number[];

  const finalized = finalizeSessionResult(session.assessment_id, allAnswers, allIds, {
    priorResultsCount: results.length,
    moodLogCount: moods.length,
    behavioralEventCount: behavioralCount,
  });

  await supabase
    .from("assessment_sessions")
    .update({
      answers: allAnswers,
      status: "completed",
      consistency_level: finalized.consistencyLevel,
      confidence_level: finalized.confidenceLevel,
      completed_at: new Date().toISOString(),
    })
    .eq("id", sessionId);

  const { data: row } = await supabase
    .from("assessment_results")
    .insert({
      user_id: user.id,
      assessment_id: session.assessment_id,
      score: finalized.score,
      max_score: finalized.maxScore,
      normalized_score: finalized.normalizedScore,
      answers: allAnswers,
      detail_scores: finalized.detailScores,
      session_id: sessionId,
      confidence_level: finalized.confidenceLevel,
      consistency_level: finalized.consistencyLevel,
      confidence_reason: finalized.confidenceReason,
      administered_question_ids: allIds,
      engine_version: "v2",
    })
    .select()
    .single();

  await addTimelineEvent(user.id, {
    event_type: "assessment",
    title: `Adaptive V2: ${session.assessment_id}`,
    value: finalized.normalizedScore,
  });
  await syncAchievements(user.id);
  await recordHPIIfNeeded(user.id);

  return { result: { ...finalized, id: row?.id }, sessionComplete: true };
}

export async function getAssessmentQualityMeta(assessmentId: string) {
  return getAssessmentMetadata(assessmentId);
}

export async function runUserIntelligence() {
  const user = await getSessionUser();
  if (!user) return null;

  const [flourishing, results, moods, challenges, vault] = await Promise.all([
    getFlourishingData(),
    getAssessmentResults(),
    getMoodLogs(60),
    getChallengeProgress(),
    getVaultEntries(),
  ]);

  const journalTexts = vault
    .filter((v) => {
      const t = (v as { entry_type?: string; type?: string }).entry_type ?? (v as { type?: string }).type;
      return t === "journal" || t === "reflection";
    })
    .map((v) => String((v as { content: string }).content));

  const snapshot = runIntelligencePipeline({
    flourishingOverall: flourishing.scores.overall,
    results,
    moods,
    challenges,
    journalTexts,
    behavioralLoginDays: isDemoMode() ? demoGetBehavioralCount(user.id) : Math.min(14, moods.length),
  });

  if (isDemoMode()) {
    demoSaveIntelligenceSnapshot(user.id, snapshot);
  } else {
    const supabase = await createClient();
    await supabase.from("intelligence_snapshots").insert({
      user_id: user.id,
      segment: snapshot.segment.id,
      burnout_risk: snapshot.burnout.level,
      burnout_score: snapshot.burnout.score,
      features: {},
      recommendations: snapshot.recommendations,
      explanations: [
        snapshot.burnout.explanation,
        snapshot.segment.explanation,
        snapshot.journal.summary,
      ],
    });
  }

  return snapshot;
}

export async function getLatestIntelligence() {
  const user = await getSessionUser();
  if (!user) return null;
  if (isDemoMode()) return demoGetLatestIntelligence(user.id);
  const supabase = await createClient();
  const { data } = await supabase
    .from("intelligence_snapshots")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data) return null;
  return {
    burnout: { level: data.burnout_risk, score: data.burnout_score, explanation: data.explanations?.[0] },
    segment: { id: data.segment, label: data.segment, explanation: data.explanations?.[1] },
    recommendations: data.recommendations,
    generatedAt: data.created_at,
  };
}

export async function getTwinWithConfidence() {
  const ctx = await getUpgradeContext();
  if (!ctx) return null;
  const twin = buildDigitalTwin(ctx.blueprint, ctx.flourishing.scores, ctx.results, ctx.moods);
  const vault = await getVaultEntries();
  const confidence = computeTwinConfidence({
    assessmentCount: ctx.results.length,
    moodCount: ctx.moods.length,
    journalCount: vault.length,
    lifeEventCount: (await getLifeEvents()).length,
    challengeActive: ctx.challenges.filter((c) => c.is_active).length,
  });
  return { twin, confidence };
}

export async function getFutureSelfWithConfidence(input: import("@/types").FutureSelfInput) {
  const { runFutureSelfSimulation } = await import("@/lib/data/upgrade-data");
  const results = await getAssessmentResults();
  const moods = await getMoodLogs(60);
  const scenario = await runFutureSelfSimulation(input);
  if (!scenario) return null;
  const confidence = computeFutureSelfConfidence({
    moodWeeks: Math.floor(moods.length / 7),
    assessmentCount: results.length,
    behavioralWeeks: Math.min(12, moods.length),
  });
  return { scenario, confidence };
}

export async function getLifeEvents() {
  const user = await getSessionUser();
  if (!user) return [];
  if (isDemoMode()) return demoGetLifeEvents(user.id);
  const supabase = await createClient();
  const { data } = await supabase.from("life_events").select("*").eq("user_id", user.id).order("event_date", { ascending: false });
  return data ?? [];
}

export async function addLifeEvent(event: {
  event_type: string;
  title: string;
  description?: string;
  event_date?: string;
  impact_score?: number;
}) {
  const user = await getSessionUser();
  if (!user) return null;
  if (isDemoMode()) return demoAddLifeEvent(user.id, { ...event, event_date: event.event_date ?? new Date().toISOString().slice(0, 10) });
  const supabase = await createClient();
  const { data } = await supabase.from("life_events").insert({ user_id: user.id, ...event }).select().single();
  return data;
}

export async function getUserConsent() {
  const user = await getSessionUser();
  if (!user) return null;
  if (isDemoMode()) return demoGetConsent(user.id);
  const supabase = await createClient();
  const { data } = await supabase.from("user_consent").select("*").eq("user_id", user.id).maybeSingle();
  return data ?? { analytics: false, ai_personalization: true, research_aggregate: false };
}

export async function updateUserConsent(consent: {
  analytics?: boolean;
  ai_personalization?: boolean;
  research_aggregate?: boolean;
}) {
  const user = await getSessionUser();
  if (!user) return null;
  if (isDemoMode()) return demoSetConsent(user.id, consent);
  const supabase = await createClient();
  await supabase.from("user_consent").upsert({ user_id: user.id, ...consent, updated_at: new Date().toISOString() });
  return getUserConsent();
}

export async function exportUserData() {
  const user = await getSessionUser();
  if (!user) return null;
  const [results, moods, flourishing, events, consent] = await Promise.all([
    getAssessmentResults(),
    getMoodLogs(365),
    getFlourishingData(),
    getLifeEvents(),
    getUserConsent(),
  ]);
  return {
    exportedAt: new Date().toISOString(),
    userId: user.id,
    results,
    moods,
    flourishing: flourishing.scores,
    lifeEvents: events,
    consent,
  };
}

export { demoRecordBehavioral };
