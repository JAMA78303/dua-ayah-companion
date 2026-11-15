"use client";

import Link from "next/link";
import { BookmarkCheck, LockKeyhole, Mail } from "lucide-react";
import { FormEvent, useState } from "react";

import { AuthDivider, AuthError, AuthField, authPrimaryButton } from "@/components/auth/AuthParts";
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

  const here = typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : "/";

  return (
    <div className="fixed inset-0 z-[60] flex flex-col justify-end bg-black/40" role="presentation" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="max-h-[90dvh] space-y-4 overflow-y-auto rounded-t-[24px] border border-[var(--border)] bg-[var(--card-bg)] px-5 pb-6 pt-3 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="mx-auto block h-1 w-10 rounded-full bg-[var(--border)]" aria-hidden />
        <span className="flex size-11 items-center justify-center rounded-[14px] bg-[color-mix(in_srgb,var(--accent-primary)_12%,transparent)] text-[var(--accent-primary)]">
          <BookmarkCheck className="size-5" strokeWidth={1.6} aria-hidden />
        </span>
        <div className="space-y-1">
          <h2 id="auth-modal-title" className="font-playfair text-[26px] font-semibold leading-tight text-[var(--text-primary)]">
            Keep this beyond today
          </h2>
          <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
            Sign in and it&apos;s kept straight away, on every device. We&apos;ll keep you right here.
          </p>
        </div>

        <form onSubmit={(ev) => void onSubmit(ev)} className="space-y-3">
          {error ? <AuthError>{error}</AuthError> : null}
          <AuthField
            id="auth-modal-email"
            label="Email address"
            Icon={Mail}
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <AuthField
            id="auth-modal-password"
            label="Password"
            Icon={LockKeyhole}
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit" disabled={busy} className={authPrimaryButton}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <AuthDivider />
        <GoogleSignInButton nextPath={here} />

        <p className="text-center text-sm text-[var(--text-secondary)]">
          {"New here? "}
          <Link href={`/signup?next=${encodeURIComponent(here)}`} className="font-bold text-[var(--accent-primary)]">
            Create a free account
          </Link>
        </p>
        <button
          type="button"
          onClick={onClose}
          className="flex min-h-11 w-full items-center justify-center rounded-full bg-[var(--bg-subtle)] text-sm font-bold text-[var(--text-primary)]"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
