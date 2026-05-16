"use client";

import { useState } from "react";
import { OnboardingScreen1 } from "@/components/onboarding/OnboardingScreen1";
import { SUPPORTER_MISSION_LINE } from "@/lib/copy/supporter";

interface OnboardingFlowProps {
  onComplete: () => void;
  onSkip: () => void;
}

const SLIDES = [
  null,
  {
    title: "Grounded in scholarship, accessible to all",
    body: "Content is reviewed and based on classical tafsir sources, including Tafsir Ibn Kathir.",
  },
  {
    title: "Start with how you're feeling",
    body: "Type your emotion or choose a category tile to begin your first reflection loop.",
  },
] as const;

export function OnboardingFlow({ onComplete, onSkip }: OnboardingFlowProps) {
  const [step, setStep] = useState(0);
  const isLastStep = step === SLIDES.length - 1;

  if (step === 0) {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-0 py-0 md:px-0">
        <OnboardingScreen1 onNext={() => setStep(1)} onSkip={onSkip} />
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-between gap-6 px-4 py-10 md:px-8">
      <section className="card-elevated space-y-4 p-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent-primary)]">
          Welcome to Dua & Ayah Companion
        </p>
        <h1 className="font-playfair text-2xl font-semibold text-[var(--text-primary)]">{SLIDES[step]!.title}</h1>
        <p className="text-sm leading-6 text-[var(--text-secondary)]">{SLIDES[step]!.body}</p>

        {step === 1 ? (
          <p className="mt-4 border-t border-[var(--border)] pt-4 text-xs leading-5 text-[var(--text-secondary)]">
            {SUPPORTER_MISSION_LINE}
          </p>
        ) : null}

        {step === 2 ? (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-subtle)] p-4">
            <p className="text-sm text-[var(--text-primary)]">How are you feeling right now?</p>
            <div className="mt-2 flex gap-2">
              <span className="rounded-md bg-[var(--bg-card)] px-2 py-1 text-xs text-[var(--text-secondary)]">Anxiety</span>
              <span className="rounded-md bg-[var(--bg-card)] px-2 py-1 text-xs text-[var(--text-secondary)]">Guidance</span>
              <span className="rounded-md bg-[var(--bg-card)] px-2 py-1 text-xs text-[var(--text-secondary)]">Patience</span>
            </div>
          </div>
        ) : null}
      </section>

      <footer className="flex items-center justify-between">
        <button
          type="button"
          onClick={onSkip}
          className="rounded-md px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]"
        >
          Skip
        </button>

        <div className="flex items-center gap-3">
          <p className="text-xs text-[var(--text-secondary)]">
            {step + 1}/{SLIDES.length}
          </p>
          <button
            type="button"
            onClick={() => {
              if (isLastStep) {
                onComplete();
              } else {
                setStep((current) => current + 1);
              }
            }}
            className="rounded-md bg-[var(--accent-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            {isLastStep ? "Get started" : "Continue"}
          </button>
        </div>
      </footer>
    </main>
  );
}
