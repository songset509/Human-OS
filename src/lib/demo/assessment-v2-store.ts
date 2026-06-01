import { randomUUID } from "crypto";

export interface DemoAssessmentSession {
  id: string;
  assessment_id: string;
  phase: number;
  question_ids: number[];
  answers: Record<number, number>;
  status: "in_progress" | "completed" | "abandoned";
  consistency_level?: string;
  confidence_level?: string;
  started_at: string;
  completed_at?: string;
  updated_at: string;
}

export interface DemoLifeEvent {
  id: string;
  event_type: string;
  title: string;
  description?: string;
  event_date: string;
  impact_score?: number;
  created_at: string;
}

interface V2UserData {
  assessment_sessions: DemoAssessmentSession[];
  life_events: DemoLifeEvent[];
  behavioral_events: { event_type: string; payload: object; recorded_at: string }[];
  user_consent: {
    analytics: boolean;
    ai_personalization: boolean;
    research_aggregate: boolean;
  };
  intelligence_snapshots: object[];
}

declare global {
  var __humanosV2Store: Record<string, V2UserData> | undefined;
}

function getV2Store(): Record<string, V2UserData> {
  if (!global.__humanosV2Store) global.__humanosV2Store = {};
  return global.__humanosV2Store;
}

function ensureV2(userId: string): V2UserData {
  const store = getV2Store();
  if (!store[userId]) {
    store[userId] = {
      assessment_sessions: [],
      life_events: [],
      behavioral_events: [],
      user_consent: { analytics: false, ai_personalization: true, research_aggregate: false },
      intelligence_snapshots: [],
    };
  }
  return store[userId];
}

export function demoGetSessions(userId: string, assessmentId: string) {
  return ensureV2(userId).assessment_sessions.filter((s) => s.assessment_id === assessmentId);
}

export function demoGetActiveSession(userId: string, assessmentId: string) {
  return demoGetSessions(userId, assessmentId).find((s) => s.status === "in_progress") ?? null;
}

export function demoSaveSession(userId: string, session: DemoAssessmentSession) {
  const v2 = ensureV2(userId);
  const idx = v2.assessment_sessions.findIndex((s) => s.id === session.id);
  if (idx >= 0) v2.assessment_sessions[idx] = session;
  else v2.assessment_sessions.unshift(session);
  return session;
}

export function demoCreateSession(
  userId: string,
  assessmentId: string,
  questionIds: number[],
  phase: number
) {
  const session: DemoAssessmentSession = {
    id: randomUUID(),
    assessment_id: assessmentId,
    phase,
    question_ids: questionIds,
    answers: {},
    status: "in_progress",
    started_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  return demoSaveSession(userId, session);
}

export function demoGetSessionById(userId: string, sessionId: string) {
  return ensureV2(userId).assessment_sessions.find((s) => s.id === sessionId) ?? null;
}

export function demoGetLifeEvents(userId: string) {
  return ensureV2(userId).life_events;
}

export function demoAddLifeEvent(userId: string, event: Omit<DemoLifeEvent, "id" | "created_at">) {
  const v2 = ensureV2(userId);
  const row = { ...event, id: randomUUID(), created_at: new Date().toISOString() };
  v2.life_events.unshift(row);
  return row;
}

export function demoGetConsent(userId: string) {
  return ensureV2(userId).user_consent;
}

export function demoSetConsent(userId: string, consent: Partial<V2UserData["user_consent"]>) {
  const v2 = ensureV2(userId);
  v2.user_consent = { ...v2.user_consent, ...consent };
  return v2.user_consent;
}

export function demoRecordBehavioral(userId: string, eventType: string, payload: object = {}) {
  ensureV2(userId).behavioral_events.unshift({
    event_type: eventType,
    payload,
    recorded_at: new Date().toISOString(),
  });
}

export function demoGetBehavioralCount(userId: string) {
  return ensureV2(userId).behavioral_events.length;
}

export function demoSaveIntelligenceSnapshot(userId: string, snapshot: object) {
  const v2 = ensureV2(userId);
  v2.intelligence_snapshots.unshift(snapshot);
  if (v2.intelligence_snapshots.length > 20) v2.intelligence_snapshots.pop();
}

export function demoGetLatestIntelligence(userId: string) {
  return ensureV2(userId).intelligence_snapshots[0] ?? null;
}
