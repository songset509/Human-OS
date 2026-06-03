/**
 * Hard guard: DemoProvider must never run outside local development.
 */
export class DemoProviderProductionError extends Error {
  constructor(context?: string) {
    super(
      context
        ? `DemoProvider cannot run in production (${context}). Configure Supabase environment variables.`
        : "DemoProvider cannot run in production. Configure Supabase environment variables."
    );
    this.name = "DemoProviderProductionError";
  }
}

export function isDevelopmentOnly(): boolean {
  return process.env.NODE_ENV === "development";
}

/** Throws if demo code is invoked outside NODE_ENV=development. */
export function assertDemoProviderAllowed(context?: string): void {
  if (process.env.NODE_ENV !== "development") {
    throw new DemoProviderProductionError(context);
  }
}
