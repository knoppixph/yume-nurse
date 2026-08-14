"use server";

import { cookies, headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ensureProfile, requireUser } from "@/lib/auth/session";
import {
  type ActionState,
  authSetupMessage,
  cleanInternalPath,
  formString,
  isValidEmail,
  isValidPassword,
  sanitizeClientError,
} from "@/lib/auth/validation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

async function getOrigin() {
  const headerStore = await headers();
  return headerStore.get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export async function demoLoginAction(formData: FormData) {
  if (process.env.NODE_ENV === "production") {
    redirect("/login?message=Demo%20mode%20is%20only%20available%20locally.");
  }

  const next = cleanInternalPath(formString(formData, "next"));
  const cookieStore = await cookies();
  cookieStore.set("nursemate_demo", "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  redirect(next);
}

export async function signUpAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured()) {
    return { status: "error", message: authSetupMessage() };
  }

  const fullName = formString(formData, "fullName", 100);
  const email = formString(formData, "email", 254).toLowerCase();
  const password = formString(formData, "password", 128);
  const next = cleanInternalPath(formString(formData, "next"), "/profile");

  if (fullName.length < 2) {
    return { status: "error", message: "Enter your full name." };
  }

  if (!isValidEmail(email)) {
    return { status: "error", message: "Enter a valid email address." };
  }

  const pwdCheck = isValidPassword(password);
  if (!pwdCheck.valid) {
    return { status: "error", message: pwdCheck.reason || "Use at least 8 characters for your password." };
  }

  let shouldRedirect = false;

  try {
    const supabase = await createClient();
    const origin = await getOrigin();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, display_name: fullName },
        emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });

    if (error) {
      return { status: "error", message: sanitizeClientError(error) };
    }

    if (data.user) {
      await ensureProfile(data.user);
    }

    if (data.session) {
      shouldRedirect = true;
    }
  } catch (err) {
    return { status: "error", message: sanitizeClientError(err) };
  }

  if (shouldRedirect) {
    redirect(next);
  }

  return {
    status: "success",
    message: "Account created. Check your email to confirm your Yume Nurse sign in.",
  };
}

export async function loginAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured()) {
    return { status: "error", message: authSetupMessage() };
  }

  const email = formString(formData, "email", 254).toLowerCase();
  const password = formString(formData, "password", 128);
  const next = cleanInternalPath(formString(formData, "next"));

  if (!isValidEmail(email) || !password) {
    return { status: "error", message: "Enter your email and password." };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return { status: "error", message: sanitizeClientError(error) };
    }

    if (data.user) {
      await ensureProfile(data.user);
    }
  } catch (err) {
    return { status: "error", message: sanitizeClientError(err) };
  }

  redirect(next);
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("nursemate_demo");

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
  }

  redirect("/login");
}

export async function forgotPasswordAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured()) {
    return { status: "error", message: authSetupMessage() };
  }

  const email = formString(formData, "email", 254).toLowerCase();

  if (!isValidEmail(email)) {
    return { status: "error", message: "Enter a valid email address." };
  }

  try {
    const supabase = await createClient();
    const origin = await getOrigin();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback?next=/reset-password`,
    });

    if (error) {
      return { status: "error", message: sanitizeClientError(error) };
    }

    return { status: "success", message: "Password reset link sent. Check your email." };
  } catch (err) {
    return { status: "error", message: sanitizeClientError(err) };
  }
}

export async function resetPasswordAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured()) {
    return { status: "error", message: authSetupMessage() };
  }

  const password = formString(formData, "password", 128);
  const confirmPassword = formString(formData, "confirmPassword", 128);

  const pwdCheck = isValidPassword(password);
  if (!pwdCheck.valid) {
    return { status: "error", message: pwdCheck.reason || "Use at least 8 characters for your new password." };
  }

  if (password !== confirmPassword) {
    return { status: "error", message: "Passwords do not match." };
  }

  await requireUser("/reset-password");

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      return { status: "error", message: sanitizeClientError(error) };
    }
  } catch (err) {
    return { status: "error", message: sanitizeClientError(err) };
  }

  redirect("/profile?message=password-updated");
}

export async function updateProfileAction(_state: ActionState, formData: FormData): Promise<ActionState> {
  if (!isSupabaseConfigured()) {
    return { status: "error", message: authSetupMessage() };
  }

  const user = await requireUser("/profile");
  const fullName = formString(formData, "fullName", 100);
  const displayName = formString(formData, "displayName", 100);
  const email = formString(formData, "email", 254).toLowerCase();
  const yearLevel = formString(formData, "yearLevel", 50);
  const school = formString(formData, "school", 150);
  const profilePictureUrl = formString(formData, "profilePictureUrl", 500);
  const studyGoal = formString(formData, "studyGoal", 200);

  if (fullName.length < 2 || displayName.length < 2) {
    return { status: "error", message: "Full name and display name are required." };
  }

  if (!isValidEmail(email)) {
    return { status: "error", message: "Enter a valid email address." };
  }

  try {
    const supabase = await createClient();
    const { data: existingProfile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
    const { error } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        full_name: fullName,
        display_name: displayName,
        email,
        year_level: yearLevel || null,
        school: school || null,
        profile_picture_url: profilePictureUrl || null,
        study_goal: studyGoal || null,
        role: existingProfile?.role ?? "student",
      },
      { onConflict: "id" },
    );

    if (error) {
      return { status: "error", message: sanitizeClientError(error) };
    }

    await supabase.auth.updateUser({
      data: {
        full_name: fullName,
        display_name: displayName,
      },
    });
    await supabase.from("user_settings").upsert({ user_id: user.id }, { onConflict: "user_id" });
    revalidatePath("/profile");

    return { status: "success", message: "Profile saved." };
  } catch (err) {
    return { status: "error", message: sanitizeClientError(err) };
  }
}
