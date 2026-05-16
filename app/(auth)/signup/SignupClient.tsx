"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { createClient } from "@/lib/supabase/client";

interface SignupClientProps {
  next: string;
}

export function SignupClient({ next }: SignupClientProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Use at least 8 characters for your password.");
      return;
    }
    setBusy(true);
    try {
      const supabase = createClient();
      const { error: signError } = await supabase.auth.signUp({ email, password });
      if (signError) {
        setError(signError.message || "Could not create your account.");
        return;
      }
      router.replace("/?welcome=1");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-4 py-10">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Create an account</h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">Save reflections and sync across devices.</p>
      </div>

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
          <label htmlFor="su-email" className="text-sm font-medium text-[var(--text-primary)]">
            Email
          </label>
          <input
            id="su-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none ring-[var(--accent-primary)] focus:ring-2"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="su-password" className="text-sm font-medium text-[var(--text-primary)]">
            Password
          </label>
          <input
            id="su-password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
            className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none ring-[var(--accent-primary)] focus:ring-2"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="su-confirm" className="text-sm font-medium text-[var(--text-primary)]">
            Confirm password
          </label>
          <input
            id="su-confirm"
            type="password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(ev) => setConfirm(ev.target.value)}
            className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-card)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none ring-[var(--accent-primary)] focus:ring-2"
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-[var(--accent-primary)] py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {busy ? "Creating account…" : "Sign up"}
        </button>
      </form>

      <p className="text-center text-sm text-[var(--text-secondary)]">
        Already have an account?{" "}
        <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-medium text-[var(--accent-primary)]">
          Sign in
        </Link>
      </p>

      <Link href="/" className="text-center text-sm text-[var(--text-secondary)] hover:text-[var(--accent-primary)]">
        Back to home
      </Link>
    </main>
  );
}
