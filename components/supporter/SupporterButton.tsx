"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface SupporterButtonProps {
  action: "checkout" | "portal";
  label: string;
  variant?: "primary" | "secondary";
}

/** Sends the person to Stripe (Checkout or the billing portal). */
export function SupporterButton({ action, label, variant = "primary" }: SupporterButtonProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function go() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/stripe/${action}`, { method: "POST" });
      if (response.status === 401) {
        router.push("/login?next=/supporter");
        return;
      }
      const body = (await response.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!response.ok || !body.url) throw new Error(body.error ?? "Something went wrong. Please try again.");
      window.location.assign(body.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => void go()}
        disabled={busy}
        className={
          variant === "primary"
            ? "flex min-h-12 w-full items-center justify-center rounded-full bg-[#e3c172] text-sm font-bold text-[#14110a] transition hover:opacity-90 disabled:opacity-60"
            : "flex min-h-12 w-full items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-sm font-bold text-white transition hover:bg-white/10 disabled:opacity-60"
        }
      >
        {busy ? "Opening Stripe…" : label}
      </button>
      {error ? (
        <p className="text-center text-xs text-[#f3b4ab]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
