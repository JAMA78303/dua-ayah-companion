"use client";

import Link from "next/link";
import { BookOpen, Bookmark, ChevronRight, Compass, HandHeart, NotebookPen, ScrollText, SunMoon } from "lucide-react";
import { useState } from "react";

import { DailyRecommendationCard } from "@/components/DailyRecommendationCard";
import { FeelingChips } from "@/components/discover/FeelingChips";
import { EmotionInput } from "@/components/EmotionInput";
import { HadithOfTheDayCard } from "@/components/HadithOfTheDayCard";
import { IOSInstallBanner } from "@/components/IOSInstallBanner";
import { NameOfTheDayCard } from "@/components/names/NameOfTheDayCard";
import { StreakDisplay } from "@/components/StreakDisplay";
import { ZeroResultState } from "@/components/ZeroResultState";
import { SUPPORTER_MISSION_LINE } from "@/lib/copy/supporter";

const PRACTICE = [
  { href: "/adhkar", title: "Morning & evening adhkar", note: "Daily remembrance", Icon: SunMoon },
  { href: "/prayer-times", title: "Prayer times & qibla", note: "Based on your location", Icon: Compass },
  { href: "/duas", title: "Duas from the Sunnah", note: "For worry, fear, anger, loss and more", Icon: HandHeart },
  { href: "/companions", title: "Stories of the Companions", note: "The first to believe", Icon: BookOpen },
  { href: "/prophets", title: "Duas from the Prophets", note: "From the Qur'an", Icon: ScrollText },
];

const PERSONAL = [
  { href: "/saved", title: "Saved", Icon: Bookmark },
  { href: "/journal", title: "Journal", Icon: NotebookPen },
  { href: "/my-duas", title: "My duas", Icon: HandHeart },
];

/** The emotional entry point: name a feeling, then today's reflection, Name and hadith, and practice. */
export default function DiscoverPage() {
  const [showZeroResult, setShowZeroResult] = useState(false);

  return (
    <>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-[18px] px-5 pb-8 pt-4 md:px-8">
        <header className="space-y-0.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--accent-primary)]">A place to begin</p>
          <h1 className="font-playfair text-[30px] font-semibold text-[var(--text-primary)]">Discover</h1>
        </header>

        <section className="card-elevated space-y-3.5 bg-[color-mix(in_srgb,var(--gold)_12%,var(--card-bg))] p-5">
          <h2 className="font-playfair text-[27px] font-semibold leading-[1.15] text-[var(--text-primary)]">How are you feeling right now?</h2>
          <EmotionInput onNoMatch={() => setShowZeroResult(true)} />
        </section>

        <FeelingChips />
        {showZeroResult ? <ZeroResultState /> : null}

        <DailyRecommendationCard />

        <div className="grid grid-cols-2 items-stretch gap-2.5">
          <NameOfTheDayCard compact />
          <HadithOfTheDayCard />
        </div>

        <section className="card-elevated space-y-1 p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-playfair text-[21px] font-semibold text-[var(--text-primary)]">Practice &amp; library</h2>
            <Link href="/library" className="text-xs font-bold text-[var(--accent-primary)]">
              See all
            </Link>
          </div>
          <ul>
            {PRACTICE.map(({ href, title, note, Icon }) => (
              <li key={href}>
                <Link href={href} className="flex min-h-[58px] items-center gap-3 rounded-xl transition hover:bg-[var(--bg-subtle)]">
                  <span className="flex size-[42px] shrink-0 items-center justify-center rounded-[14px] bg-[color-mix(in_srgb,var(--accent-primary)_12%,transparent)] text-[var(--accent-primary)]">
                    <Icon className="size-[19px]" strokeWidth={1.6} aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-[var(--text-primary)]">{title}</span>
                    <span className="block text-[11px] text-[var(--text-secondary)]">{note}</span>
                  </span>
                  <ChevronRight className="size-[17px] text-[var(--text-secondary)]" strokeWidth={1.6} aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-playfair text-[21px] font-semibold text-[var(--text-primary)]">Personal</h2>
          <ul className="grid grid-cols-3 gap-2">
            {PERSONAL.map(({ href, title, Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="flex min-h-[78px] flex-col gap-[7px] rounded-[14px] border border-[var(--border)] bg-[var(--card-bg)] p-3 transition hover:border-[var(--accent-primary)]"
                >
                  <Icon className="size-[19px] text-[var(--accent-primary)]" strokeWidth={1.6} aria-hidden />
                  <span className="text-[11px] font-bold text-[var(--text-primary)]">{title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <StreakDisplay />
        <p className="text-center text-xs italic text-[var(--text-secondary)]">{SUPPORTER_MISSION_LINE}</p>
      </main>
      <IOSInstallBanner />
    </>
  );
}
