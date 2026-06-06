"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  MessageCircle,
  FileText,
  Orbit,
  BookOpen,
  Users,
  FlaskConical,
  Sparkles,
  Play,
  ArrowRight,
} from "lucide-react";

const modules = [
  {
    icon: LayoutDashboard,
    title: "Dashboard",
    summary: "Your flourishing command center — scores, trends, and next steps.",
    topics: ["Flourishing Score", "Dimension breakdown", "Quick actions"],
    href: "/getting-started",
  },
  {
    icon: MessageCircle,
    title: "AI Coach",
    summary: "Psychology-informed coaching that remembers your history.",
    topics: ["Starting conversations", "Reflection prompts", "Crisis boundaries"],
    href: "/coach",
  },
  {
    icon: FileText,
    title: "Life Blueprint",
    summary: "Strategic map of strengths, gaps, and growth priorities.",
    topics: ["Reading your blueprint", "HPI integration", "Action planning"],
    href: "/blueprint",
  },
  {
    icon: Orbit,
    title: "Future Self",
    summary: "Simulate where today's habits lead tomorrow.",
    topics: ["Scenario input", "Predictions", "Decision support"],
    href: "/future-self",
  },
  {
    icon: BookOpen,
    title: "Knowledge Vault",
    summary: "Second brain for notes, journals, and life plans.",
    topics: ["Adding entries", "Tags", "AI search (coming)"],
    href: "/vault",
  },
  {
    icon: Users,
    title: "Human Networks",
    summary: "Find accountability partners and growth circles.",
    topics: ["Connections", "Learning groups", "Mentor discovery"],
    href: "/community/networks",
  },
  {
    icon: FlaskConical,
    title: "Assessments",
    summary: "Human Intelligence Center — measure growth scientifically.",
    topics: ["Core vs advanced", "Trend analysis", "AI reports"],
    href: "/testing-hub",
  },
  {
    icon: Users,
    title: "Community",
    summary: "Growth circles, challenges, and shared wisdom.",
    topics: ["Posting", "Topics", "Anonymous support"],
    href: "/community",
  },
];

export default function AcademyPage() {
  return (
    <div className="min-h-screen bg-zinc-950 px-4 sm:px-6 py-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center gap-2 mb-8">
          <Link href="/" className="flex items-center gap-2 text-zinc-400 hover:text-zinc-100 text-sm">
            <Sparkles className="h-4 w-4 text-violet-400" />
            HumanOS
          </Link>
        </div>

        <PageHeader
          title="Learn HumanOS"
          description="Tutorial Academy — master every feature in your Life Operating System"
        />

        <Card className="mb-8 border-violet-500/20 bg-violet-500/5">
          <CardContent className="py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Play className="h-8 w-8 text-violet-400 shrink-0" />
              <div>
                <p className="font-medium text-zinc-100">Platform walkthrough</p>
                <p className="text-sm text-zinc-500 mt-1">
                  New here? Start with Getting Started, then explore each module below.
                </p>
              </div>
            </div>
            <Link href="/auth/signup">
              <Button>Create free account</Button>
            </Link>
          </CardContent>
        </Card>

        <div className="grid sm:grid-cols-2 gap-5">
          {modules.map((mod, i) => {
            const Icon = mod.icon;
            return (
              <motion.div
                key={mod.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="h-full hover:border-violet-500/30 transition-colors">
                  <CardHeader>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-600/10 text-violet-400 mb-2">
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg">{mod.title}</CardTitle>
                    <CardDescription>{mod.summary}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-xs text-zinc-500 space-y-1 mb-4">
                      {mod.topics.map((t) => (
                        <li key={t}>• {t}</li>
                      ))}
                    </ul>
                    <p className="text-[10px] uppercase tracking-wider text-zinc-600 mb-3">
                      FAQ & guides — sign in for interactive walkthroughs
                    </p>
                    <Link href={mod.href}>
                      <Button variant="secondary" size="sm" className="gap-1">
                        Explore <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
