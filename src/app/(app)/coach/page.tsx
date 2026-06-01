"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { COACH_TOPICS } from "@/lib/constants";
import type { ChatMessage } from "@/types";
import {
  Send,
  Sparkles,
  Users,
  CloudRain,
  Target,
  Smartphone,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";

const topicIcons: Record<string, React.ElementType> = {
  loneliness: Users,
  stress: CloudRain,
  confidence: Sparkles,
  relationships: Heart,
  focus: Target,
  "digital-addiction": Smartphone,
};

export default function CoachPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [selectedTopic, setSelectedTopic] = useState<string | undefined>();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const res = await fetch("/api/coach");
      const data = await res.json();
      if (cancelled) return;
      if (data.conversation?.messages) {
        setMessages(data.conversation.messages);
        setConversationId(data.conversation.id);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text?: string) {
    const messageText = text ?? input.trim();
    if (!messageText || loading) return;

    setInput("");
    setLoading(true);

    const userMsg: ChatMessage = {
      role: "user",
      content: messageText,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText,
          conversationId,
          topic: selectedTopic,
        }),
      });

      const data = await res.json();
      if (data.message) {
        setMessages((prev) => [...prev, data.message]);
        if (data.conversationId) setConversationId(data.conversationId);
      }
    } finally {
      setLoading(false);
    }
  }

  function selectTopic(topicId: string) {
    setSelectedTopic(topicId);
    const topic = COACH_TOPICS.find((t) => t.id === topicId);
    if (topic) {
      sendMessage(`I'd like to talk about ${topic.label.toLowerCase()}.`);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <PageHeader
        title="AI Life Coach"
        description="Psychology-informed guidance for reflection and growth — not therapy"
      />

      <div className="flex flex-wrap gap-2 mb-4">
        {COACH_TOPICS.map((topic) => {
          const Icon = topicIcons[topic.id] ?? Sparkles;
          return (
            <button
              key={topic.id}
              onClick={() => selectTopic(topic.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-all",
                selectedTopic === topic.id
                  ? "border-violet-500/50 bg-violet-500/10 text-violet-300"
                  : "border-white/10 bg-white/5 text-zinc-400 hover:border-white/20"
              )}
            >
              <Icon className="h-3 w-3" />
              {topic.label}
            </button>
          );
        })}
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden border-white/8">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-600/10 mb-4">
                <Sparkles className="h-7 w-7 text-violet-400" />
              </div>
              <h3 className="text-lg font-medium text-zinc-200 mb-2">
                Your AI Life Coach is here
              </h3>
              <p className="text-sm text-zinc-500 max-w-sm mb-6">
                Share what&apos;s on your mind. I&apos;ll help you reflect, suggest habits,
                and encourage self-awareness — without providing therapy or diagnosis.
              </p>
              <Badge variant="secondary" className="text-xs">
                Select a topic above or type a message below
              </Badge>
            </div>
          )}

          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  msg.role === "user"
                    ? "bg-violet-600/20 border border-violet-500/30 text-zinc-100"
                    : "bg-white/5 border border-white/8 text-zinc-300"
                )}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl px-4 py-3 bg-white/5 border border-white/8">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-2 w-2 rounded-full bg-violet-400 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-white/8 p-4">
          <div className="flex gap-3">
            <Textarea
              placeholder="Share what's on your mind..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              className="min-h-[44px] max-h-32 resize-none"
              rows={1}
            />
            <Button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              size="icon"
              className="shrink-0 h-11 w-11"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-[10px] text-zinc-600 mt-2 text-center">
            HumanOS AI Coach is not a substitute for professional mental health care.
          </p>
        </div>
      </Card>
    </div>
  );
}
