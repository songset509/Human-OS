import { NextResponse } from "next/server";
import { getHPITrend, getUpgradeContext, recordHPIIfNeeded } from "@/lib/data/upgrade-data";
import { getSessionUser } from "@/lib/auth/session";
import { hpiToRadarData } from "@/lib/engines/hpi-engine";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const hpi = await recordHPIIfNeeded(user.id);
  const trend = await getHPITrend(user.id);
  const ctx = await getUpgradeContext();

  return NextResponse.json({
    hpi,
    radar: hpiToRadarData(hpi),
    trend,
    flourishing: ctx?.flourishing.scores,
  });
}
