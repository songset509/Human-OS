import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv, isSupabaseConfigured } from "@/lib/supabase/env";
import { DEMO_SESSION_COOKIE } from "@/lib/demo/config";
import { parseDemoSessionCookie } from "@/lib/demo/session-cookie";

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
  "/privacy",
];

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PATHS.some((path) => pathname.startsWith(path));
  const isAuthPage =
    pathname.startsWith("/auth/login") || pathname.startsWith("/auth/signup");

  // Demo mode — no Supabase required
  if (!isSupabaseConfigured()) {
    const demoUser = parseDemoSessionCookie(
      request.cookies.get(DEMO_SESSION_COOKIE)?.value
    );

    if (isProtected && !demoUser) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/signup";
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
