import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getSessionUser } from "@/lib/auth/session";
import { isDemoMode } from "@/lib/demo/config";
import { demoGetConversation, demoSaveConversation } from "@/lib/demo/store";
import { createClient } from "@/lib/supabase/server";
import { getUpgradeContext } from "@/lib/data/upgrade-data";
import { buildArchitectContext } from "@/lib/engines/life-architect-engine";
import { getAIMemoryContext, storeAIMemory } from "@/lib/data/v5-data";
import { rateLimit } from "@/lib/security/rate-limit";

const SYSTEM_PROMPT = `You are a compassionate, psychology-informed life coach for HumanOS — a platform designed for human flourishing, not digital addiction.

Your role:
- Help users reflect on loneliness, stress, confidence, relationships, focus, and digital wellness
- Ask thoughtful reflection questions to deepen self-awareness
- Suggest practical, small habits they can try
- Encourage growth with warmth and validation
- Use evidence-informed approaches (CBT-inspired reframing, mindfulness, behavioral activation)

Important boundaries:
- You are NOT a therapist and must NOT provide therapy, diagnosis, or medical advice
- If someone expresses crisis, self-harm, or severe distress, gently encourage them to reach out to a mental health professional or crisis helpline
- Keep responses concise (2-4 paragraphs max), warm, and actionable
- Never claim to diagnose conditions or replace professional care

Tone: Warm, grounded, like a wise friend who studied psychology — similar to Headspace meets a thoughtful coach.`;

function getOpenAIClient() {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key || key.includes("your_openai")) return null;
  return new OpenAI({ apiKey: key });
}

type ChatMsg = { role: "user" | "assistant"; content: string; timestamp: string };

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { message, conversationId, topic } = body as {
      message: string;
      conversationId?: string;
      topic?: string;
    };

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const limited = rateLimit(`coach:${user.id}`, 30, 60_000);
    if (!limited.allowed) {
      return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    let messages: ChatMsg[] = [];
    let convId = conversationId;

    if (isDemoMode()) {
      const conv = demoGetConversation(user.id);
      if (conv?.messages) messages = conv.messages as ChatMsg[];
      if (convId && conv?.id !== convId) messages = [];
    } else {
      const supabase = await createClient();
      if (convId) {
        const { data: conv } = await supabase
          .from("ai_conversations")
          .select("messages")
          .eq("id", convId)
          .eq("user_id", user.id)
          .single();
        if (conv?.messages) messages = conv.messages as ChatMsg[];
      }
    }

    const userMessage: ChatMsg = {
      role: "user",
      content: message,
      timestamp: new Date().toISOString(),
    };
    messages.push(userMessage);

    const openai = getOpenAIClient();
    let assistantContent: string;

    const ctx = await getUpgradeContext();
    const architectCtx = ctx
      ? buildArchitectContext(
          ctx.flourishing.scores,
          ctx.results,
          ctx.moods,
          `${ctx.challenges.filter((c) => c.is_active).length} active challenges`
        )
      : "";

    const memoryCtx = await getAIMemoryContext();

    if (openai) {
      const topicContext = topic
        ? `\n\nThe user wants to discuss: ${topic.replace("-", " ")}.`
        : "";

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              SYSTEM_PROMPT +
              topicContext +
              (architectCtx ? `\n\n${architectCtx}` : "") +
              (memoryCtx ? `\n\n${memoryCtx}` : ""),
          },
          ...messages.slice(-10).map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
        ],
        max_tokens: 600,
        temperature: 0.7,
      });

      assistantContent =
        completion.choices[0]?.message?.content ??
        "I'm here to support your growth. Could you tell me more about what's on your mind?";
    } else {
      assistantContent = getFallbackResponse(topic);
    }

    const assistantMessage: ChatMsg = {
      role: "assistant",
      content: assistantContent,
      timestamp: new Date().toISOString(),
    };
    messages.push(assistantMessage);

    await storeAIMemory("coach", { topic, user: message.slice(0, 200), reply: assistantContent.slice(0, 200) });

    if (isDemoMode()) {
      const conv = demoSaveConversation(user.id, messages, convId);
      convId = conv.id;
    } else {
      const supabase = await createClient();
      if (convId) {
        await supabase
          .from("ai_conversations")
          .update({ messages, updated_at: new Date().toISOString() })
          .eq("id", convId)
          .eq("user_id", user.id);
      } else {
        const { data: newConv } = await supabase
          .from("ai_conversations")
          .insert({ user_id: user.id, messages })
          .select("id")
          .single();
        convId = newConv?.id;
      }
    }

    return NextResponse.json({ message: assistantMessage, conversationId: convId });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function getFallbackResponse(topic?: string): string {
  const responses: Record<string, string> = {
    loneliness:
      "Feeling lonely is a deeply human experience — it signals our need for connection. Rather than judging this feeling, try asking: when do I feel most connected, even in small ways? One gentle step: reach out to one person today with a simple, genuine message.",
    stress:
      "Stress often tells us something matters to us. Before trying to eliminate it, pause and name what you're feeling in your body right now. A helpful habit: the 4-7-8 breath — inhale 4 counts, hold 7, exhale 8.",
    confidence:
      "Confidence grows through action, not affirmation alone. Think of one small thing you've done recently that took courage — however small. What would you tell a friend who shared your same doubt?",
    relationships:
      "Healthy relationships start with how we show up for ourselves. Reflect: what do you need most from your connections right now — to be heard, supported, or understood?",
    focus:
      "Digital distractions often fill space when we're avoiding discomfort. Try a 25-minute focused block with your phone in another room. How does your body feel before you start?",
    "digital-addiction":
      "You're not alone — our devices are designed to capture attention. Awareness is the first step toward change. What activities used to bring you joy before screens filled those gaps?",
  };

  if (topic && responses[topic]) return responses[topic];

  return `Thank you for sharing that with me. What you're experiencing matters, and taking time to reflect is already a meaningful step.

What would feeling even slightly better look like for you today? Remember, I'm here as a coach for reflection and growth — not as a replacement for professional support.`;
}

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (isDemoMode()) {
      const conv = demoGetConversation(user.id);
      return NextResponse.json({ conversation: conv });
    }

    const supabase = await createClient();
    const { data } = await supabase
      .from("ai_conversations")
      .select("id, messages, created_at, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(1)
      .single();

    return NextResponse.json({ conversation: data ?? null });
  } catch {
    return NextResponse.json({ conversation: null });
  }
}
