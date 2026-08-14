import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export async function getCurrentUser() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function requireUser(next = "/dashboard") {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  return user;
}

export async function getProfile(userId: string) {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();

  return data;
}

export async function ensureProfile(user: User) {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const existing = await getProfile(user.id);

  if (existing) {
    return existing;
  }

  const supabase = await createClient();
  const fullName = typeof user.user_metadata.full_name === "string" ? user.user_metadata.full_name : null;
  const displayName =
    typeof user.user_metadata.display_name === "string"
      ? user.user_metadata.display_name
      : fullName ?? user.email?.split("@")[0] ?? "Yume Nurse Student";

  const { data } = await supabase
    .from("profiles")
    .upsert(
      {
        id: user.id,
        full_name: fullName,
        display_name: displayName,
        email: user.email ?? null,
        role: "student",
      },
      { onConflict: "id" },
    )
    .select()
    .single();

  await supabase.from("user_settings").upsert({ user_id: user.id }, { onConflict: "user_id" });

  return data;
}
