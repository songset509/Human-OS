import { requireSession, jsonOk } from "@/lib/api/response";
import { getBurnoutAnalysis } from "@/lib/data/v5-data";

export async function GET() {
  const { error } = await requireSession();
  if (error) return error;
  const analysis = await getBurnoutAnalysis();
  return jsonOk({ analysis });
}
