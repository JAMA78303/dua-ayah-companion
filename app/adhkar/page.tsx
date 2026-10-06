import type { Metadata } from "next";

import { AdhkarSession } from "@/components/adhkar/AdhkarSession";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = {
  title: "Morning & evening adhkar · Dua & Ayah Companion",
  description: "The morning and evening remembrances, with a counter for each.",
};

interface AdhkarPageProps {
  searchParams: Promise<{ time?: string }>;
}

export default async function AdhkarPage({ searchParams }: AdhkarPageProps) {
  const { time } = await searchParams;
  const initialTime = time === "morning" || time === "evening" ? time : undefined;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-5 px-5 py-6 md:px-8">
      <PageHeader eyebrow="Daily remembrance" title="Adhkar" back={{ href: "/library", label: "Library" }}>
        <p className="text-sm text-[var(--text-secondary)]">
          What the Prophet ﷺ taught for the start and end of the day. Tap each one as you say it; today&apos;s progress
          stays on this device. From <em>Hisn al-Muslim</em>, with the Qur&apos;anic ones from the Qur&apos;an text.
        </p>
      </PageHeader>

      <AdhkarSession initialTime={initialTime} />
    </main>
  );
}
