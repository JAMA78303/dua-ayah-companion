"use client";

import { useState } from "react";

import { ThemeSettingsPanel } from "@/components/ThemeSettingsPanel";

export function ThemeSettingsButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex size-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card-bg)]/80 text-[var(--accent-primary)] shadow-[var(--card-shadow)] transition hover:border-[var(--gold)]"
        aria-label="Choose theme"
        title="Themes"
      >
        <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 3c-2.5 3-2.5 15 0 18M12 3c2.5 3 2.5 15 0 18M3 12h18" strokeLinecap="round" />
        </svg>
      </button>
      <ThemeSettingsPanel open={open} onClose={() => setOpen(false)} />
    </>
  );
}
