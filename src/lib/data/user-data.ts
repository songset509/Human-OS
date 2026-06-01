import {
  calculateFlourishingScores,
  generateInsights,
} from "@/lib/flourishing-engine";
import { ASSESSMENTS } from "@/lib/assessments-data";
import { getSessionUser } from "@/lib/auth/session";
import { isDemoMode } from "@/lib/demo/config";
import {
  demoGetAssessmentResults,
  demoGetChallengeProgress,
  demoGetMoodLogs,
} from "@/lib/demo/store";
import { createClient } from "@/lib/supabase/server";
import type {
  AssessmentResult,
  ChallengeProgress,
  FlourishingScores,
  MoodLog,
  Profile,
} from "@/types";

export async function getCurrentUser() {
  return getSessionUser();
}

export async function getProfile(): Promise<Profile | null> {
  const user = await getSessionUser();
  if (!user) return null;

  if (isDemoMode()) {
    return {
      id: user.id,
      full_name: user.full_name,
      avatar_url: null,
      created_at: user.created_at,
      updated_at: user.created_at,
    };
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return data;
}

export async function getAssessmentResults(): Promise<AssessmentResult[]> {
  const user = await getSessionUser();
  if (!user) return [];

  if (isDemoMode()) {
    return demoGetAssessmentResults(user.id);
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("assessment_results")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (data ?? []) as AssessmentResult[];
}

export async function getMoodLogs(limit = 30): Promise<MoodLog[]> {
  const user = await getSessionUser();
  if (!user) return [];

  if (isDemoMode()) {
    return demoGetMoodLogs(user.id, limit);
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("mood_logs")
    .select("*")
    .eq("user_id", user.id)
    .order("logged_at", { ascending: false })
    .limit(limit);

  return (data ?? []) as MoodLog[];
}

export async function getChallengeProgress(): Promise<ChallengeProgress[]> {
  const user = await getSessionUser();
  if (!user) return [];

  if (isDemoMode()) {
    return demoGetChallengeProgress(user.id);
  }

  const supabase = await createClient();
  const { data } = await supabase
    .from("challenge_progress")
    .select("*")
    .eq("user_id", user.id)
    .order("started_at", { ascending: false });

  return (data ?? []) as ChallengeProgress[];
}

export async function getFlourishingData() {
  const [results, moods] = await Promise.all([
    getAssessmentResults(),
    getMoodLogs(),
  ]);

  const scores = calculateFlourishingScores(results, moods);
  const insight = generateInsights(scores);

  const completedAssessmentIds = new Set(
    results.map((r) => r.assessment_id)
  );

  return {
    scores,
    insight,
    results,
    moods,
    completedAssessments: completedAssessmentIds.size,
    totalAssessments: ASSESSMENTS.length,
  };
}

export async function getLatestInsight() {
  const user = await getSessionUser();
  if (!user || isDemoMode()) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("insights")
    .select("*")
    .eq("user_id", user.id)
    .order("generated_at", { ascending: false })
    .limit(1)
    .single();

  return data;
}

export async function saveInsight(content: object) {
  const user = await getSessionUser();
  if (!user || isDemoMode()) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("insights")
    .insert({ user_id: user.id, content })
    .select()
    .single();

  return data;
}

export type FlourishingData = Awaited<ReturnType<typeof getFlourishingData>>;

export { type FlourishingScores };
