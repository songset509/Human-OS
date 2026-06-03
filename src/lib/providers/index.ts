import { allowDemoProvider, isProductionRuntime } from "@/lib/env/runtime";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { DataProviderMode, IDataProvider } from "./types";

export type { DataProviderMode, IDataProvider };

export function getDataProviderMode(): DataProviderMode {
  if (isProductionRuntime()) return "supabase";
  if (allowDemoProvider() && !isSupabaseConfigured()) return "demo";
  return "supabase";
}

export function getDataProvider(): IDataProvider {
  return {
    mode: getDataProviderMode(),
    isProduction: isProductionRuntime(),
  };
}

export function isUsingSupabase(): boolean {
  return getDataProviderMode() === "supabase";
}

export function isUsingDemoProvider(): boolean {
  return getDataProviderMode() === "demo";
}
