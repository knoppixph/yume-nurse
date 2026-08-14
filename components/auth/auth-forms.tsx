"use client";

import Link from "next/link";
import { useActionState } from "react";
import { KeyRound, LogIn, Mail, UserPlus } from "lucide-react";
import {
  demoLoginAction,
  forgotPasswordAction,
  loginAction,
  resetPasswordAction,
  signUpAction,
} from "@/app/auth/actions";
import { initialActionState, type ActionState } from "@/lib/auth/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function StatusMessage({ state, fallback }: { state: ActionState; fallback?: string }) {
  const message = state.message || fallback;

  if (!message) {
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
      {message}
    </p>
  );
}

function AuthPanel({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 text-slate-950">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-black uppercase text-teal-700">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">{title}</h1>
        <div className="mt-6">{children}</div>
      </div>
    </section>
  );
}

export function LoginForm({ next, message }: { next: string; message?: string }) {
  const [state, formAction, pending] = useActionState(loginAction, initialActionState);

  return (
    <AuthPanel eyebrow="Welcome back" title="Log in to Yume Nurse">
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="next" value={next} />
        <StatusMessage state={state} fallback={message} />
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-700">Email</span>
          <Input name="email" type="email" autoComplete="email" required />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-700">Password</span>
          <Input name="password" type="password" autoComplete="current-password" required />
        </label>
        <Button type="submit" className="w-full" disabled={pending}>
          <LogIn className="h-4 w-4" aria-hidden="true" />
          {pending ? "Logging in..." : "Log in"}
        </Button>
      </form>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm font-semibold">
        <Link href="/forgot-password" className="text-slate-600 hover:text-slate-950">
          Forgot password
        </Link>
        <Link href={`/signup?next=${encodeURIComponent(next)}`} className="text-teal-700 hover:text-teal-900">
          Create account
        </Link>
      </div>
      <form action={demoLoginAction} className="mt-5 border-t border-slate-100 pt-5">
        <input type="hidden" name="next" value={next} />
        <Button type="submit" variant="secondary" className="w-full">
          Continue in local demo
        </Button>
      </form>
    </AuthPanel>
  );
}

export function SignupForm({ next, message }: { next: string; message?: string }) {
  const [state, formAction, pending] = useActionState(signUpAction, initialActionState);

  return (
    <AuthPanel eyebrow="Start studying" title="Create your account">
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="next" value={next} />
        <StatusMessage state={state} fallback={message} />
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-700">Full name</span>
          <Input name="fullName" autoComplete="name" required />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-700">Email</span>
          <Input name="email" type="email" autoComplete="email" required />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-700">Password</span>
          <Input name="password" type="password" autoComplete="new-password" minLength={8} required />
        </label>
        <Button type="submit" className="w-full" disabled={pending}>
          <UserPlus className="h-4 w-4" aria-hidden="true" />
          {pending ? "Creating account..." : "Create account"}
        </Button>
      </form>
      <p className="mt-5 text-center text-sm font-semibold text-slate-600">
        Already have an account?{" "}
        <Link href={`/login?next=${encodeURIComponent(next)}`} className="text-teal-700 hover:text-teal-900">
          Log in
        </Link>
      </p>
    </AuthPanel>
  );
}

export function ForgotPasswordForm({ message }: { message?: string }) {
  const [state, formAction, pending] = useActionState(forgotPasswordAction, initialActionState);

  return (
    <AuthPanel eyebrow="Account help" title="Reset your password">
      <form action={formAction} className="space-y-4">
        <StatusMessage state={state} fallback={message} />
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-700">Email</span>
          <Input name="email" type="email" autoComplete="email" required />
        </label>
        <Button type="submit" className="w-full" disabled={pending}>
          <Mail className="h-4 w-4" aria-hidden="true" />
          {pending ? "Sending..." : "Send reset link"}
        </Button>
      </form>
      <p className="mt-5 text-center text-sm font-semibold text-slate-600">
        Remembered it?{" "}
        <Link href="/login" className="text-teal-700 hover:text-teal-900">
          Log in
        </Link>
      </p>
    </AuthPanel>
  );
}

export function ResetPasswordForm({ message }: { message?: string }) {
  const [state, formAction, pending] = useActionState(resetPasswordAction, initialActionState);

  return (
    <AuthPanel eyebrow="New password" title="Choose a secure password">
      <form action={formAction} className="space-y-4">
        <StatusMessage state={state} fallback={message} />
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-700">New password</span>
          <Input name="password" type="password" autoComplete="new-password" minLength={8} required />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-slate-700">Confirm password</span>
          <Input name="confirmPassword" type="password" autoComplete="new-password" minLength={8} required />
        </label>
        <Button type="submit" className="w-full" disabled={pending}>
          <KeyRound className="h-4 w-4" aria-hidden="true" />
          {pending ? "Updating..." : "Update password"}
        </Button>
      </form>
    </AuthPanel>
  );
}
