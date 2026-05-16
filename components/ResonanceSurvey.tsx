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

  if (!isVisible) {
    return (
      <p className="text-xs text-[var(--text-secondary)]">
        Feedback will appear after you have read a bit more.
      </p>
    );
  }

  if (hasSubmitted) {
    return <p className="text-xs text-[var(--accent-primary)]">Thank you for your feedback.</p>;
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-[var(--text-primary)]">Did this resonate with you?</p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => answer(true)}
          disabled={isBusy}
          className="rounded-md bg-[var(--accent-primary)] px-3 py-1.5 text-sm text-white transition hover:opacity-90 disabled:opacity-60"
        >
          Yes
        </button>
        <button
          type="button"
          onClick={() => answer(false)}
          disabled={isBusy}
          className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--text-primary)] transition hover:bg-[var(--bg-subtle)] disabled:opacity-60"
        >
          Not really
        </button>
      </div>
      {errorText ? <p className="text-xs text-[var(--destructive)]">{errorText}</p> : null}
    </div>
  );
}
