"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  ArrowRight,
  Play,
  Brain,
  MessageCircle,
  Orbit,
  FileText,
  BookOpen,
  Users,
  FlaskConical,
  ChevronRight,
} from "lucide-react";
import { AiBrainVisual } from "./ai-brain-visual";

const journey = [
  { label: "Understand", desc: "Know yourself deeply" },
  { label: "Plan", desc: "Design your life blueprint" },
  { label: "Learn", desc: "Build knowledge in your Vault" },
  { label: "Grow", desc: "Track measurable progress" },
  { label: "Connect", desc: "Find your growth network" },
  { label: "Achieve", desc: "Become your best self" },
];

const pillars = [
  {
    icon: MessageCircle,
    title: "AI Coach",
    desc: "Personal guidance based on your history, goals, and growth patterns.",
  },
  {
    icon: Orbit,
    title: "Future Self",
    desc: "See where your current decisions lead — before you commit.",
  },
  {
    icon: FileText,
    title: "Life Blueprint",
    desc: "A strategic roadmap built from your assessments and aspirations.",
  },
  {
    icon: BookOpen,
    title: "Knowledge Vault",
    desc: "Your second brain — notes, journals, research, and life plans.",
  },
  {
    icon: Users,
    title: "Human Networks",
    desc: "Connect with people who accelerate your growth.",
  },
  {
    icon: FlaskConical,
    title: "Assessment Intelligence",
    desc: "Measure growth scientifically with trends and AI reports.",
  },
];

const steps = [
  "Take Assessments",
  "Build Profile",
  "Generate Blueprint",
  "Receive AI Guidance",
  "Track Growth",
  "Become Your Best Self",
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.5 },
};

export function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 overflow-x-hidden">
      <header className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-teal-500">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold">HumanOS</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-zinc-400">
            <a href="#what" className="hover:text-zinc-100 transition-colors">What is HumanOS</a>
            <a href="#pillars" className="hover:text-zinc-100 transition-colors">Platform</a>
            <a href="#how" className="hover:text-zinc-100 transition-colors">How it works</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm">Start free</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-28 pb-16 lg:pt-32 lg:pb-24 px-4 sm:px-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.12),transparent_55%)]" />
        <div className="relative mx-auto max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
          <motion.div {...fadeUp}>
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-300 mb-6">
              <Brain className="h-3.5 w-3.5" />
              AI-Powered Life Operating System
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.08]">
              Build the Best Version of{" "}
              <span className="gradient-text">Yourself</span> with AI
            </h1>
            <p className="mt-6 text-lg text-zinc-400 leading-relaxed max-w-xl">
              HumanOS is an AI-powered Life Operating System that helps you understand
              yourself, build better habits, discover your strengths, track growth, and
              achieve long-term goals — in one connected ecosystem.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/auth/signup">
                <Button size="lg" className="gap-2">
                  Start Your Human Journey
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/academy">
                <Button variant="secondary" size="lg" className="gap-2">
                  <Play className="h-4 w-4" />
                  Watch Demo
                </Button>
              </Link>
            </div>
            <p className="mt-6 text-xs text-zinc-600">
              After signup: core assessment → blueprint → AI coach → your first insight
            </p>
          </motion.div>
          <motion.div {...fadeUp} transition={{ delay: 0.15, duration: 0.5 }}>
            <AiBrainVisual />
          </motion.div>
        </div>
      </section>

      {/* What is HumanOS */}
      <section id="what" className="py-20 px-4 sm:px-6 border-y border-white/5">
        <div className="mx-auto max-w-6xl">
          <motion.div className="text-center mb-14" {...fadeUp}>
            <h2 className="text-3xl sm:text-4xl font-bold">What is HumanOS?</h2>
            <p className="mt-4 text-zinc-400 max-w-2xl mx-auto">
              Not another productivity app. A personal operating system for human growth —
              combining assessments, AI coaching, knowledge, and community.
            </p>
          </motion.div>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-0 sm:flex-nowrap items-center">
            {journey.map((item, i) => (
              <motion.div
                key={item.label}
                className="flex items-center"
                {...fadeUp}
                transition={{ delay: i * 0.08 }}
              >
                <div className="text-center px-3 sm:px-4 py-4 rounded-2xl border border-white/8 bg-zinc-900/40 min-w-[100px]">
                  <p className="font-semibold text-violet-300 text-sm">{item.label}</p>
                  <p className="text-[10px] text-zinc-500 mt-1 hidden sm:block">{item.desc}</p>
                </div>
                {i < journey.length - 1 && (
                  <ChevronRight className="h-4 w-4 text-zinc-600 hidden sm:block shrink-0" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section id="pillars" className="py-20 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <motion.div className="text-center mb-14" {...fadeUp}>
            <h2 className="text-3xl sm:text-4xl font-bold">Your AI Life Operating System</h2>
            <p className="mt-4 text-zinc-400">Six pillars. One ecosystem. Infinite growth.</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {pillars.map((p, i) => {
              const Icon = p.icon;
              return (
                <motion.div
                  key={p.title}
                  className="rounded-2xl border border-white/8 bg-zinc-900/40 p-6 hover:border-violet-500/30 transition-colors"
                  {...fadeUp}
                  transition={{ delay: i * 0.06 }}
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600/10 text-violet-400 mb-4">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{p.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">{p.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-20 px-4 sm:px-6 border-t border-white/5 bg-zinc-900/20">
        <div className="mx-auto max-w-3xl">
          <motion.div className="text-center mb-12" {...fadeUp}>
            <h2 className="text-3xl sm:text-4xl font-bold">How HumanOS Works</h2>
          </motion.div>
          <div className="space-y-0">
            {steps.map((step, i) => (
              <motion.div
                key={step}
                className="flex gap-4 items-start"
                {...fadeUp}
                transition={{ delay: i * 0.07 }}
              >
                <div className="flex flex-col items-center">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-600/20 text-violet-300 text-sm font-bold border border-violet-500/30">
                    {i + 1}
                  </div>
                  {i < steps.length - 1 && (
                    <div className="w-px h-10 bg-gradient-to-b from-violet-500/40 to-transparent my-1" />
                  )}
                </div>
                <div className="pb-8 pt-2">
                  <p className="font-medium text-zinc-100">{step}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6">
        <motion.div
          className="mx-auto max-w-3xl rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-600/10 to-teal-600/10 p-10 text-center glow"
          {...fadeUp}
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Your operating system for human growth starts here
          </h2>
          <p className="text-zinc-400 mb-8 max-w-lg mx-auto">
            Join HumanOS — where Notion meets personal coach meets life architect,
            powered by AI that remembers your journey.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" className="gap-2">
              Start Your Human Journey
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </section>

      <footer className="border-t border-white/5 py-8 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
          <span>HumanOS © 2026 — AI-Powered Life Operating System</span>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-zinc-300">Privacy</Link>
            <Link href="/academy" className="hover:text-zinc-300">Academy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
