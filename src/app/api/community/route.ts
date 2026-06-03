import { NextResponse } from "next/server";
import { getCommunityMessages, postCommunityMessage } from "@/lib/data/upgrade-data";
import { requireSession } from "@/lib/api/response";

const TOPICS = ["loneliness", "confidence", "productivity", "relationships", "career", "purpose"];

export async function GET(request: Request) {
  const session = await requireSession();
  if (session.error) return session.error;

  const { searchParams } = new URL(request.url);
  const topic = searchParams.get("topic") ?? undefined;
  const posts = await getCommunityMessages(topic);
  return NextResponse.json({ posts, topics: TOPICS });
}

export async function POST(request: Request) {
  const session = await requireSession();
  if (session.error) return session.error;

  const { topic, content } = (await request.json()) as { topic: string; content: string };
  if (!topic || !content?.trim()) {
    return NextResponse.json({ error: "Topic and content required" }, { status: 400 });
  }

  const post = await postCommunityMessage(topic, content.trim());
  return NextResponse.json({ post });
}
