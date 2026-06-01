"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  ClipboardList,
  Smile,
  Trophy,
  MessageCircle,
  Lightbulb,
  User,
  Menu,
  X,
  Sparkles,
  FileText,
  Gauge,
  Orbit,
  Compass,
  Clock,
  Users,
  Bot,
  Award,
  BarChart3,
  FlaskConical,
  AlertCircle,
  Download,
  TrendingUp,
  Brain,
  Shield,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navGroups = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/potential", label: "Human Potential", icon: Gauge },
      { href: "/blueprint", label: "Human Blueprint", icon: FileText },
      { href: "/timeline", label: "Growth Timeline", icon: Clock },
    ],
  },
  {
    label: "Assess & Track",
    items: [
      { href: "/testing-hub", label: "Testing Hub", icon: FlaskConical },
      { href: "/assessments", label: "Core Assessments", icon: ClipboardList },
      { href: "/mood", label: "Mood", icon: Smile },
      { href: "/results", label: "Results", icon: BarChart3 },
    ],
  },
  {
    label: "Growth",
    items: [
      { href: "/challenges", label: "Challenges", icon: Trophy },
      { href: "/architect", label: "Life Architect", icon: Compass },
      { href: "/coach", label: "AI Coach", icon: MessageCircle },
      { href: "/future-self", label: "Future Self", icon: Orbit },
      { href: "/twin", label: "Digital Twin", icon: Bot },
    ],
  },
  {
    label: "Life OS V5",
    items: [
      { href: "/life-os", label: "Life OS", icon: Gauge },
      { href: "/vault", label: "Vault", icon: FileText },
      { href: "/mission", label: "Mission", icon: Compass },
      { href: "/burnout", label: "Burnout", icon: AlertCircle },
      { href: "/relationships", label: "Relationships", icon: Users },
      { href: "/capital", label: "Human Capital", icon: TrendingUp },
      { href: "/reports", label: "Reports", icon: Download },
      { href: "/mentors", label: "AI Mentors", icon: MessageCircle },
    ],
  },
  {
    label: "Community",
    items: [
      { href: "/community", label: "Growth Circles", icon: Users },
      { href: "/achievements", label: "Achievements", icon: Award },
      { href: "/insights", label: "Insights", icon: Lightbulb },
      { href: "/intelligence", label: "Intelligence", icon: Brain },
      { href: "/research", label: "Research", icon: BarChart3 },
      { href: "/privacy", label: "Privacy", icon: Shield },
      { href: "/profile", label: "Profile", icon: User },
    ],
  },
];

type SidebarNavContentProps = {
  pathname: string;
  onNavigate?: () => void;
};

function SidebarNavContent({ pathname, onNavigate }: SidebarNavContentProps) {
  return (
    <>
      <Link href="/dashboard" className="flex items-center gap-2.5 px-2 mb-6" onClick={onNavigate}>
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-teal-500 shadow-lg shadow-violet-600/20">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <span className="text-lg font-semibold text-zinc-50">HumanOS</span>
          <p className="text-[10px] text-zinc-500 leading-none">Human Flourishing OS</p>
        </div>
      </Link>

      <nav className="flex flex-col gap-5 overflow-y-auto max-h-[calc(100vh-8rem)] pr-1">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
              {group.label}
            </p>
            <div className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const isActive = pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                      isActive ? "text-zinc-50" : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active"
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-600/15 to-teal-600/10 border border-violet-500/20"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                      />
                    )}
                    <Icon className="relative h-4 w-4 shrink-0" />
                    <span className="relative truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      <button
        className="fixed top-4 left-4 z-50 lg:hidden flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900/90 border border-white/10 backdrop-blur-xl"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={closeMobile} />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 border-r border-white/8 bg-zinc-950/95 backdrop-blur-xl p-6 transition-transform lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarNavContent pathname={pathname} onNavigate={closeMobile} />
      </aside>

      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-white/8 lg:bg-zinc-950/50 lg:p-6 lg:shrink-0">
        <SidebarNavContent pathname={pathname} />
      </aside>
    </>
  );
}
