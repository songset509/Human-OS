import { NextResponse } from "next/server";
import { getFutureSelfWithConfidence } from "@/lib/data/assessment-v2-data";
import { getSessionUser } from "@/lib/auth/session";
import type { FutureSelfInput } from "@/types";

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const input = (await request.json()) as FutureSelfInput;
  if (!input.habits || !input.goals) {
    return NextResponse.json({ error: "Habits and goals required" }, { status: 400 });
  }

  const result = await getFutureSelfWithConfidence(input);
  if (!result?.scenario) return NextResponse.json({ error: "Simulation failed" }, { status: 500 });
  return NextResponse.json({ scenario: result.scenario, confidence: result.confidence });
}
