"use client";

import { useEffect, useState } from "react";

import { MixedFeedView } from "@/components/feed/MixedFeedView";
import { OnboardingFlow } from "@/components/OnboardingFlow";
import { useOnboarding } from "@/hooks/useOnboarding";

const TAHA_AYAH_ARABIC = "مَا أَنزَلْنَا عَلَيْكَ ٱلْقُرْءَانَ لِتَشْقَىٰ";
const TAHA_AYAH_TRANSLITERATION = "Ma anzalna 'alayka al-Qur'ana litashqa";
const TAHA_AYAH_TRANSLATION = "We have not sent down the Qur'an to you to cause you distress.";
const SPLASH_FADE_START_MS = 3000;
const SPLASH_HIDE_MS = 5000;
const SPLASH_TRANSITION_MS = 1800;
let hasShownInitialSplash = false;

export default function Home() {
  const [splashPhase, setSplashPhase] = useState<"hidden" | "visible" | "fading">(
    hasShownInitialSplash ? "hidden" : "visible",
  );
  const { showOnboarding, completeOnboarding, skipOnboarding } = useOnboarding();

  useEffect(() => {
    if (hasShownInitialSplash) {
      queueMicrotask(() => setSplashPhase("hidden"));
      return;
    }
    const fadeTimer = window.setTimeout(() => {
      setSplashPhase("fading");
    }, SPLASH_FADE_START_MS);
    const doneTimer = window.setTimeout(() => {
      setSplashPhase("hidden");
      hasShownInitialSplash = true;
    }, SPLASH_HIDE_MS);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(doneTimer);
    };
  }, []);

  const splashActive = splashPhase !== "hidden";
  const appContent = showOnboarding ? (
    <OnboardingFlow onComplete={completeOnboarding} onSkip={skipOnboarding} />
  ) : (
    <MixedFeedView />
  );

  return (
    <div className="relative min-h-dvh">
      <div
        className={`transition-opacity ease-out ${splashActive ? "opacity-0" : "opacity-100"}`}
        style={{ transitionDuration: `${SPLASH_TRANSITION_MS}ms` }}
      >
        {appContent}
      </div>

      {splashActive ? (
        <main
          className={`absolute inset-0 mx-auto flex min-h-dvh w-full max-w-3xl flex-1 flex-col items-center justify-center gap-4 px-6 text-center transition-opacity ease-out ${
            splashPhase === "fading" ? "opacity-0" : "opacity-100"
          }`}
          style={{ transitionDuration: `${SPLASH_TRANSITION_MS}ms` }}
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--accent-primary)]">
            Dua & Ayah Companion
          </p>
          <p
            dir="rtl"
            lang="ar"
            className="font-scheherazade text-4xl leading-relaxed text-[var(--text-arabic)]"
          >
            {TAHA_AYAH_ARABIC}
          </p>
          <p className="text-sm italic text-[var(--text-secondary)]">{TAHA_AYAH_TRANSLITERATION}</p>
          <p className="text-sm text-[var(--text-primary)]">&quot;{TAHA_AYAH_TRANSLATION}&quot;</p>
          <p className="text-xs text-[var(--accent-primary)]">Surah Ta-Ha, Ayah 2</p>
        </main>
      ) : null}
    </div>
  );
}
