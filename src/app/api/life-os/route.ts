import { requireSession, jsonOk, jsonError } from "@/lib/api/response";
import { getLifeOsData, updateLifeOsDimension } from "@/lib/data/v5-data";
import { lifeOsUpdateSchema, parseBody } from "@/lib/validation/schemas";

export async function GET() {
  const { user, error } = await requireSession();
  if (error) return error;
  const data = await getLifeOsData();
  return jsonOk({ ...data, userId: user!.id });
}

export async function PATCH(request: Request) {
  const { error } = await requireSession();
  if (error) return error;
  const body = parseBody(lifeOsUpdateSchema, await request.json());
  if ("error" in body) return jsonError(body.error);
  const result = await updateLifeOsDimension(body.data.dimension, body.data.score);
  return jsonOk(result);
}
