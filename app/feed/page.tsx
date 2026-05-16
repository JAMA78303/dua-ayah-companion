import Link from "next/link";

import { FeedView } from "@/components/feed/FeedView";
import { fetchPairingsForFeed } from "@/lib/content/fetchPairings";
import type { EmotionCategory } from "@/types/emotions";

interface FeedPageProps {
  searchParams: Promise<{ category?: string; pairingId?: string }>;
}

const VALID_CATEGORIES: EmotionCategory[] = [
  "anxiety",
  "sadness",
  "gratitude",
  "guidance",
  "patience",
  "guilt",
  "grief",
  "hope",
  "forgiveness",
  "loneliness",
];

function isEmotionCategory(value: string): value is EmotionCategory {
  return VALID_CATEGORIES.includes(value as EmotionCategory);
}

export default async function FeedPage({ searchParams }: FeedPageProps) {
  const params = await searchParams;
  const rawCategory = params.category;
  const category = rawCategory && isEmotionCategory(rawCategory) ? rawCategory : undefined;
  const pairingId = params.pairingId;
  const initialPairings = await fetchPairingsForFeed({ category, limit: 20, offset: 0 });

  return (
    <main className="flex min-h-dvh flex-1 flex-col">
      <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between">
          <Link href="/" className="text-sm font-medium text-[var(--accent-primary)] hover:opacity-80">
            Back
          </Link>
          <p className="text-xs uppercase tracking-wide text-zinc-500">
            {category ? `${category} feed` : "explore feed"}
          </p>
        </div>
      </header>
      <FeedView initialPairings={initialPairings} initialCategory={category} startAtId={pairingId} />
    </main>
  );
}
