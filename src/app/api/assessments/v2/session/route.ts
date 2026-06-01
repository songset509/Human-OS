import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import {
  getOrCreateAssessmentSession,
  submitAssessmentSessionBatch,
} from "@/lib/data/assessment-v2-data";

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const assessmentId = searchParams.get("assessmentId");
  if (!assessmentId) {
    return NextResponse.json({ error: "assessmentId required" }, { status: 400 });
  }

  const session = await getOrCreateAssessmentSession(assessmentId);
  if (!session) return NextResponse.json({ error: "Could not start session" }, { status: 500 });

  return NextResponse.json({ session, engine: "v2" });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { sessionId, answers } = body as {
    sessionId: string;
    answers: Record<number, number>;
  };

  if (!sessionId || !answers) {
    return NextResponse.json({ error: "sessionId and answers required" }, { status: 400 });
  }

  const result = await submitAssessmentSessionBatch(sessionId, answers);
  if (!result) return NextResponse.json({ error: "Session not found" }, { status: 404 });

  return NextResponse.json(result);
}
