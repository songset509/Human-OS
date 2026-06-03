/**
 * Runtime environment detection for HumanOS.
 * Production (Vercel) must never use local demo filesystem or demo auth.
 */

export function isProductionRuntime(): boolean {
  return (
    process.env.VERCEL === "1" ||
    process.env.NODE_ENV === "production" ||
    process.env.NEXT_PUBLIC_VERCEL_ENV === "production"
  );
}

export function isLocalDevelopment(): boolean {
  return !isProductionRuntime();
}

export function allowDemoProvider(): boolean {
  return isLocalDevelopment() && process.env.HUMANOS_ALLOW_DEMO !== "false";
}
