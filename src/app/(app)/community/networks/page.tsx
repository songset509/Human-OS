"use client";

import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, GraduationCap, Handshake, Briefcase, Sparkles } from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "AI Match Suggestions",
    desc: "Find people with complementary strengths and shared growth goals.",
    status: "Coming soon",
  },
  {
    icon: Handshake,
    title: "Accountability Partners",
    desc: "Pair with someone who keeps you consistent on habits and goals.",
    status: "Coming soon",
  },
  {
    icon: GraduationCap,
    title: "Learning Groups",
    desc: "Join skill-based circles for leadership, mindfulness, or career growth.",
    status: "Coming soon",
  },
  {
    icon: Users,
    title: "Growth Circles",
    desc: "Small communities focused on specific flourishing dimensions.",
    status: "Active via Community",
    href: "/community",
  },
  {
    icon: UserPlus,
    title: "Recommended Connections",
    desc: "Discover members aligned with your blueprint and mission.",
    status: "Coming soon",
  },
  {
    icon: Briefcase,
    title: "Professional Networking",
    desc: "Connect for mentorship, collaboration, and career alignment.",
    status: "Coming soon",
  },
];

export default function HumanNetworksPage() {
  return (
    <div>
      <PageHeader
        title="Human Networks"
        description="Connect with people who accelerate your growth — not just another social feed"
      />

      <Card className="mb-8 border-teal-500/20 bg-teal-500/5">
        <CardContent className="py-5 text-sm text-zinc-400">
          Human Networks is your growth-centric connection layer. All data is stored in
          Supabase with Row Level Security — you control what you share.
        </CardContent>
      </Card>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map((f) => {
          const Icon = f.icon;
          return (
            <Card key={f.title} className="hover:border-violet-500/20 transition-colors">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-600/10 text-violet-400">
                  <Icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-base mt-3">{f.title}</CardTitle>
                <CardDescription>{f.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <span className="text-xs text-zinc-500">{f.status}</span>
                {f.href && (
                  <Link href={f.href} className="block mt-3">
                    <Button size="sm" variant="secondary">
                      Open Community
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
