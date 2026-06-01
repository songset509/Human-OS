import { requireSession, jsonOk } from "@/lib/api/response";
import { getHumanCapital } from "@/lib/data/v5-data";

export async function GET() {
  const { error } = await requireSession();
  if (error) return error;
  const capital = await getHumanCapital();
  return jsonOk({ capital });
}
