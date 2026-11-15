"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useEffect } from "react";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

/**
 * Free-tier limit reached: points to the Supporter page.
 */
export function UpgradeModal({
  open,
  onClose,
  title = "You've used your 10 free saves",
  description = "Become a Supporter for unlimited saves, and help fund Islamic causes.",
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
        className="space-y-4 rounded-t-[24px] bg-[radial-gradient(ellipse_at_50%_0%,#1d3532_0%,#0c1514_60%,#07090a_100%)] px-5 pb-6 pt-3 text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="mx-auto block h-1 w-10 rounded-full bg-white/20" aria-hidden />
        <span className="flex size-11 items-center justify-center rounded-full bg-[#e3c172] text-[#14110a]">
          <Sparkles className="size-5" strokeWidth={1.6} aria-hidden />
        </span>
        <div className="space-y-1.5">
          <h2 id="upgrade-cap-title" className="font-playfair text-[26px] font-semibold leading-tight">
            {title}
          </h2>
          <p className="text-sm leading-relaxed text-white/70">{description}</p>
        </div>
        <div className="flex flex-col gap-2">
          <Link
            href="/supporter"
            onClick={onClose}
            className="flex min-h-12 w-full items-center justify-center rounded-full bg-[#e3c172] text-sm font-bold text-[#14110a]"
          >
            Become a Supporter
          </Link>
          <button type="button" onClick={onClose} className="min-h-11 w-full text-sm font-bold text-white">
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
