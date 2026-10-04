"use client";

import { useEffect, useState } from "react";

import { submitResonance } from "@/lib/feedback/submitResonance";

interface ResonanceSurveyProps {
  pairingId: string;
  revealTargetId: string;
}

export function ResonanceSurvey({ pairingId, revealTargetId }: ResonanceSurveyProps) {
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
    if (isVisible) return;

    const revealTimer = window.setTimeout(() => {
      setIsVisible(true);
    }, 15000);

    const target = document.getElementById(revealTargetId);
    if (!target) return () => window.clearTimeout(revealTimer);

    const observer = new IntersectionObserver(
      (entries) => {
        const hasIntersected = entries.some((entry) => entry.isIntersecting);
        if (hasIntersected) {
          setIsVisible(true);
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(target);

    return () => {
      window.clearTimeout(revealTimer);
      observer.disconnect();
    };
  }, [isVisible, revealTargetId]);

  async function answer(response: boolean) {
    if (isBusy || hasSubmitted) return;
    setIsBusy(true);
    setErrorText(null);
    try {
      await submitResonance(pairingId, response);
      setHasSubmitted(true);
    } catch {
      setErrorText("Could not submit feedback. Please try again.");
    } finally {
      setIsBusy(false);
    }
  }

  if (!isVisible) return null;

  if (hasSubmitted) {
    return <p className="text-xs text-[var(--accent-primary)]">Thank you for your feedback.</p>;
  }

  const chip =
    "flex min-h-9 items-center rounded-full border px-3 text-xs font-bold transition disabled:opacity-60";
  return (
    <div className="space-y-3">
      <p className="font-playfair text-[19px] font-semibold text-[var(--text-primary)]">Did this meet what you&apos;re feeling?</p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => answer(true)}
          disabled={isBusy}
          className={`${chip} border-[var(--accent-primary)] bg-[var(--accent-primary)] text-[var(--on-accent-text)]`}
        >
          Yes
        </button>
        <button
          type="button"
          onClick={() => answer(false)}
          disabled={isBusy}
          className={`${chip} border-[var(--border)] bg-[var(--card-bg)] text-[var(--text-primary)] hover:border-[var(--accent-primary)]`}
        >
          Not yet
        </button>
      </div>
      {errorText ? <p className="text-xs text-[var(--destructive)]">{errorText}</p> : null}
    </div>
  );
}
