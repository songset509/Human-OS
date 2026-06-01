"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const TOPICS = ["loneliness", "confidence", "productivity", "relationships", "career", "purpose"];

export default function CommunityPage() {
  const [topic, setTopic] = useState("loneliness");
  const [posts, setPosts] = useState<{ id: string; topic: string; content: string; created_at: string }[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/community?topic=${topic}`).then((r) => r.json()).then((d) => setPosts(d.posts ?? []));
  }, [topic]);

  async function post() {
    if (!content.trim()) return;
    setLoading(true);
    await fetch("/api/community", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, content }),
    });
    setContent("");
    const res = await fetch(`/api/community?topic=${topic}`);
    const data = await res.json();
    setPosts(data.posts ?? []);
    setLoading(false);
  }

  return (
    <div>
      <PageHeader
        title="Growth Circles"
        description="Anonymous communities focused on support, learning, and growth — no likes, no followers"
      />

      <div className="flex flex-wrap gap-2 mb-6">
        {TOPICS.map((t) => (
          <button
            key={t}
            onClick={() => setTopic(t)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-xs capitalize transition-all",
              topic === t ? "border-violet-500/50 bg-violet-500/10 text-violet-300" : "border-white/10 text-zinc-400 hover:bg-white/5"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6 space-y-3">
          <Badge variant="secondary">Anonymous post</Badge>
          <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Share support, ask a question, or offer wisdom..." />
          <Button onClick={post} disabled={loading || !content.trim()}>{loading ? "Posting..." : "Share anonymously"}</Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {posts.length === 0 ? (
          <p className="text-center text-zinc-500 py-8">Be the first to share in this circle.</p>
        ) : (
          posts.map((p) => (
            <Card key={p.id}>
              <CardContent className="pt-4">
                <p className="text-sm text-zinc-300 leading-relaxed">{p.content}</p>
                <p className="text-[10px] text-zinc-600 mt-2">{new Date(p.created_at).toLocaleDateString()}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
