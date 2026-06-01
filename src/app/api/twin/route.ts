import { NextResponse } from "next/server";
import { getUpgradeContext } from "@/lib/data/upgrade-data";
import { getTwinWithConfidence } from "@/lib/data/assessment-v2-data";
import { storeAIMemory } from "@/lib/data/v5-data";
import { answerBestSelfQuestion } from "@/lib/engines/digital-twin-engine";
import { getSessionUser } from "@/lib/auth/session";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await getTwinWithConfidence();
  if (!data) return NextResponse.json({ error: "Profile incomplete" }, { status: 400 });
  return NextResponse.json({ twin: data.twin, confidence: data.confidence });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { question, mode } = (await request.json()) as { question: string; mode?: string };
  const ctx = await getUpgradeContext();
  const data = await getTwinWithConfidence();
  if (!ctx || !data) return NextResponse.json({ error: "Profile incomplete" }, { status: 400 });

  const { twin, confidence } = data;

  if (confidence.level === "low") {
    return NextResponse.json({
      answer:
        "I don't have enough data to answer confidently yet. Complete more assessments, log mood, and add journal entries — then ask again. " +
        confidence.reason,
      confidence,
    });
  }

  let q = question;
  if (mode === "future") q = "What would my future self do? " + question;
  if (mode === "values") q = "What decision aligns with my values? " + question;
  if (mode === "habit") q = "What habit would have the highest impact? " + question;

  const answer = answerBestSelfQuestion(q, twin, ctx.blueprint);
  await storeAIMemory("twin_query", { question: q, answer: answer.slice(0, 300) });
  return NextResponse.json({ answer, confidence });
}
