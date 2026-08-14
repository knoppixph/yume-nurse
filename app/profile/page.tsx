import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ProfileForm } from "@/components/profile/profile-form";
import { logoutAction } from "@/app/auth/actions";
import { ensureProfile, getCurrentUser } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/supabase/config";

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function messageFromCode(code: string | undefined) {
  if (code === "password-updated") {
    return "Password updated.";
  }

  return code;
}

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const configured = isSupabaseConfigured();
  const user = configured ? await getCurrentUser() : null;
  const profile = user ? await ensureProfile(user) : null;
  const message = messageFromCode(first(params.message));

  return (
    <>
      <PageHeader
        eyebrow="Profile"
        title="Study profile"
        description="Manage your Yume Nurse student profile and account details."
      />

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-black text-slate-950">Student details</h2>
          </CardHeader>
          <CardBody>
            {message ? (
              <p className="mb-4 rounded-md bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-700">
                {message}
              </p>
            ) : null}
            {configured && user ? (
              <ProfileForm profile={profile} authEmail={user.email ?? ""} />
            ) : (
              <div className="space-y-4">
                <div className="rounded-xl border border-sky-200 bg-sky-50 p-4">
                  <p className="text-xs font-bold text-sky-950">Local Demo Account Active</p>
                  <p className="mt-1 text-xs leading-relaxed text-sky-800">
                    You are exploring in Demo Mode. To save your permanent cloud profile, sign in with your real account.
                  </p>
                </div>
                <ProfileForm
                  profile={{
                    id: "demo-user",
                    full_name: "Yume Nurse Student",
                    display_name: "Future Nurse",
                    email: "student@yumenurse.app",
                    year_level: "3rd Year BSN",
                    school: "College of Nursing",
                    profile_picture_url: null,
                    study_goal: "Pass NCLEX-RN and Philippine PNLE with 90%+ score",
                    role: "student",
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  }}
                  authEmail="student@yumenurse.app"
                />
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-black text-slate-950">Account status</h2>
          </CardHeader>
          <CardBody className="space-y-3">
            <div className="rounded-md bg-slate-100 p-4">
              <p className="text-sm font-bold text-slate-950">Role</p>
              <p className="mt-1 text-sm capitalize text-slate-600">{profile?.role ?? "Student"}</p>
            </div>
            <div className="rounded-md bg-slate-100 p-4">
              <p className="text-sm font-bold text-slate-950">Authentication</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                {user ? `Signed in as ${user.email}` : "Sign in with Supabase Auth to manage this profile."}
              </p>
            </div>
            <div className="rounded-md bg-slate-100 p-4">
              <p className="text-sm font-bold text-slate-950">Privacy</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Keep real secrets in local or hosted environment variables.
              </p>
            </div>
            <form action={logoutAction}>
              <Button type="submit" variant="secondary" className="w-full">
                Log out
              </Button>
            </form>
          </CardBody>
        </Card>
      </section>
    </>
  );
}
