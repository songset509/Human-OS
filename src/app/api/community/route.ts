import { NextResponse } from "next/server";
import { getCommunityMessages, postCommunityMessage } from "@/lib/data/upgrade-data";
import { getSessionUser } from "@/lib/auth/session";

const TOPICS = ["loneliness", "confidence", "productivity", "relationships", "career", "purpose"];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const topic = searchParams.get("topic") ?? undefined;
  const posts = await getCommunityMessages(topic);
  return NextResponse.json({ posts, topics: TOPICS });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { topic, content } = (await request.json()) as { topic: string; content: string };
  if (!topic || !content?.trim()) {
    return NextResponse.json({ error: "Topic and content required" }, { status: 400 });
  }

  const post = await postCommunityMessage(topic, content.trim());
  return NextResponse.json({ post });
}
