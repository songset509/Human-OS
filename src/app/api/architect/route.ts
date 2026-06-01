import { NextResponse } from "next/server";
import { getLifeArchitectPlan, getUpgradeContext } from "@/lib/data/upgrade-data";
import { getSessionUser } from "@/lib/auth/session";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const plan = await getLifeArchitectPlan();
  const ctx = await getUpgradeContext();
  return NextResponse.json({ plan, scores: ctx?.flourishing.scores });
}
