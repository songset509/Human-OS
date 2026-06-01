import { isDemoMode } from "@/lib/demo/config";
import { getSessionUser } from "@/lib/auth/session";
import {
  getAssessmentResults,
  getMoodLogs,
  getFlourishingData,
} from "@/lib/data/user-data";
import { getHPITrend } from "@/lib/data/upgrade-data";
import {
  computeLifeBalance,
  computeBurnoutRisk,
  computeHumanCapital,
  deriveLifeOsFromProfile,
  generateMission,
  generateFutureRoadmap,
  detectAnalyticsInsights,
  LIFE_OS_DIMENSIONS,
} from "@/lib/engines/v5";
import { createClient } from "@/lib/supabase/server";

// Demo V5 data stored in extended demo store fields via v5 module
import {
  demoGetV5,
  demoSetV5,
  demoAddVaultEntry,
  demoGetVaultEntries,
  demoAddRelationship,
  demoGetRelationships,
  demoAddMemory,
  demoGetMemories,
} from "@/lib/demo/v5-store";

export async function getLifeOsData() {
  const user = await getSessionUser();
  if (!user) return null;
  const [results, moods] = await Promise.all([getAssessmentResults(), getMoodLogs()]);
  const derived = deriveLifeOsFromProfile(results, moods);

  if (isDemoMode()) {
    const saved = demoGetV5(user.id, "life_os") as Record<string, number> | null;
    const dimensions = saved ?? derived.dimensions;
    return { dimensions, balanceScore: computeLifeBalance(dimensions), recommendations: derived.recommendations };
  }

  const supabase = await createClient();
  const { data } = await supabase.from("life_os_scores").select("*").eq("user_id", user.id).single();
  if (data?.dimensions) {
    return {
      dimensions: data.dimensions as Record<string, number>,
      balanceScore: Number(data.balance_score),
      recommendations: derived.recommendations,
    };
  }
  return derived;
}

export async function updateLifeOsDimension(dimension: string, score: number) {
  const user = await getSessionUser();
  if (!user) return null;
  const current = await getLifeOsData();
  const dimensions = { ...current?.dimensions, [dimension]: score };

  if (isDemoMode()) {
    demoSetV5(user.id, "life_os", dimensions);
    return { dimensions, balanceScore: computeLifeBalance(dimensions) };
  }

  const supabase = await createClient();
  await supabase.from("life_os_scores").upsert({
    user_id: user.id,
    dimensions,
    balance_score: computeLifeBalance(dimensions),
    updated_at: new Date().toISOString(),
  });
  return { dimensions, balanceScore: computeLifeBalance(dimensions) };
}

export async function getVaultEntries() {
  const user = await getSessionUser();
  if (!user) return [];
  if (isDemoMode()) return demoGetVaultEntries(user.id);
  const supabase = await createClient();
  const { data } = await supabase.from("vault_entries").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
  return data ?? [];
}

export async function addVaultEntry(entry: { type: string; title: string; content: string; tags?: string[] }) {
  const user = await getSessionUser();
  if (!user) return null;
  if (isDemoMode()) return demoAddVaultEntry(user.id, entry);
  const supabase = await createClient();
  const { data } = await supabase.from("vault_entries").insert({
    user_id: user.id,
    entry_type: entry.type,
    title: entry.title,
    content: entry.content,
    tags: entry.tags ?? [],
  }).select().single();
  return data;
}

export async function getMission() {
  const user = await getSessionUser();
  if (!user) return null;
  const [results, moods] = await Promise.all([getAssessmentResults(), getMoodLogs()]);

  if (isDemoMode()) {
    const saved = demoGetV5(user.id, "mission");
    if (saved) return saved;
    const m = generateMission(results, moods);
    demoSetV5(user.id, "mission", m);
    return m;
  }

  const supabase = await createClient();
  const { data } = await supabase.from("user_missions").select("*").eq("user_id", user.id).single();
  if (data) {
    return {
      missionStatement: data.mission_statement,
      lifeVision: data.life_vision,
      longTermDirection: data.long_term_direction,
    };
  }
  const m = generateMission(results, moods);
  await supabase.from("user_missions").insert({
    user_id: user.id,
    mission_statement: m.missionStatement,
    life_vision: m.lifeVision,
    long_term_direction: m.longTermDirection,
  });
  return m;
}

export async function getBurnoutAnalysis() {
  const user = await getSessionUser();
  if (!user) return null;
  const [results, moods] = await Promise.all([getAssessmentResults(), getMoodLogs()]);
  return computeBurnoutRisk(moods, results);
}

export async function getRelationships() {
  const user = await getSessionUser();
  if (!user) return [];
  if (isDemoMode()) return demoGetRelationships(user.id);
  const supabase = await createClient();
  const { data } = await supabase.from("relationship_nodes").select("*").eq("user_id", user.id);
  return data ?? [];
}

export async function addRelationship(node: { name: string; strength: number; category: string }) {
  const user = await getSessionUser();
  if (!user) return null;
  if (isDemoMode()) return demoAddRelationship(user.id, node);
  const supabase = await createClient();
  const { data } = await supabase.from("relationship_nodes").insert({
    user_id: user.id,
    ...node,
  }).select().single();
  return data;
}

export async function getHumanCapital() {
  const user = await getSessionUser();
  if (!user) return null;
  const results = await getAssessmentResults();
  return computeHumanCapital(results);
}

export async function getMonthlyReport() {
  const user = await getSessionUser();
  if (!user) return null;
  const [flourishing, hpiTrend, moods] = await Promise.all([
    getFlourishingData(),
    getHPITrend(user.id),
    getMoodLogs(30),
  ]);
  const ctx = await getLifeOsData();
  return {
    generatedAt: new Date().toISOString(),
    flourishing: flourishing.scores,
    hpi: flourishing.scores.overall,
    hpiTrend: hpiTrend.slice(0, 6),
    moods: moods.length,
    achievements: flourishing.completedAssessments,
    lifeBalance: ctx?.balanceScore ?? 50,
    recommendations: flourishing.insight.recommendations,
  };
}

export async function getFutureRoadmap() {
  const user = await getSessionUser();
  if (!user) return null;
  const [results, moods] = await Promise.all([getAssessmentResults(), getMoodLogs()]);
  return generateFutureRoadmap(results, moods);
}

export async function getAnalyticsInsights() {
  const [results, moods] = await Promise.all([getAssessmentResults(), getMoodLogs()]);
  return detectAnalyticsInsights(moods, results);
}

export async function storeAIMemory(type: string, content: object) {
  const user = await getSessionUser();
  if (!user) return;
  if (isDemoMode()) {
    demoAddMemory(user.id, type, content);
    return;
  }
  const supabase = await createClient();
  await supabase.from("ai_memory").insert({ user_id: user.id, memory_type: type, content });
}

export async function getAIMemoryContext(): Promise<string> {
  const user = await getSessionUser();
  if (!user) return "";
  let memories: { memory_type: string; content: unknown }[] = [];
  if (isDemoMode()) {
    memories = demoGetMemories(user.id).map((m) => ({
      memory_type: m.type,
      content: m.content,
    }));
  } else {
    const supabase = await createClient();
    const { data } = await supabase
      .from("ai_memory")
      .select("memory_type, content")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);
    memories = data ?? [];
  }
  if (memories.length === 0) return "";
  return `User memory (recent): ${JSON.stringify(memories.slice(0, 5))}`;
}

export { LIFE_OS_DIMENSIONS };
