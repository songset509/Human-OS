import { requireSession, jsonOk } from "@/lib/api/response";
import { getMonthlyReport, getFutureRoadmap, getAnalyticsInsights } from "@/lib/data/v5-data";

export async function GET(request: Request) {
  const { error } = await requireSession();
  if (error) return error;
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") ?? "monthly";

  if (type === "roadmap") {
    return jsonOk({ roadmap: await getFutureRoadmap() });
  }
  if (type === "analytics") {
    return jsonOk({ insights: await getAnalyticsInsights() });
  }
  return jsonOk({ report: await getMonthlyReport() });
}
