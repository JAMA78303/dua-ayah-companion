"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { LockKeyhole, Mail } from "lucide-react";

import { AuthDivider, AuthError, AuthField, AuthHeading, AuthNote, AuthPrivacyLine, authPrimaryButton } from "@/components/auth/AuthParts";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { createClient } from "@/lib/supabase/client";

interface LoginClientProps {
  next: string;
  reason?: string | null;
}

export function LoginClient({ next, reason }: LoginClientProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const reasonMessage =
    reason === "session_expired"
      ? "Your session expired. Please sign in again."
      : reason === "auth_error"
        ? "Something went wrong with sign-in. Please try again."
        : null;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const supabase = createClient();
      const { error: signError } = await supabase.auth.signInWithPassword({ email, password });
      if (signError) {
        const msg = signError.message.toLowerCase();
        if (msg.includes("invalid login") || msg.includes("invalid credentials")) {
          setError("That email or password doesn’t match our records. Try again.");
        } else if (msg.includes("email not confirmed")) {
          setError("Please confirm your email before signing in.");
        } else {
          setError("We couldn’t sign you in. Check your details and try again.");
        }
        return;
      }
      router.replace(next);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-5 pb-8 pt-10">
      <AuthHeading title="Welcome back">Return to your saved guidance, reflections and personal duas.</AuthHeading>

      {reasonMessage ? <AuthNote>{reasonMessage}</AuthNote> : null}

      <form onSubmit={(ev) => void onSubmit(ev)} className="space-y-3">
        {error ? <AuthError>{error}</AuthError> : null}
        <AuthField
          id="email"
          label="Email address"
          Icon={Mail}
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(ev) => setEmail(ev.target.value)}
        />
        <AuthField
          id="password"
          label="Password"
          Icon={LockKeyhole}
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(ev) => setPassword(ev.target.value)}
        />
        <button type="submit" disabled={busy} className={authPrimaryButton}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <AuthDivider />
      <GoogleSignInButton nextPath={next} />

      <div className="mt-auto space-y-3 pt-6">
        <p className="text-center text-sm text-[var(--text-secondary)]">
          {"New to Companion? "}
          <Link href={`/signup?next=${encodeURIComponent(next)}`} className="font-bold text-[var(--accent-primary)]">
            Create an account
          </Link>
        </p>
        <AuthPrivacyLine />
      </div>
    </main>
  );
}
