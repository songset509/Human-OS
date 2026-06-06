import { shouldShowDemoUI } from "@/lib/demo/ui";
import Link from "next/link";
import { Info } from "lucide-react";

/**
 * Local development only — never rendered on Vercel, preview, or production hosts.
 */
export function DemoBanner() {
  if (!shouldShowDemoUI()) return null;

  return (
    <div className="mb-6 flex items-start gap-3 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-3 text-sm">
      <Info className="h-4 w-4 shrink-0 text-violet-400 mt-0.5" />
      <p className="text-violet-200/90 leading-relaxed">
        <span className="font-medium text-violet-100">Local demo</span> — running without
        Supabase on localhost. Add keys to{" "}
        <code className="text-violet-100">.env.local</code> to use cloud auth.{" "}
        <Link
          href="https://supabase.com/dashboard/project/_/settings/api"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-violet-100"
        >
          Supabase API settings
        </Link>
      </p>
    </div>
  );
}
