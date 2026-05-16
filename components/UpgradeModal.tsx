"use client";

import { useEffect } from "react";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

/**
 * Free-tier save cap reached — Supporter / upgrade placeholder (Stripe later).
 */
export function UpgradeModal({
  open,
  onClose,
  title = "You've saved 10 ayahs",
  description = "Upgrade to keep building your collection.",
}: UpgradeModalProps) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex flex-col justify-end bg-black/45"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="upgrade-cap-title"
        className="rounded-t-2xl border border-[var(--accent-gold)]/40 bg-[var(--bg-card)] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="upgrade-cap-title" className="font-playfair text-xl font-semibold text-[var(--text-primary)]">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
        <div className="mt-6 flex flex-col gap-3">
          <a
            href="#"
            className="block w-full rounded-lg bg-[var(--accent-primary)] py-3 text-center text-sm font-semibold text-white"
            onClick={(e) => e.preventDefault()}
          >
            Upgrade
          </a>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg border border-[var(--border)] py-2.5 text-sm text-[var(--text-primary)]"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
