import { allowDemoProvider, isProductionRuntime } from "@/lib/env/runtime";
import { assertDemoProviderAllowed, DemoProviderProductionError } from "@/lib/demo/guard";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { DataProviderMode, IDataProvider } from "./types";

export type { DataProviderMode, IDataProvider };
export { DemoProviderProductionError };

export function getDataProviderMode(): DataProviderMode {
  if (isProductionRuntime() || process.env.NODE_ENV !== "development") {
    return "supabase";
  }
  if (allowDemoProvider() && !isSupabaseConfigured()) return "demo";
  return "supabase";
}

export function getDataProvider(): IDataProvider {
  const mode = getDataProviderMode();
  if (mode === "demo") {
    assertDemoProviderAllowed("getDataProvider");
  }
  return {
    mode,
    isProduction: isProductionRuntime(),
  };
}

/** Throws if production/runtime would select DemoProvider. */
export function assertSupabaseProviderOnly(): void {
  const mode = getDataProviderMode();
  if (mode === "demo" && process.env.NODE_ENV !== "development") {
    throw new DemoProviderProductionError("assertSupabaseProviderOnly");
  }
}

export function isUsingSupabase(): boolean {
  return getDataProviderMode() === "supabase";
}

export function isUsingDemoProvider(): boolean {
  return getDataProviderMode() === "demo";
}
