import { requireSession, jsonOk, jsonError } from "@/lib/api/response";
import { getRelationships, addRelationship } from "@/lib/data/v5-data";
import { relationshipNodeSchema, parseBody } from "@/lib/validation/schemas";

export async function GET() {
  const { error } = await requireSession();
  if (error) return error;
  const nodes = await getRelationships();
  const healthScore = nodes.length
    ? Math.round(nodes.reduce((s, n) => s + n.strength, 0) / nodes.length / 5 * 100)
    : 50;
  return jsonOk({ nodes, healthScore });
}

export async function POST(request: Request) {
  const { error } = await requireSession();
  if (error) return error;
  const body = parseBody(relationshipNodeSchema, await request.json());
  if ("error" in body) return jsonError(body.error);
  const node = await addRelationship(body.data);
  return jsonOk({ node });
}
