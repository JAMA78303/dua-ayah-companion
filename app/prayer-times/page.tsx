import type { Metadata } from "next";

import { PrayerTimesView } from "@/components/prayer/PrayerTimesView";

export const metadata: Metadata = {
  title: "Prayer times & qibla · Dua & Ayah Companion",
};

export default function PrayerTimesPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-5 py-6 md:px-8">
      <PrayerTimesView />
    </main>
  );
}
