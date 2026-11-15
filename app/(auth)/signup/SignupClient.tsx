"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { LockKeyhole, Mail } from "lucide-react";

import { AuthDivider, AuthError, AuthField, AuthHeading, AuthPrivacyLine, authPrimaryButton } from "@/components/auth/AuthParts";
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
      setError("Those passwords don’t match. Type them again.");
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
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-5 pb-8 pt-10">
      <AuthHeading title="Keep your Companion with you">
        Create a free account to keep your saves and private reflections on every device.
      </AuthHeading>

      <form onSubmit={(ev) => void onSubmit(ev)} className="space-y-3">
        {error ? <AuthError>{error}</AuthError> : null}
        <AuthField
          id="su-email"
          label="Email address"
          Icon={Mail}
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(ev) => setEmail(ev.target.value)}
        />
        <AuthField
          id="su-password"
          label="Create a password"
          placeholder="Create a password · 8+ characters"
          Icon={LockKeyhole}
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          value={password}
          onChange={(ev) => setPassword(ev.target.value)}
        />
        <AuthField
          id="su-confirm"
          label="Confirm password"
          Icon={LockKeyhole}
          type="password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(ev) => setConfirm(ev.target.value)}
        />
        <button type="submit" disabled={busy} className={authPrimaryButton}>
          {busy ? "Creating account…" : "Create free account"}
        </button>
      </form>

      <AuthDivider />
      <GoogleSignInButton nextPath={next} />

      <div className="mt-auto space-y-3 pt-6">
        <p className="text-center text-sm text-[var(--text-secondary)]">
          {"Already have an account? "}
          <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-bold text-[var(--accent-primary)]">
            Sign in
          </Link>
        </p>
        <AuthPrivacyLine />
      </div>
    </main>
  );
}
