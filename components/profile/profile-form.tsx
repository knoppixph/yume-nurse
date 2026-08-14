"use client";

import { useActionState } from "react";
import { Save } from "lucide-react";
import { updateProfileAction } from "@/app/auth/actions";
import { initialActionState, type ActionState } from "@/lib/auth/validation";
import type { Profile } from "@/lib/auth/session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

function ProfileStatus({ state }: { state: ActionState }) {
  if (!state.message) {
    return null;
  }

  return (
    <p
      className={
        state.status === "error"
          ? "rounded-md bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700"
          : "rounded-md bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-700"
      }
      aria-live="polite"
    >
      {state.message}
    </p>
  );
}

export function ProfileForm({ profile, authEmail }: { profile: Profile | null; authEmail: string }) {
  const [state, formAction, pending] = useActionState(updateProfileAction, initialActionState);

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <ProfileStatus state={state} />
      </div>
      <label className="block">
        <span className="mb-2 block text-sm font-bold text-slate-700">Full name</span>
        <Input name="fullName" defaultValue={profile?.full_name ?? ""} autoComplete="name" required />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-bold text-slate-700">Display name</span>
        <Input name="displayName" defaultValue={profile?.display_name ?? ""} required />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-bold text-slate-700">Email</span>
        <Input name="email" type="email" defaultValue={profile?.email ?? authEmail} autoComplete="email" required />
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-bold text-slate-700">Year level</span>
        <Select name="yearLevel" defaultValue={profile?.year_level ?? ""}>
          <option value="">Choose year level</option>
          <option>1st Year</option>
          <option>2nd Year</option>
          <option>3rd Year</option>
          <option>4th Year</option>
          <option>Review/Graduate</option>
        </Select>
      </label>
      <label className="block sm:col-span-2">
        <span className="mb-2 block text-sm font-bold text-slate-700">School</span>
        <Input name="school" defaultValue={profile?.school ?? ""} />
      </label>
      <label className="block sm:col-span-2">
        <span className="mb-2 block text-sm font-bold text-slate-700">Profile picture URL</span>
        <Input name="profilePictureUrl" type="url" defaultValue={profile?.profile_picture_url ?? ""} />
      </label>
      <label className="block sm:col-span-2">
        <span className="mb-2 block text-sm font-bold text-slate-700">Study goal</span>
        <Input name="studyGoal" defaultValue={profile?.study_goal ?? ""} />
      </label>
      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending}>
          <Save className="h-4 w-4" aria-hidden="true" />
          {pending ? "Saving..." : "Save profile"}
        </Button>
      </div>
    </form>
  );
}
