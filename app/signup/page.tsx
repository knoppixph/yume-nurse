import { SignupForm } from "@/components/auth/auth-forms";
import { cleanInternalPath } from "@/lib/auth/validation";

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const next = cleanInternalPath(first(params.next), "/profile");
  const message = first(params.message);

  return <SignupForm next={next} message={message} />;
}
