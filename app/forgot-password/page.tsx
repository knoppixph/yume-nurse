import { ForgotPasswordForm } from "@/components/auth/auth-forms";

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  return <ForgotPasswordForm message={first(params.message)} />;
}
