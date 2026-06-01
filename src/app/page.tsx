import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Heart,
  Brain,
  Shield,
  Users,
  Smartphone,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const features = [
  {
    icon: Heart,
    title: "Emotional Intelligence",
    description: "Understand and manage your emotions with science-backed assessments.",
  },
  {
    icon: Brain,
    title: "Mindfulness & Awareness",
    description: "Track moods, build habits, and cultivate present-moment awareness.",
  },
  {
    icon: Shield,
    title: "Resilience Building",
    description: "Develop the strength to bounce back from life's challenges.",
  },
  {
    icon: Users,
    title: "Social Connection",
    description: "Strengthen relationships and combat loneliness with guided challenges.",
  },
  {
    icon: Smartphone,
    title: "Digital Wellness",
    description: "Create healthier boundaries with technology and reduce digital addiction.",
  },
  {
    icon: Sparkles,
    title: "AI Life Coach",
    description: "Get psychology-informed guidance for reflection and personal growth.",
  },
];

const scores = [
  "Human Flourishing Score",
  "Emotional Health",
  "Self-Esteem",
  "Resilience",
  "Mindfulness",
  "Social Connection",
  "Digital Wellness",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Nav */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-teal-500">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-zinc-50">HumanOS</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(139,92,246,0.15),transparent_50%)]" />
        <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-violet-600/10 blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-teal-600/10 blur-3xl animate-float" style={{ animationDelay: "3s" }} />

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm text-violet-300 mb-8">
            <Sparkles className="h-3.5 w-3.5" />
            AI-Powered Human Development
          </div>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-zinc-50 leading-[1.1]">
            Designed for{" "}
            <span className="gradient-text">Human Flourishing</span>
            <br />
            Not Digital Addiction
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Improve emotional well-being, self-awareness, resilience, relationships,
            mindfulness, and digital wellness — all in one beautiful platform.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/signup">
              <Button size="lg" className="w-full sm:w-auto">
                Start Your Journey
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Scores preview */}
      <section className="py-16 px-4 sm:px-6 border-y border-white/5">
        <div className="mx-auto max-w-6xl">
          <p className="text-center text-sm text-zinc-500 mb-8 uppercase tracking-wider">
            Track what matters
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {scores.map((score) => (
              <span
                key={score}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-300"
              >
                {score}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-50">
              Everything you need to flourish
            </h2>
            <p className="mt-4 text-zinc-400 max-w-xl mx-auto">
              A comprehensive toolkit for personal growth, backed by psychology
              and powered by AI.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group rounded-2xl border border-white/8 bg-zinc-900/40 p-6 hover:border-violet-500/30 hover:bg-zinc-900/60 transition-all duration-300"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-600/10 text-violet-400 mb-4 group-hover:bg-violet-600/20 transition-colors">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-zinc-100 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 sm:px-6">
        <div className="mx-auto max-w-3xl rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-600/10 to-teal-600/10 p-8 sm:p-12 text-center glow">
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-50 mb-4">
            Begin your flourishing journey today
          </h2>
          <p className="text-zinc-400 mb-8">
            Join HumanOS and discover a healthier relationship with yourself and technology.
          </p>
          <ul className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-8 text-sm text-zinc-300">
            {["Free assessments", "AI life coach", "Mood tracking", "Growth challenges"].map(
              (item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-teal-400" />
                  {item}
                </li>
              )
            )}
          </ul>
          <Link href="/auth/signup">
            <Button size="lg">
              Create Free Account
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-teal-500">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm text-zinc-400">HumanOS © 2026</span>
          </div>
          <p className="text-xs text-zinc-600 text-center">
            HumanOS is not a substitute for professional mental health care.
          </p>
        </div>
      </footer>
    </div>
  );
}
