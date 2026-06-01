import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { isDemoMode } from "@/lib/demo/config";
import {
  demoGetAssessmentResults,
  demoGetMoodLogs,
} from "@/lib/demo/store";
import {
  calculateFlourishingScores,
  generateInsights,
} from "@/lib/flourishing-engine";
import { saveInsight } from "@/lib/data/user-data";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (isDemoMode()) {
      const results = demoGetAssessmentResults(user.id);
      const moods = demoGetMoodLogs(user.id, 14);
      const scores = calculateFlourishingScores(results, moods);
      const insight = generateInsights(scores);
      return NextResponse.json({ scores, insight });
    }

    const supabase = await createClient();
    const [resultsRes, moodsRes, savedInsight] = await Promise.all([
      supabase
        .from("assessment_results")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("mood_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("logged_at", { ascending: false })
        .limit(14),
      supabase
        .from("insights")
        .select("*")
        .eq("user_id", user.id)
        .order("generated_at", { ascending: false })
        .limit(1)
        .single(),
    ]);

    const results = resultsRes.data ?? [];
    const moods = moodsRes.data ?? [];
    const scores = calculateFlourishingScores(results, moods);
    const insight = generateInsights(scores);

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const shouldRegenerate =
      !savedInsight.data ||
      new Date(savedInsight.data.generated_at) < oneDayAgo;

    if (shouldRegenerate) {
      await saveInsight({ scores, insight, generatedAt: new Date().toISOString() });
    }

    return NextResponse.json({ scores, insight });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST() {
  return GET();
}
