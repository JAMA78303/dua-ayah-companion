import type { Metadata } from "next";

import { AdhkarSession } from "@/components/adhkar/AdhkarSession";

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
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8 md:px-8">
      <header className="space-y-2">
        <h1 className="font-playfair text-3xl font-semibold text-[var(--text-primary)]">Morning &amp; evening adhkar</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          The remembrances the Prophet ﷺ taught for the start and end of the day. Tap each one as you say it; your
          progress is kept on this device for today.
        </p>
        <p className="text-xs text-[var(--text-secondary)]">
          From <em>Hisn al-Muslim</em>
          {" (Fortress of the Muslim), where each is referenced, with the Qur'anic ones from the Qur'an text."}
        </p>
      </header>

      <AdhkarSession initialTime={initialTime} />
    </main>
  );
}
