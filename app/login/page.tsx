import { LoginForm } from "@/components/auth/auth-forms";
import { cleanInternalPath } from "@/lib/auth/validation";

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function messageFromCode(code: string | undefined) {
  if (code === "supabase-not-configured") {
    return "Supabase is not configured yet. Add environment variables before signing in.";
  }

  return code;
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const next = cleanInternalPath(first(params.next));
  const message = messageFromCode(first(params.message));

  return <LoginForm next={next} message={message} />;
}
