import { NextResponse, type NextRequest } from "next/server";
import { cleanInternalPath } from "@/lib/auth/validation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = cleanInternalPath(requestUrl.searchParams.get("next"), "/dashboard");

  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(new URL("/login?message=supabase-not-configured", request.url));
  }

  if (code) {
    const supabase = await createClient();
    const { data } = await supabase.auth.exchangeCodeForSession(code);
    // Ensure the profile row exists for this user (e.g. after email confirmation)
    if (data?.user) {
      await ensureProfile(data.user);
    }
  }

  return NextResponse.redirect(new URL(next, request.url));
}
