import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv, isSupabaseConfigured } from "@/lib/supabase/env";
import { isProductionRuntime } from "@/lib/env/runtime";
import { DEMO_SESSION_COOKIE, isDemoMode } from "@/lib/demo/config";
import { parseDemoSessionCookie } from "@/lib/demo/session-cookie";

const PUBLIC_PATHS = [
  "/",
  "/auth/login",
  "/auth/signup",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/confirm",
  "/auth/callback",
  "/privacy",
];

const PROTECTED_PATHS = [
  "/dashboard",
  "/assessments",
  "/results",
  "/mood",
  "/challenges",
  "/coach",
  "/insights",
  "/profile",
  "/blueprint",
  "/potential",
  "/future-self",
  "/architect",
  "/timeline",
  "/community",
  "/twin",
  "/achievements",
  "/research",
  "/testing-hub",
  "/life-os",
  "/vault",
  "/mission",
  "/burnout",
  "/relationships",
  "/capital",
  "/reports",
  "/mentors",
  "/intelligence",
];

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  if (pathname.startsWith("/api/demo/auth")) return true;
  if (pathname.startsWith("/api/health")) return true;
  return false;
}

function isProtectedPath(pathname: string): boolean {
  if (isPublicPath(pathname)) return false;
  if (pathname.startsWith("/api/")) return false;
  return PROTECTED_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = isProtectedPath(pathname);
  const isAuthPage =
    pathname.startsWith("/auth/login") ||
    pathname.startsWith("/auth/signup") ||
    pathname.startsWith("/auth/forgot-password");

  if (isProductionRuntime() && !isSupabaseConfigured()) {
    if (isProtected) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      url.searchParams.set("error", "missing_supabase_config");
      return NextResponse.redirect(url);
    }
    return NextResponse.next({ request });
  }

  if (isDemoMode()) {
    const demoUser = parseDemoSessionCookie(
      request.cookies.get(DEMO_SESSION_COOKIE)?.value
    );

    if (isProtected && !demoUser) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/login";
      url.searchParams.set("demo", "1");
      return NextResponse.redirect(url);
    }

    if (demoUser && isAuthPage) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });
  const { url, key } = getSupabaseEnv();

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
