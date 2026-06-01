import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { isDemoMode } from "@/lib/demo/config";
import { demoSaveMoodLog } from "@/lib/demo/store";
import { createClient } from "@/lib/supabase/server";
import type { MoodType } from "@/types";

const VALID_MOODS: MoodType[] = ["happy", "calm", "neutral", "stressed", "sad"];

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { mood, note, loggedAt } = body as {
      mood: MoodType;
      note?: string;
      loggedAt?: string;
    };

    if (!mood || !VALID_MOODS.includes(mood)) {
      return NextResponse.json({ error: "Invalid mood" }, { status: 400 });
    }

    const date = loggedAt ?? new Date().toISOString().split("T")[0];

    if (isDemoMode()) {
      const data = demoSaveMoodLog(user.id, mood, note ?? null, date);
      return NextResponse.json({ moodLog: data });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("mood_logs")
      .upsert(
        {
          user_id: user.id,
          mood,
          note: note ?? null,
          logged_at: date,
        },
        { onConflict: "user_id,logged_at" }
      )
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ moodLog: data });
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
      const { demoGetMoodLogs } = await import("@/lib/demo/store");
      return NextResponse.json({ moods: demoGetMoodLogs(user.id) });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("mood_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("logged_at", { ascending: false })
      .limit(30);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ moods: data });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
