"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

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
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-10">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Sign in</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">Welcome back to Dua &amp; Ayah Companion.</p>
      </div>

      {reasonMessage ? (
        <p className="rounded-md border border-[var(--border)] bg-[var(--bg-subtle)] px-3 py-2 text-sm text-[var(--text-secondary)]">
          {reasonMessage}
        </p>
      ) : null}

      <GoogleSignInButton nextPath={next} />

      <div className="relative py-2 text-center text-xs text-[var(--text-secondary)]">
        <span className="relative z-10 bg-[var(--bg-base)] px-2">or continue with email</span>
        <span className="absolute inset-x-0 top-1/2 z-0 h-px -translate-y-1/2 bg-[var(--border)]" aria-hidden />
      </div>

      <form onSubmit={(ev) => void onSubmit(ev)} className="space-y-4">
        {error ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900" role="alert">
            {error}
          </p>
        ) : null}
        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium text-[var(--text-primary)]">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none ring-[var(--accent-primary)] focus:ring-2"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="password" className="text-sm font-medium text-[var(--text-primary)]">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
            className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none ring-[var(--accent-primary)] focus:ring-2"
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-[var(--accent-primary)] py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="text-center text-sm text-[var(--text-secondary)]">
        No account?{" "}
        <Link href={`/signup?next=${encodeURIComponent(next)}`} className="font-medium text-[var(--accent-primary)]">
          Create one
        </Link>
      </p>

      <Link href="/" className="text-center text-sm text-[var(--text-secondary)] hover:text-[var(--accent-primary)]">
        Back to home
      </Link>
    </main>
  );
}
