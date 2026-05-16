import { QuranSurahList } from "@/components/quran/QuranSurahList";

export default function QuranPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8 md:px-8">
      <header className="space-y-1">
        <h1 className="font-playfair text-2xl font-semibold text-[var(--text-primary)]">Qur&apos;an</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Read a surah, then tap <span className="font-medium text-[var(--accent-primary)]">Reflect</span> to
          enter the emotional loop with that ayah.
        </p>
      </header>
      <QuranSurahList />
    </main>
  );
}
