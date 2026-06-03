/**
 * Runtime environment detection for HumanOS.
 * DemoProvider is allowed only when NODE_ENV === "development".
 */

export function isProductionRuntime(): boolean {
  return (
    process.env.VERCEL === "1" ||
    process.env.NODE_ENV === "production" ||
    process.env.NEXT_PUBLIC_VERCEL_ENV === "production"
  );
}

export function isLocalDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}

/** Demo mode only in local development (never preview/production builds). */
export function allowDemoProvider(): boolean {
  return isLocalDevelopment() && process.env.HUMANOS_ALLOW_DEMO !== "false";
}
