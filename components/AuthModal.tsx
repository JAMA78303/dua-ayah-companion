"use client";

import { FormEvent, useState } from "react";

import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { createClient } from "@/lib/supabase/client";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  /** Called after successful email/password sign-in. */
  onSuccess: () => void;
}

/**
 * Slide-up sheet for contextual sign-in (e.g. save while reading an ayah).
 */
export function AuthModal({ open, onClose, onSuccess }: AuthModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!open) return null;

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
          setError("That email or password doesn’t match our records.");
        } else {
          setError("We couldn’t sign you in. Try again.");
        }
        return;
      }
      onSuccess();
      onClose();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end bg-black/40" role="presentation" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="max-h-[90dvh] overflow-y-auto rounded-t-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="auth-modal-title" className="text-lg font-semibold text-[var(--text-primary)]">
          Sign in to save
        </h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">Sign in and it’s saved straight away — we’ll keep you right here.</p>

        <div className="mt-4">
          <GoogleSignInButton nextPath={typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : "/"} />
        </div>

        <div className="relative py-3 text-center text-xs text-[var(--text-secondary)]">
          <span className="relative z-10 bg-[var(--bg-card)] px-2">or continue with email</span>
          <span className="absolute inset-x-0 top-1/2 z-0 h-px -translate-y-1/2 bg-[var(--border)]" aria-hidden />
        </div>

        <form onSubmit={(ev) => void onSubmit(ev)} className="space-y-3">
          {error ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900" role="alert">
              {error}
            </p>
          ) : null}
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-subtle)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none ring-[var(--accent-primary)] focus:ring-2"
          />
          <input
            type="password"
            required
            autoComplete="current-password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-md border border-[var(--border)] bg-[var(--bg-subtle)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none ring-[var(--accent-primary)] focus:ring-2"
          />
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-[var(--accent-primary)] py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <button type="button" onClick={onClose} className="mt-4 w-full text-sm text-[var(--text-secondary)]">
          Cancel
        </button>
      </div>
    </div>
  );
}
