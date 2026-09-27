"use client";

import Link from "next/link";
import { useState } from "react";

import { SaveButton } from "@/components/SaveButton";

interface FeedCardActionsProps {
  /** Path of the item's full page — shared, and opened by the "open" link. */
  href: string;
  openLabel: string;
  shareTitle: string;
  shareText: string;
  save?: { pairingId: string; surah: number; ayahNumber: number };
}

export function FeedCardActions({ href, openLabel, shareTitle, shareText, save }: FeedCardActionsProps) {
  const [toast, setToast] = useState<string | null>(null);

  async function share() {
    const url = `${window.location.origin}${href}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: shareTitle, text: shareText, url });
        return;
      }
      await navigator.clipboard.writeText(`${shareText}\n${url}`);
      setToast("Link copied");
    } catch (error) {
      // Closing the share sheet is not an error worth reporting.
      if (error instanceof DOMException && error.name === "AbortError") return;
      setToast("Couldn't share right now");
    }
    window.setTimeout(() => setToast(null), 2500);
  }

  return (
    <div className="relative flex shrink-0 items-center justify-between gap-2 pt-4">
      <div className="flex items-center gap-2">
        {save ? <SaveButton pairingId={save.pairingId} surah={save.surah} ayahNumber={save.ayahNumber} compact /> : null}
        <button
          type="button"
          onClick={() => void share()}
          className="rounded-full border border-[var(--border)] bg-[var(--bg-subtle)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition hover:border-[var(--accent-primary)]"
        >
          ↗ Share
        </button>
      </div>
      <Link href={href} className="text-sm font-medium text-[var(--accent-primary)] underline-offset-4 hover:underline">
        {`${openLabel} →`}
      </Link>
      {toast ? (
        <span
          role="status"
          className="absolute -top-8 left-0 rounded-full bg-[var(--text-primary)] px-3 py-1 text-xs text-[var(--bg-base)] shadow"
        >
          {toast}
        </span>
      ) : null}
    </div>
  );
}
