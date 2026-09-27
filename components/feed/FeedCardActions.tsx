"use client";

import Link from "next/link";
import { useState } from "react";

import { SaveButton } from "@/components/SaveButton";
import { ShareSheet } from "@/components/share/ShareSheet";
import type { ShareCardContent } from "@/lib/share/renderShareCard";

interface FeedCardActionsProps {
  /** Path of the item's full page — shared, and opened by the "open" link. */
  href: string;
  openLabel: string;
  shareTitle: string;
  shareText: string;
  /** What the shareable image shows. */
  card: ShareCardContent;
  save?: { pairingId: string; surah: number; ayahNumber: number };
}

export function FeedCardActions({ href, openLabel, shareTitle, shareText, card, save }: FeedCardActionsProps) {
  const [shareOpen, setShareOpen] = useState(false);

  return (
    <div className="relative flex shrink-0 items-center justify-between gap-2 pt-4">
      <div className="flex items-center gap-2">
        {save ? <SaveButton pairingId={save.pairingId} surah={save.surah} ayahNumber={save.ayahNumber} compact /> : null}
        <button
          type="button"
          onClick={() => setShareOpen(true)}
          className="rounded-full border border-[var(--border)] bg-[var(--bg-subtle)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition hover:border-[var(--accent-primary)]"
        >
          ↗ Share
        </button>
      </div>
      <Link href={href} className="text-sm font-medium text-[var(--accent-primary)] underline-offset-4 hover:underline">
        {`${openLabel} →`}
      </Link>
      {shareOpen ? (
        <ShareSheet card={card} href={href} title={shareTitle} text={shareText} onClose={() => setShareOpen(false)} />
      ) : null}
    </div>
  );
}
