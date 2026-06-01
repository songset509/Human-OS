"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const MENTORS = [
  { id: "psychology", label: "Psychology" },
  { id: "career", label: "Career" },
  { id: "productivity", label: "Productivity" },
  { id: "relationship", label: "Relationship" },
  { id: "learning", label: "Learning" },
  { id: "purpose", label: "Purpose" },
];

export default function MentorsPage() {
  const [mentor, setMentor] = useState("psychology");
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function ask() {
    setLoading(true);
    const res = await fetch("/api/mentors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mentor, message }),
    });
    const data = await res.json();
    setReply(data.reply ?? data.error);
    setLoading(false);
  }

  return (
    <div>
      <PageHeader title="AI Mentors" description="Specialized mentors with shared memory context" />
      <div className="flex flex-wrap gap-2 mb-4">
        {MENTORS.map((m) => (
          <button
            key={m.id}
            onClick={() => setMentor(m.id)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-xs transition-all",
              mentor === m.id ? "border-violet-500/50 bg-violet-500/10 text-violet-300" : "border-white/10 text-zinc-400"
            )}
          >
            {m.label}
          </button>
        ))}
      </div>
      <Card>
        <CardContent className="pt-6 space-y-4">
          <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Ask your mentor..." rows={3} />
          <Button onClick={ask} disabled={loading || !message.trim()}>{loading ? "Thinking..." : "Ask Mentor"}</Button>
          {reply && <div className="rounded-xl border border-white/8 bg-white/5 p-4 text-sm text-zinc-300">{reply}</div>}
        </CardContent>
      </Card>
    </div>
  );
}
