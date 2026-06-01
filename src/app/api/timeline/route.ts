import { NextResponse } from "next/server";
import { getGrowthTimeline } from "@/lib/data/upgrade-data";
import { getSessionUser } from "@/lib/auth/session";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const events = await getGrowthTimeline();
  return NextResponse.json({ events });
}
