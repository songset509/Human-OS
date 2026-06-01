import { requireSession, jsonOk, jsonError } from "@/lib/api/response";
import { getVaultEntries, addVaultEntry } from "@/lib/data/v5-data";
import { vaultEntrySchema, parseBody } from "@/lib/validation/schemas";

export async function GET() {
  const { error } = await requireSession();
  if (error) return error;
  const entries = await getVaultEntries();
  return jsonOk({ entries });
}

export async function POST(request: Request) {
  const { error } = await requireSession();
  if (error) return error;
  const body = parseBody(vaultEntrySchema, await request.json());
  if ("error" in body) return jsonError(body.error);
  const entry = await addVaultEntry({
    type: body.data.type,
    title: body.data.title,
    content: body.data.content,
    tags: body.data.tags,
  });
  return jsonOk({ entry });
}
