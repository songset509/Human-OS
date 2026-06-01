import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { isDemoMode } from "@/lib/demo/config";
import {
  demoFindActiveChallenge,
  demoGetChallengeProgress,
  demoSaveChallengeProgress,
} from "@/lib/demo/store";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { challengeId, action, day } = body as {
      challengeId: string;
      action: "start" | "complete_day";
      day?: number;
    };

    if (!challengeId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (isDemoMode()) {
      if (action === "start") {
        const existing = demoFindActiveChallenge(user.id, challengeId);
        if (existing) return NextResponse.json({ progress: existing });

        const progress = demoSaveChallengeProgress(user.id, {
          id: randomUUID(),
          user_id: user.id,
          challenge_id: challengeId,
          completed_days: [],
          streak: 0,
          started_at: new Date().toISOString(),
          completed_at: null,
          is_active: true,
        });
        return NextResponse.json({ progress });
      }

      if (action === "complete_day" && day !== undefined) {
        const progress = demoFindActiveChallenge(user.id, challengeId);
        if (!progress) {
          return NextResponse.json({ error: "Challenge not started" }, { status: 404 });
        }

        const completedDays = [...(progress.completed_days ?? [])];
        if (!completedDays.includes(day)) {
          completedDays.push(day);
          completedDays.sort((a, b) => a - b);
        }

        let streak = 1;
        for (let i = completedDays.length - 1; i > 0; i--) {
          if (completedDays[i] === completedDays[i - 1] + 1) streak++;
          else break;
        }

        const isComplete = completedDays.length >= 7;
        const updated = demoSaveChallengeProgress(user.id, {
          ...progress,
          completed_days: completedDays,
          streak,
          is_active: !isComplete,
          completed_at: isComplete ? new Date().toISOString() : null,
        });
        return NextResponse.json({ progress: updated });
      }

      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const supabase = await createClient();

    if (action === "start") {
      const { data: existing } = await supabase
        .from("challenge_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("challenge_id", challengeId)
        .eq("is_active", true)
        .single();

      if (existing) return NextResponse.json({ progress: existing });

      const { data, error } = await supabase
        .from("challenge_progress")
        .insert({
          user_id: user.id,
          challenge_id: challengeId,
          completed_days: [],
          streak: 0,
          is_active: true,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ progress: data });
    }

    if (action === "complete_day" && day !== undefined) {
      const { data: progress } = await supabase
        .from("challenge_progress")
        .select("*")
        .eq("user_id", user.id)
        .eq("challenge_id", challengeId)
        .eq("is_active", true)
        .single();

      if (!progress) {
        return NextResponse.json({ error: "Challenge not started" }, { status: 404 });
      }

      const completedDays: number[] = progress.completed_days ?? [];
      if (!completedDays.includes(day)) {
        completedDays.push(day);
        completedDays.sort((a, b) => a - b);
      }

      let streak = 1;
      for (let i = completedDays.length - 1; i > 0; i--) {
        if (completedDays[i] === completedDays[i - 1] + 1) streak++;
        else break;
      }

      const isComplete = completedDays.length >= 7;

      const { data, error } = await supabase
        .from("challenge_progress")
        .update({
          completed_days: completedDays,
          streak,
          is_active: !isComplete,
          completed_at: isComplete ? new Date().toISOString() : null,
        })
        .eq("id", progress.id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ progress: data });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
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
      return NextResponse.json({ progress: demoGetChallengeProgress(user.id) });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("challenge_progress")
      .select("*")
      .eq("user_id", user.id)
      .order("started_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ progress: data });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
