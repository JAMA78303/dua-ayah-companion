import type { Metadata } from "next";

import { PrayerTimesView } from "@/components/prayer/PrayerTimesView";

export const metadata: Metadata = {
  title: "Prayer times & qibla · Dua & Ayah Companion",
};

export default function PrayerTimesPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8 md:px-8">
      <header className="space-y-1">
        <h1 className="font-playfair text-3xl font-semibold text-[var(--text-primary)]">Prayer times &amp; qibla</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Calculated for your location. Your local mosque&apos;s timetable always takes priority.
        </p>
      </header>
      <PrayerTimesView />
    </main>
  );
}
