import { randomUUID } from "crypto";
import type {
  AIConversation,
  AssessmentResult,
  ChallengeProgress,
  ChatMessage,
  MoodLog,
} from "@/types";
import { assertDemoProviderAllowed } from "@/lib/demo/guard";

export interface DemoUser {
  id: string;
  email: string;
  password: string;
  full_name: string;
  created_at: string;
}

interface DemoUserData {
  assessment_results: AssessmentResult[];
  mood_logs: MoodLog[];
  challenge_progress: ChallengeProgress[];
  ai_conversation: AIConversation | null;
  achievements: string[];
  hpi_snapshots: { score: number; dimensions: Record<string, number>; recorded_at: string }[];
  timeline_events: { id: string; event_type: string; title: string; value?: number; recorded_at: string }[];
  goals: { id: string; title: string; description?: string; category?: string }[];
  future_self_scenarios: { id: string; input: object; predictions: object; created_at: string }[];
  community_posts: { id: string; topic: string; content: string; created_at: string }[];
}

interface DemoStoreFile {
  users: Record<string, DemoUser>;
  data: Record<string, DemoUserData>;
  global_community: { id: string; topic: string; content: string; created_at: string }[];
}

function emptyUserData(): DemoUserData {
  return {
    assessment_results: [],
    mood_logs: [],
    challenge_progress: [],
    ai_conversation: null,
    achievements: [],
    hpi_snapshots: [],
    timeline_events: [],
    goals: [],
    future_self_scenarios: [],
    community_posts: [],
  };
}

declare global {
  var __humanosDemoStore: DemoStoreFile | undefined;
}

/** In-memory only — no filesystem access (safe for Vercel serverless). */
function getStore(): DemoStoreFile {
  assertDemoProviderAllowed("demo/store.getStore");
  if (!global.__humanosDemoStore) {
    global.__humanosDemoStore = { users: {}, data: {}, global_community: [] };
  }
  return global.__humanosDemoStore;
}

function ensureUserData(userId: string): DemoUserData {
  const store = getStore();
  if (!store.data[userId]) {
    store.data[userId] = emptyUserData();
  } else {
    const defaults = emptyUserData();
    const d = store.data[userId];
    for (const key of Object.keys(defaults) as (keyof DemoUserData)[]) {
      if (d[key] === undefined || d[key] === null) {
        (d as unknown as Record<string, unknown>)[key] = defaults[key];
      }
    }
  }
  return store.data[userId];
}

export function demoSignUp(email: string, password: string, fullName: string): DemoUser {
  assertDemoProviderAllowed("demoSignUp");
  const store = getStore();
  const existing = Object.values(store.users).find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );
  if (existing) {
    throw new Error("An account with this email already exists.");
  }

  const user: DemoUser = {
    id: randomUUID(),
    email,
    password,
    full_name: fullName,
    created_at: new Date().toISOString(),
  };

  store.users[user.id] = user;
  store.data[user.id] = emptyUserData();
  return user;
}

export function demoSignIn(email: string, password: string): DemoUser {
  assertDemoProviderAllowed("demoSignIn");
  const store = getStore();
  const user = Object.values(store.users).find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );
  if (!user || user.password !== password) {
    throw new Error("Invalid email or password.");
  }
  return user;
}

export function demoGetUserById(id: string): DemoUser | null {
  if (process.env.NODE_ENV !== "development") return null;
  return getStore().users[id] ?? null;
}

export function demoUpdateProfile(userId: string, fullName: string) {
  assertDemoProviderAllowed("demoUpdateProfile");
  const store = getStore();
  if (store.users[userId]) {
    store.users[userId].full_name = fullName;
  }
}

export function demoGetAssessmentResults(userId: string): AssessmentResult[] {
  assertDemoProviderAllowed("demoGetAssessmentResults");
  return [...ensureUserData(userId).assessment_results].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export function demoSaveAssessmentResult(
  userId: string,
  result: Omit<AssessmentResult, "id" | "user_id" | "created_at">
): AssessmentResult {
  assertDemoProviderAllowed("demoSaveAssessmentResult");
  const data = ensureUserData(userId);
  const entry: AssessmentResult = {
    id: randomUUID(),
    user_id: userId,
    ...result,
    created_at: new Date().toISOString(),
  };
  data.assessment_results.unshift(entry);
  return entry;
}

export function demoGetMoodLogs(userId: string, limit = 30): MoodLog[] {
  assertDemoProviderAllowed("demoGetMoodLogs");
  return [...ensureUserData(userId).mood_logs]
    .sort((a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime())
    .slice(0, limit);
}

export function demoSaveMoodLog(
  userId: string,
  mood: MoodLog["mood"],
  note: string | null,
  loggedAt: string
): MoodLog {
  assertDemoProviderAllowed("demoSaveMoodLog");
  const data = ensureUserData(userId);
  const existing = data.mood_logs.findIndex((m) => m.logged_at === loggedAt);
  const entry: MoodLog = {
    id: randomUUID(),
    user_id: userId,
    mood,
    note,
    logged_at: loggedAt,
    created_at: new Date().toISOString(),
  };
  if (existing >= 0) {
    data.mood_logs[existing] = entry;
  } else {
    data.mood_logs.unshift(entry);
  }
  return entry;
}

export function demoGetChallengeProgress(userId: string): ChallengeProgress[] {
  assertDemoProviderAllowed("demoGetChallengeProgress");
  return [...ensureUserData(userId).challenge_progress].sort(
    (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
  );
}

export function demoSaveChallengeProgress(
  userId: string,
  progress: ChallengeProgress
) {
  assertDemoProviderAllowed("demoSaveChallengeProgress");
  const data = ensureUserData(userId);
  const idx = data.challenge_progress.findIndex((p) => p.id === progress.id);
  if (idx >= 0) {
    data.challenge_progress[idx] = progress;
  } else {
    data.challenge_progress.unshift(progress);
  }
  return progress;
}

export function demoFindActiveChallenge(userId: string, challengeId: string) {
  assertDemoProviderAllowed("demoFindActiveChallenge");
  return ensureUserData(userId).challenge_progress.find(
    (p) => p.challenge_id === challengeId && p.is_active
  );
}

export function demoGetConversation(userId: string): AIConversation | null {
  assertDemoProviderAllowed("demoGetConversation");
  return ensureUserData(userId).ai_conversation;
}

export function demoSaveConversation(
  userId: string,
  messages: ChatMessage[],
  conversationId?: string
): AIConversation {
  assertDemoProviderAllowed("demoSaveConversation");
  const data = ensureUserData(userId);
  const conv: AIConversation = {
    id: conversationId ?? data.ai_conversation?.id ?? randomUUID(),
    user_id: userId,
    messages,
    created_at: data.ai_conversation?.created_at ?? new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  data.ai_conversation = conv;
  return conv;
}

export function demoGetAchievements(userId: string) {
  assertDemoProviderAllowed("demoGetAchievements");
  return ensureUserData(userId).achievements;
}

export function demoUnlockAchievements(userId: string, ids: string[]) {
  assertDemoProviderAllowed("demoUnlockAchievements");
  const data = ensureUserData(userId);
  for (const id of ids) {
    if (!data.achievements.includes(id)) data.achievements.push(id);
  }
}

export function demoSaveHPISnapshot(userId: string, score: number, dimensions: Record<string, number>) {
  assertDemoProviderAllowed("demoSaveHPISnapshot");
  const data = ensureUserData(userId);
  data.hpi_snapshots.unshift({ score, dimensions, recorded_at: new Date().toISOString() });
  data.timeline_events.unshift({
    id: randomUUID(),
    event_type: "hpi",
    title: "HPI Snapshot",
    value: score,
    recorded_at: new Date().toISOString(),
  });
}

export function demoGetHPISnapshots(userId: string) {
  assertDemoProviderAllowed("demoGetHPISnapshots");
  return ensureUserData(userId).hpi_snapshots ?? [];
}

export function demoGetTimeline(userId: string) {
  assertDemoProviderAllowed("demoGetTimeline");
  return ensureUserData(userId).timeline_events;
}

export function demoAddTimelineEvent(
  userId: string,
  event: Omit<DemoUserData["timeline_events"][0], "id">
) {
  assertDemoProviderAllowed("demoAddTimelineEvent");
  const data = ensureUserData(userId);
  data.timeline_events.unshift({ id: randomUUID(), ...event });
}

export function demoSaveFutureSelf(userId: string, input: object, predictions: object) {
  assertDemoProviderAllowed("demoSaveFutureSelf");
  const data = ensureUserData(userId);
  const entry = { id: randomUUID(), input, predictions, created_at: new Date().toISOString() };
  data.future_self_scenarios.unshift(entry);
  return entry;
}

export function demoGetFutureSelfScenarios(userId: string) {
  assertDemoProviderAllowed("demoGetFutureSelfScenarios");
  return ensureUserData(userId).future_self_scenarios;
}

export function demoAddCommunityPost(userId: string, topic: string, content: string) {
  assertDemoProviderAllowed("demoAddCommunityPost");
  const store = getStore();
  const post = { id: randomUUID(), topic, content, created_at: new Date().toISOString() };
  if (!store.global_community) store.global_community = [];
  store.global_community.unshift(post);
  ensureUserData(userId).community_posts.unshift(post);
  return post;
}

export function demoGetCommunityPosts(topic?: string) {
  assertDemoProviderAllowed("demoGetCommunityPosts");
  const store = getStore();
  const posts = store.global_community ?? [];
  return topic ? posts.filter((p) => p.topic === topic) : posts;
}

export function demoGetAllUserResults(): AssessmentResult[][] {
  assertDemoProviderAllowed("demoGetAllUserResults");
  const store = getStore();
  return Object.values(store.data).map((d) => d.assessment_results);
}

export function demoSaveGoals(userId: string, goals: DemoUserData["goals"]) {
  assertDemoProviderAllowed("demoSaveGoals");
  ensureUserData(userId).goals = goals;
}

export function demoGetGoals(userId: string) {
  assertDemoProviderAllowed("demoGetGoals");
  return ensureUserData(userId).goals;
}
