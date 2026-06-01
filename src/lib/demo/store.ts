import { randomUUID } from "crypto";
import type {
  AIConversation,
  AssessmentResult,
  ChallengeProgress,
  ChatMessage,
  MoodLog,
} from "@/types";

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

const DATA_DIR = `${process.cwd()}/.data`;
const STORE_PATH = `${DATA_DIR}/demo-store.json`;

function loadStore(): DemoStoreFile {
  try {
    // Dynamic require to keep out of edge bundles
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require("fs") as typeof import("fs");
    if (fs.existsSync(STORE_PATH)) {
      return JSON.parse(fs.readFileSync(STORE_PATH, "utf-8")) as DemoStoreFile;
    }
  } catch {
    // ignore
  }
  return { users: {}, data: {}, global_community: [] };
}

function saveStore(store: DemoStoreFile) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const fs = require("fs") as typeof import("fs");
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2));
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

function getStore(): DemoStoreFile {
  if (!global.__humanosDemoStore) {
    const loaded = loadStore();
    if (!loaded.global_community) loaded.global_community = [];
    global.__humanosDemoStore = loaded;
  }
  return global.__humanosDemoStore;
}

function persist() {
  saveStore(getStore());
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
  persist();
  return user;
}

export function demoSignIn(email: string, password: string): DemoUser {
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
  return getStore().users[id] ?? null;
}

export function demoUpdateProfile(userId: string, fullName: string) {
  const store = getStore();
  if (store.users[userId]) {
    store.users[userId].full_name = fullName;
    persist();
  }
}

export function demoGetAssessmentResults(userId: string): AssessmentResult[] {
  return [...ensureUserData(userId).assessment_results].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export function demoSaveAssessmentResult(
  userId: string,
  result: Omit<AssessmentResult, "id" | "user_id" | "created_at">
): AssessmentResult {
  const data = ensureUserData(userId);
  const entry: AssessmentResult = {
    id: randomUUID(),
    user_id: userId,
    ...result,
    created_at: new Date().toISOString(),
  };
  data.assessment_results.unshift(entry);
  persist();
  return entry;
}

export function demoGetMoodLogs(userId: string, limit = 30): MoodLog[] {
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
  persist();
  return entry;
}

export function demoGetChallengeProgress(userId: string): ChallengeProgress[] {
  return [...ensureUserData(userId).challenge_progress].sort(
    (a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
  );
}

export function demoSaveChallengeProgress(
  userId: string,
  progress: ChallengeProgress
) {
  const data = ensureUserData(userId);
  const idx = data.challenge_progress.findIndex((p) => p.id === progress.id);
  if (idx >= 0) {
    data.challenge_progress[idx] = progress;
  } else {
    data.challenge_progress.unshift(progress);
  }
  persist();
  return progress;
}

export function demoFindActiveChallenge(userId: string, challengeId: string) {
  return ensureUserData(userId).challenge_progress.find(
    (p) => p.challenge_id === challengeId && p.is_active
  );
}

export function demoGetConversation(userId: string): AIConversation | null {
  return ensureUserData(userId).ai_conversation;
}

export function demoSaveConversation(
  userId: string,
  messages: ChatMessage[],
  conversationId?: string
): AIConversation {
  const data = ensureUserData(userId);
  const conv: AIConversation = {
    id: conversationId ?? data.ai_conversation?.id ?? randomUUID(),
    user_id: userId,
    messages,
    created_at: data.ai_conversation?.created_at ?? new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  data.ai_conversation = conv;
  persist();
  return conv;
}

export function demoGetAchievements(userId: string) {
  return ensureUserData(userId).achievements;
}

export function demoUnlockAchievements(userId: string, ids: string[]) {
  const data = ensureUserData(userId);
  for (const id of ids) {
    if (!data.achievements.includes(id)) data.achievements.push(id);
  }
  persist();
}

export function demoSaveHPISnapshot(userId: string, score: number, dimensions: Record<string, number>) {
  const data = ensureUserData(userId);
  data.hpi_snapshots.unshift({ score, dimensions, recorded_at: new Date().toISOString() });
  data.timeline_events.unshift({
    id: randomUUID(),
    event_type: "hpi",
    title: "HPI Snapshot",
    value: score,
    recorded_at: new Date().toISOString(),
  });
  persist();
}

export function demoGetHPISnapshots(userId: string) {
  return ensureUserData(userId).hpi_snapshots ?? [];
}

export function demoGetTimeline(userId: string) {
  return ensureUserData(userId).timeline_events;
}

export function demoAddTimelineEvent(
  userId: string,
  event: Omit<DemoUserData["timeline_events"][0], "id">
) {
  const data = ensureUserData(userId);
  data.timeline_events.unshift({ id: randomUUID(), ...event });
  persist();
}

export function demoSaveFutureSelf(userId: string, input: object, predictions: object) {
  const data = ensureUserData(userId);
  const entry = { id: randomUUID(), input, predictions, created_at: new Date().toISOString() };
  data.future_self_scenarios.unshift(entry);
  persist();
  return entry;
}

export function demoGetFutureSelfScenarios(userId: string) {
  return ensureUserData(userId).future_self_scenarios;
}

export function demoAddCommunityPost(userId: string, topic: string, content: string) {
  const store = getStore();
  const post = { id: randomUUID(), topic, content, created_at: new Date().toISOString() };
  if (!store.global_community) store.global_community = [];
  store.global_community.unshift(post);
  ensureUserData(userId).community_posts.unshift(post);
  persist();
  return post;
}

export function demoGetCommunityPosts(topic?: string) {
  const store = getStore();
  const posts = store.global_community ?? [];
  return topic ? posts.filter((p) => p.topic === topic) : posts;
}

export function demoGetAllUserResults(): AssessmentResult[][] {
  const store = getStore();
  return Object.values(store.data).map((d) => d.assessment_results);
}

export function demoSaveGoals(userId: string, goals: DemoUserData["goals"]) {
  ensureUserData(userId).goals = goals;
  persist();
}

export function demoGetGoals(userId: string) {
  return ensureUserData(userId).goals;
}
