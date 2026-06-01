import { isDemoMode } from "@/lib/demo/config";
import Link from "next/link";
import { Info } from "lucide-react";

export function DemoBanner() {
  if (!isDemoMode()) return null;

  return (
    <div className="mb-6 flex items-start gap-3 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-3 text-sm">
      <Info className="h-4 w-4 shrink-0 text-violet-400 mt-0.5" />
      <p className="text-violet-200/90 leading-relaxed">
        <span className="font-medium text-violet-100">Demo mode</span> — all features
        work locally without Supabase. Data is saved on your machine. To use real auth
        and cloud storage, add your Supabase keys to{" "}
        <code className="text-violet-100">.env.local</code> and restart.{" "}
        <Link
          href="https://supabase.com/dashboard/project/_/settings/api"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-violet-100"
        >
          Get Supabase keys
        </Link>
      </p>
    </div>
  );
}
