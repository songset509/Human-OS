import { NextResponse } from "next/server";
import { validateAppConfig } from "@/lib/supabase/env";
import { getDataProvider } from "@/lib/providers";

export async function GET() {
  const config = validateAppConfig();
  const provider = getDataProvider();

  return NextResponse.json({
    status: config.ok ? "ok" : "misconfigured",
    provider: provider.mode,
    production: provider.isProduction,
    errors: config.errors,
    warnings: config.warnings,
  });
}
