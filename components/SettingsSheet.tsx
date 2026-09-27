"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { RemindersSettings } from "@/components/push/RemindersSettings";
import { ReciterSelector } from "@/components/ReciterSelector";
import { useReciter } from "@/components/ReciterProvider";
import { getUserWithTimeout } from "@/lib/auth/getUserWithTimeout";
import { createClient } from "@/lib/supabase/client";
import { signOutAndClearLocalData } from "@/lib/auth/signOut";

interface SettingsSheetProps {
  open: boolean;
  onClose: () => void;
}

type AccountState =
  | { status: "loading" }
  | { status: "signed-out" }
  | { status: "signed-in"; email: string | null; isAdmin: boolean; isSupporter: boolean };

export function SettingsSheet({ open, onClose }: SettingsSheetProps) {
  const { reciterName } = useReciter();
  const [account, setAccount] = useState<AccountState>({ status: "loading" });
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    void getUserWithTimeout().then(async (user) => {
      if (!user) {
        if (!cancelled) setAccount({ status: "signed-out" });
        return;
      }
      const supabase = createClient();
      const [{ data: isAdmin }, { data: profile }] = await Promise.all([
        supabase.rpc("is_admin"),
        supabase.from("profiles").select("is_premium").eq("id", user.id).maybeSingle(),
      ]);
      if (!cancelled) {
        setAccount({
          status: "signed-in",
          email: user.email ?? null,
          isAdmin: isAdmin === true,
          isSupporter: profile?.is_premium === true,
        });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [open]);

  if (!open) return null;

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await signOutAndClearLocalData();
    } catch {
      setSigningOut(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex flex-col justify-end" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close settings"
        onClick={onClose}
      />
      <div
        className="relative z-[1] flex max-h-[70vh] flex-col overflow-y-auto rounded-t-[20px] bg-[var(--card-bg)] px-5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-sheet-title"
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[var(--border)]" aria-hidden />

        <h2 id="settings-sheet-title" className="font-playfair text-lg text-[var(--text-primary)]">
          Settings
        </h2>

        <section className="mt-6 space-y-3">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Audio &amp; Recitation</h3>
          <p className="text-xs text-[var(--text-secondary)]">Currently: {reciterName}</p>
          <ReciterSelector />
        </section>

        <RemindersSettings />

        <section className="mt-6 space-y-3 border-t border-[var(--border)] pt-5">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Account</h3>
          {account.status === "loading" ? (
            <p className="text-xs text-[var(--text-secondary)]">Checking sign-in…</p>
          ) : account.status === "signed-in" ? (
            <>
              <div className="flex items-center justify-between gap-3">
                <p className="min-w-0 truncate text-xs text-[var(--text-secondary)]">
                  Signed in{account.email ? ` as ${account.email}` : ""}
                </p>
                <button
                  type="button"
                  onClick={() => void handleSignOut()}
                  disabled={signingOut}
                  className="shrink-0 rounded-md border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--text-primary)] transition hover:bg-[var(--bg-subtle)] disabled:opacity-60"
                >
                  {signingOut ? "Signing out…" : "Sign out"}
                </button>
              </div>
              <Link href="/supporter" onClick={onClose} className="block text-sm font-medium text-[var(--accent-primary)]">
                {account.isSupporter ? "Your Supporter subscription →" : "Become a Supporter →"}
              </Link>
              {account.isAdmin ? (
                <Link href="/admin/review" onClick={onClose} className="block text-sm font-medium text-[var(--accent-primary)]">
                  Review content →
                </Link>
              ) : null}
            </>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-[var(--text-secondary)]">Sign in to sync saves and reflections.</p>
              <Link
                href="/login"
                onClick={onClose}
                className="shrink-0 rounded-md bg-[var(--accent-primary)] px-3 py-1.5 text-sm font-semibold text-[var(--on-accent-text)]"
              >
                Sign in
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
