import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { isDemoMode } from "@/lib/demo/config";
import { demoSaveAssessmentResult, demoAddTimelineEvent } from "@/lib/demo/store";
import { syncAchievements, recordHPIIfNeeded, addTimelineEvent } from "@/lib/data/upgrade-data";
import { scoreAssessment } from "@/lib/engines/advanced-scoring";
import { getQuestionsByAssessmentId } from "@/lib/assessments-data";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { assessmentId, answers } = body as {
      assessmentId: string;
      answers: Record<number, number>;
    };

    if (!assessmentId || !answers) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const questions = getQuestionsByAssessmentId(assessmentId);
    if (questions.length === 0) {
      return NextResponse.json({ error: "Invalid assessment" }, { status: 400 });
    }

    const { score, maxScore, normalizedScore, detailScores } = scoreAssessment(
      assessmentId,
      answers,
      questions
    );

    if (isDemoMode()) {
      const data = demoSaveAssessmentResult(user.id, {
        assessment_id: assessmentId,
        score,
        max_score: maxScore,
        normalized_score: normalizedScore,
        answers,
        detail_scores: detailScores,
      });
      demoAddTimelineEvent(user.id, {
        event_type: "assessment",
        title: `Completed ${assessmentId}`,
        value: normalizedScore,
        recorded_at: new Date().toISOString(),
      });
      await syncAchievements(user.id);
      await recordHPIIfNeeded(user.id);
      return NextResponse.json({ result: data, score: normalizedScore, detailScores });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("assessment_results")
      .insert({
        user_id: user.id,
        assessment_id: assessmentId,
        score,
        max_score: maxScore,
        normalized_score: normalizedScore,
        answers,
        detail_scores: detailScores,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await syncAchievements(user.id);
    await recordHPIIfNeeded(user.id);
    await addTimelineEvent(user.id, {
      event_type: "assessment",
      title: `Completed ${assessmentId}`,
      value: normalizedScore,
    });

    return NextResponse.json({ result: data, score: normalizedScore, detailScores });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (isDemoMode()) {
      const { demoGetAssessmentResults } = await import("@/lib/demo/store");
      return NextResponse.json({ results: demoGetAssessmentResults(user.id) });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("assessment_results")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ results: data });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
