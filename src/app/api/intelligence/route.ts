import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { runUserIntelligence, getLatestIntelligence } from "@/lib/data/assessment-v2-data";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const snapshot = await getLatestIntelligence();
  return NextResponse.json({ snapshot });
}

export async function POST() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const snapshot = await runUserIntelligence();
  return NextResponse.json({ snapshot });
}
