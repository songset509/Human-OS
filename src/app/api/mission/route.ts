import { requireSession, jsonOk } from "@/lib/api/response";
import { getMission } from "@/lib/data/v5-data";

export async function GET() {
  const { error } = await requireSession();
  if (error) return error;
  const mission = await getMission();
  return jsonOk({ mission });
}
