import { NextResponse } from "next/server";
import { getUpgradeContext, recordHPIIfNeeded, syncAchievements } from "@/lib/data/upgrade-data";
import { getSessionUser } from "@/lib/auth/session";
import { isDemoMode } from "@/lib/demo/config";
import { demoGetHPISnapshots } from "@/lib/demo/store";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ctx = await getUpgradeContext();
  if (!ctx) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await syncAchievements(user.id);
  const hpi = await recordHPIIfNeeded(user.id);
  const trend = isDemoMode() ? demoGetHPISnapshots(user.id) : [];

  return NextResponse.json({
    blueprint: ctx.blueprint,
    hpi,
    achievements: ctx.achievements,
    hpiTrend: trend,
  });
}
