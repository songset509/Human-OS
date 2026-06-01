"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { LoadingState, ErrorState, EmptyState } from "@/components/shared/async-state";
import { useFetch } from "@/hooks/use-fetch";

export default function VaultPage() {
  const { data, loading, error, refetch } = useFetch<{ entries: { id: string; type: string; title: string; content: string; created_at: string }[] }>("/api/vault");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    await fetch("/api/vault", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "journal", title, content }),
    });
    setTitle("");
    setContent("");
    refetch();
    setSaving(false);
  }

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const entries = data?.entries ?? [];

  return (
    <div>
      <PageHeader title="Knowledge Vault" description="Journals, reflections, lessons, and personal insights" />
      <Card className="mb-6">
        <CardContent className="pt-6 space-y-3">
          <div><Label>Title</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1" /></div>
          <div><Label>Content</Label><Textarea value={content} onChange={(e) => setContent(e.target.value)} className="mt-1" rows={4} /></div>
          <Button onClick={save} disabled={saving || !title || !content}>{saving ? "Saving..." : "Add Entry"}</Button>
        </CardContent>
      </Card>
      {entries.length === 0 ? (
        <EmptyState title="Vault is empty" description="Start journaling to build your personal knowledge base." />
      ) : (
        <div className="space-y-3">
          {entries.map((e) => (
            <Card key={e.id}>
              <CardContent className="pt-4">
                <p className="font-medium text-zinc-200">{e.title}</p>
                <p className="text-sm text-zinc-400 mt-1">{e.content}</p>
                <p className="text-xs text-zinc-600 mt-2">{new Date(e.created_at).toLocaleDateString()}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
