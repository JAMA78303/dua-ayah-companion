import Link from "next/link";

import { FeedView } from "@/components/feed/FeedView";
import { fetchPairingsForFeed } from "@/lib/content/fetchPairings";
import { isEmotionCategory } from "@/types/emotions";

interface FeedPageProps {
  searchParams: Promise<{ category?: string; pairingId?: string }>;
}

export default async function FeedPage({ searchParams }: FeedPageProps) {
  const params = await searchParams;
  const rawCategory = params.category;
  const category = rawCategory && isEmotionCategory(rawCategory) ? rawCategory : undefined;
  const pairingId = params.pairingId;
  const initialPage = await fetchPairingsForFeed({ category, limit: 20, offset: 0 });

  return (
    <main className="flex min-h-dvh flex-1 flex-col">
      <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--card-bg)]/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between">
          <Link href="/discover" className="text-sm font-medium text-[var(--accent-primary)] hover:opacity-80">
            Back
          </Link>
          <p className="text-xs uppercase tracking-wide text-[var(--text-secondary)]">
            {category ? `${category} feed` : "explore feed"}
          </p>
        </div>
      </header>
      <FeedView
        initialPairings={initialPage.pairings}
        initialNextOffset={initialPage.nextOffset}
        initialHasMore={initialPage.hasMore}
        initialCategory={category}
        startAtId={pairingId}
      />
    </main>
  );
}
