"use client";

import { useEffect, useState } from "react";

import { CategoryTiles } from "@/components/CategoryTiles";
import { MosqueSilhouette } from "@/components/MosqueSilhouette";
import { DailyRecommendationCard } from "@/components/DailyRecommendationCard";
import { EmotionInput } from "@/components/EmotionInput";
import { IOSInstallBanner } from "@/components/IOSInstallBanner";
import { OnboardingFlow } from "@/components/OnboardingFlow";
import { PropheticDuasSection } from "@/components/PropheticDuasSection";
import { StreakDisplay } from "@/components/StreakDisplay";
import { ZeroResultState } from "@/components/ZeroResultState";
import { useOnboarding } from "@/hooks/useOnboarding";
import { SUPPORTER_MISSION_LINE } from "@/lib/copy/supporter";

const TAHA_AYAH_ARABIC = "مَا أَنزَلْنَا عَلَيْكَ ٱلْقُرْءَانَ لِتَشْقَىٰ";
const TAHA_AYAH_TRANSLITERATION = "Ma anzalna 'alayka al-Qur'ana litashqa";
const TAHA_AYAH_TRANSLATION = "We have not sent down the Qur'an to you to cause you distress.";
const SPLASH_FADE_START_MS = 3000;
const SPLASH_HIDE_MS = 5000;
const SPLASH_TRANSITION_MS = 1800;
let hasShownInitialSplash = false;

export default function Home() {
  const [showZeroResult, setShowZeroResult] = useState(false);
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
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-4 py-10 md:px-8">
      <section className="card-elevated relative space-y-4 overflow-hidden p-5 backdrop-blur-[2px] md:p-6">
        <MosqueSilhouette />
        <div className="relative z-10 space-y-4">
        <DailyRecommendationCard />
        <StreakDisplay />
        <p className="text-center text-xs italic text-[var(--text-secondary)]">{SUPPORTER_MISSION_LINE}</p>

        <div className="flex flex-col items-center border-t border-[var(--border)] pt-10 text-center">
          <p dir="rtl" lang="ar" className="font-scheherazade text-xl leading-relaxed text-[var(--accent-primary)]">
            بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
          </p>
          <p className="font-nunito mt-2 text-sm italic text-[var(--text-secondary)]">
            Your Qur&apos;an. Your moment.
          </p>
        </div>

        <EmotionInput
          onNoMatch={() => {
            setShowZeroResult(true);
          }}
        />
        {showZeroResult ? <ZeroResultState /> : null}
        </div>
      </section>

      <section className="space-y-4">
        <div className="space-y-1 text-center md:text-left">
          <h2 className="font-playfair text-lg font-semibold text-[var(--text-primary)] md:text-xl">
            Browse by category
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Choose a lane, or write freely above — both paths stay gentle.
          </p>
        </div>
        <CategoryTiles />
      </section>

      <PropheticDuasSection />
    </main>
  );

  return (
    <div className="relative min-h-dvh">
      <div
        className={`transition-opacity ease-out ${splashActive ? "opacity-0" : "opacity-100"}`}
        style={{ transitionDuration: `${SPLASH_TRANSITION_MS}ms` }}
      >
        {appContent}
        {!showOnboarding ? <IOSInstallBanner /> : null}
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
