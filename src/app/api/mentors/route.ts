import { requireSession, jsonOk, jsonError } from "@/lib/api/response";
import { getRateLimitKey, rateLimit } from "@/lib/security/rate-limit";
import OpenAI from "openai";
import { getUpgradeContext } from "@/lib/data/upgrade-data";
import { getAIMemoryContext, storeAIMemory } from "@/lib/data/v5-data";

const MENTORS: Record<string, string> = {
  psychology: "You are a psychology-informed mentor focused on emotional wellbeing and self-awareness.",
  career: "You are a career mentor focused on alignment, strengths, and professional growth.",
  productivity: "You are a productivity mentor focused on focus, habits, and attention health.",
  relationship: "You are a relationship mentor focused on communication, trust, and connection.",
  learning: "You are a learning mentor focused on curiosity, skill-building, and cognitive growth.",
  purpose: "You are a purpose mentor focused on meaning, values, and life direction.",
};

export async function POST(request: Request) {
  const { error } = await requireSession();
  if (error) return error;

  const rl = rateLimit(getRateLimitKey(request, "mentors"), 20, 60_000);
  if (!rl.allowed) return jsonError("Too many requests", 429);

  const { mentor, message } = (await request.json()) as { mentor: string; message: string };
  if (!mentor || !message?.trim()) return jsonError("Mentor and message required");

  const system = MENTORS[mentor] ?? MENTORS.psychology;
  const ctx = await getUpgradeContext();
  const memory = await getAIMemoryContext();

  const key = process.env.OPENAI_API_KEY?.trim();
  let reply: string;

  if (key && !key.includes("your_openai")) {
    const openai = new OpenAI({ apiKey: key });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: `${system}\n\nUser profile: Flourishing ${ctx?.flourishing.scores.overall ?? 50}/100. ${memory}` },
        { role: "user", content: message },
      ],
      max_tokens: 500,
    });
    reply = completion.choices[0]?.message?.content ?? "I'm here to help. Could you share more?";
  } else {
    reply = `As your ${mentor} mentor: Reflect on "${message.slice(0, 80)}..." — what small step aligns with your values today?`;
  }

  await storeAIMemory(`mentor_${mentor}`, { question: message, answer: reply.slice(0, 200) });
  return jsonOk({ reply, mentor });
}

export async function GET() {
  return jsonOk({ mentors: Object.keys(MENTORS) });
}
