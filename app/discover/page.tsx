"use client";

import { useState } from "react";

import { CategoryTiles } from "@/components/CategoryTiles";
import { DailyRecommendationCard } from "@/components/DailyRecommendationCard";
import { EmotionInput } from "@/components/EmotionInput";
import { IOSInstallBanner } from "@/components/IOSInstallBanner";
import { MosqueSilhouette } from "@/components/MosqueSilhouette";
import { NameOfTheDayCard } from "@/components/names/NameOfTheDayCard";
import { PropheticDuasSection } from "@/components/PropheticDuasSection";
import { StreakDisplay } from "@/components/StreakDisplay";
import { ZeroResultState } from "@/components/ZeroResultState";
import { SUPPORTER_MISSION_LINE } from "@/lib/copy/supporter";

/** Search by feeling, browse categories, and today's reflection and Name (formerly the Home screen). */
export default function DiscoverPage() {
  const [showZeroResult, setShowZeroResult] = useState(false);

  return (
    <>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-4 py-10 md:px-8">
        <section className="card-elevated relative space-y-4 overflow-hidden p-5 backdrop-blur-[2px] md:p-6">
          <MosqueSilhouette />
          <div className="relative z-10 space-y-4">
          <DailyRecommendationCard />
          <NameOfTheDayCard />
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
      <IOSInstallBanner />
    </>
  );
}
