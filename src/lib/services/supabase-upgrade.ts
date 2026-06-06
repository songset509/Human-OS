import { createClient } from "@/lib/supabase/server";

export async function sbInsertTimeline(
  userId: string,
  event: { event_type: string; title: string; value?: number; metadata?: object }
) {
  const supabase = await createClient();
  return supabase.from("growth_timeline_events").insert({
    user_id: userId,
    ...event,
  });
}

export async function sbGetTimeline(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("growth_timeline_events")
    .select("*")
    .eq("user_id", userId)
    .order("recorded_at", { ascending: false })
    .limit(50);
  return data ?? [];
}

export async function sbSaveHPISnapshot(
  userId: string,
  score: number,
  dimensions: Record<string, number>
) {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];
  const { data: existing } = await supabase
    .from("hpi_snapshots")
    .select("id")
    .eq("user_id", userId)
    .gte("recorded_at", `${today}T00:00:00`)
    .limit(1);
  if (existing && existing.length > 0) return;
  await supabase.from("hpi_snapshots").insert({
    user_id: userId,
    score,
    dimensions,
  });
}

export async function sbGetHPISnapshots(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("hpi_snapshots")
    .select("score, dimensions, recorded_at")
    .eq("user_id", userId)
    .order("recorded_at", { ascending: false })
    .limit(30);
  return (data ?? []).map((r) => ({
    score: Number(r.score),
    dimensions: r.dimensions as Record<string, number>,
    recorded_at: r.recorded_at,
  }));
}

export async function sbGetAchievements(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_achievements")
    .select("achievement_id")
    .eq("user_id", userId);
  return (data ?? []).map((r) => r.achievement_id);
}

export async function sbUnlockAchievements(
  userId: string,
  ids: string[],
  titles: Record<string, string>
) {
  const supabase = await createClient();
  for (const id of ids) {
    await supabase.from("user_achievements").upsert(
      { user_id: userId, achievement_id: id, title: titles[id] ?? id },
      { onConflict: "user_id,achievement_id" }
    );
  }
}

export async function sbPostCommunity(userId: string, topic: string, content: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("community_posts")
    .insert({ user_id: userId, topic, content, is_anonymous: true })
    .select("id, topic, content, created_at")
    .single();
  return data;
}

export async function sbGetCommunity(topic?: string) {
  const supabase = await createClient();
  let query = supabase
    .from("community_posts")
    .select("id, topic, content, created_at")
    .order("created_at", { ascending: false })
    .limit(50);
  if (topic) query = query.eq("topic", topic);
  const { data } = await query;
  return data ?? [];
}

export async function sbSaveFutureSelf(userId: string, input: object, predictions: object) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("future_self_scenarios")
    .insert({ user_id: userId, input, predictions })
    .select()
    .single();
  return data;
}

export async function sbGetFutureSelfScenarios(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("future_self_scenarios")
    .select("id, input, predictions, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);
  return data ?? [];
}
