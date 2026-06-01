"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Sparkles } from "lucide-react";
import type { HumanBlueprint } from "@/types";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function BlueprintPage() {
  const [blueprint, setBlueprint] = useState<HumanBlueprint | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/blueprint").then((r) => r.json()).then((d) => setBlueprint(d.blueprint));
  }, []);

  function exportPDF() {
    window.print();
  }

  if (!blueprint) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Human Blueprint" description="Your comprehensive personality and growth profile">
        <Button variant="secondary" size="sm" onClick={exportPDF}>
          <Download className="h-4 w-4" /> Export PDF
        </Button>
      </PageHeader>

      <div ref={printRef} className="print:p-8 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-violet-500/25 bg-gradient-to-br from-violet-600/15 via-zinc-900/80 to-teal-600/15 p-8 text-center glow"
        >
          <Badge variant="default" className="mb-4">Personality Archetype</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-50 mb-2">{blueprint.archetype}</h2>
          <p className="text-zinc-400 max-w-xl mx-auto">{blueprint.tagline}</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-emerald-400">Strengths</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {blueprint.strengths.map((s) => (
                  <li key={s} className="flex gap-2 text-sm text-zinc-300">
                    <Sparkles className="h-4 w-4 text-emerald-400 shrink-0" />{s}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-amber-400">Growth Areas</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {blueprint.growthAreas.map((g) => (
                  <li key={g} className="text-sm text-zinc-300">→ {g}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-rose-400">Risk Factors</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {blueprint.riskFactors.map((r) => (
                  <li key={r} className="text-sm text-zinc-300">⚠ {r}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-teal-400">Recommended Growth Path</CardTitle></CardHeader>
            <CardContent>
              <ol className="space-y-2 list-decimal list-inside">
                {blueprint.growthPath.map((p) => (
                  <li key={p} className="text-sm text-zinc-300">{p}</li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>

        <div className="text-center print:hidden">
          <Link href="/architect"><Button>Start Life Architect Plan</Button></Link>
        </div>
      </div>
    </div>
  );
}
