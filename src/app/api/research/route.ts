import { requireSession, jsonOk } from "@/lib/api/response";
import { getResearchDashboard } from "@/lib/data/upgrade-data";

export async function GET() {
  const { error } = await requireSession();
  if (error) return error;
  const dashboard = await getResearchDashboard();
  return jsonOk(dashboard);
}
