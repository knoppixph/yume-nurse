import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";
import { getSupabaseConfig } from "@/lib/supabase/config";

const protectedPrefixes = [
  "/admin",
  "/ai",
  "/dashboard",
  "/flashcards",
  "/materials",
  "/profile",
  "/progress",
  "/quiz",
  "/reset-password",
  "/review",
  "/subjects",
];

const authPages = ["/login", "/signup", "/forgot-password"];
const demoCookie = "nursemate_demo";

function matchesPath(pathname: string, paths: string[]) {
  return paths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

function signInUrl(request: NextRequest, message?: string) {
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);

  if (message) {
    url.searchParams.set("message", message);
  }

  return url;
}

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isProtectedRoute = matchesPath(pathname, protectedPrefixes);
  const isAuthRoute = matchesPath(pathname, authPages);
  const config = getSupabaseConfig();
  const isDemoAuthenticated =
    process.env.NODE_ENV !== "production" && request.cookies.get(demoCookie)?.value === "1";

  let response = NextResponse.next({ request });

  if (isDemoAuthenticated) {
    if (isAuthRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      url.search = "";
      return NextResponse.redirect(url);
    }

    return response;
  }

  if (!config) {
    if (isProtectedRoute) {
      return NextResponse.redirect(
        signInUrl(request, "Connect Supabase environment variables before signing in."),
      );
    }

    return response;
  }

  const supabase = createServerClient<Database>(config.url, config.publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });

        response = NextResponse.next({ request });

        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data, error } = await supabase.auth.getClaims();
  const isAuthenticated = !error && Boolean(data?.claims.sub);

  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(signInUrl(request));
  }

  if (isAuthRoute && isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}
