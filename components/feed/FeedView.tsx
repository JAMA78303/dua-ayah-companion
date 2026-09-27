"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { FeedCard } from "@/components/feed/FeedCard";
import type { FeedPage, Pairing } from "@/lib/content/fetchPairings";

interface FeedViewProps {
  initialPairings: Pairing[];
  initialNextOffset: number;
  initialHasMore: boolean;
  initialCategory?: string;
  startAtId?: string;
}

function verseKeyOf(pairing: Pairing) {
  return `${pairing.surah}:${pairing.ayah_number}`;
}

export function FeedView({
  initialPairings,
  initialNextOffset,
  initialHasMore,
  initialCategory,
  startAtId,
}: FeedViewProps) {
  const [pairings, setPairings] = useState(initialPairings);
  const [nextOffset, setNextOffset] = useState(initialNextOffset);
  const [loading, setLoading] = useState(false);
  const [exhausted, setExhausted] = useState(!initialHasMore);
  const feedContainerRef = useRef<HTMLDivElement | null>(null);
  const loadTriggerRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const activeCardObserverRef = useRef<IntersectionObserver | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const storageKey = useMemo(
    () => `feed:last-pairing:${initialCategory ?? "all"}`,
    [initialCategory],
  );
  const [resumePairingId, setResumePairingId] = useState<string | undefined>(startAtId);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (startAtId) {
      queueMicrotask(() => setResumePairingId(startAtId));
      return;
    }
    const stored = window.sessionStorage.getItem(storageKey) ?? undefined;
    queueMicrotask(() => setResumePairingId(stored));
  }, [startAtId, storageKey]);

  const startIndex = useMemo(() => {
    if (!resumePairingId) return 0;
    const index = pairings.findIndex((pairing) => pairing.id === resumePairingId);
    return index >= 0 ? index : 0;
  }, [pairings, resumePairingId]);

  const loadMore = useCallback(async () => {
    if (loading || exhausted) return;
    setLoading(true);

    try {
      const params = new URLSearchParams({
        offset: String(nextOffset),
        limit: "10",
      });
      if (initialCategory) {
        params.set("category", initialCategory);
      }

      const response = await fetch(`/api/feed?${params.toString()}`, { cache: "no-store" }).catch(
        () => null,
      );
      if (!response?.ok) {
        // End the feed rather than retrying in a loop while the trigger stays in range.
        setExhausted(true);
        return;
      }

      const page = (await response.json()) as FeedPage;
      // A page of only repeats still advances the offset; the observer re-fires while the trigger stays visible.
      const seenAyahs = new Set(pairings.map(verseKeyOf));
      const uniqueBatch = page.pairings.filter((item) => !seenAyahs.has(verseKeyOf(item)));
      if (uniqueBatch.length > 0) {
        setPairings((prev) => [...prev, ...uniqueBatch]);
      }
      setNextOffset(page.nextOffset);
      if (!page.hasMore) {
        setExhausted(true);
      }
    } finally {
      setLoading(false);
    }
  }, [exhausted, initialCategory, loading, nextOffset, pairings]);

  useEffect(() => {
    if (startIndex <= 0) return;
    queueMicrotask(() => setActiveIndex(startIndex));
    const node = cardRefs.current[startIndex];
    if (!node) return;
    node.scrollIntoView({ block: "start" });
  }, [startIndex]);

  useEffect(() => {
    const node = loadTriggerRef.current;
    const root = feedContainerRef.current;
    if (!node || !root) return;

    observerRef.current?.disconnect();
    // Snap scrolling always rests on the last card, so the trigger itself never becomes visible;
    // observe within the feed container and start loading ~2 screens early.
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadMore();
        }
      },
      { root, rootMargin: "0px 0px 200% 0px" },
    );
    observerRef.current.observe(node);

    return () => observerRef.current?.disconnect();
  }, [loadMore, pairings.length]);

  useEffect(() => {
    const root = feedContainerRef.current;
    if (!root) return;

    activeCardObserverRef.current?.disconnect();
    activeCardObserverRef.current = new IntersectionObserver(
      (entries) => {
        let topEntry: IntersectionObserverEntry | null = null;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          if (!topEntry || entry.intersectionRatio > topEntry.intersectionRatio) {
            topEntry = entry;
          }
        }

        const pairingId = topEntry?.target.getAttribute("data-pairing-id");
        if (pairingId) {
          window.sessionStorage.setItem(storageKey, pairingId);
          const idx = pairings.findIndex((p) => p.id === pairingId);
          if (idx >= 0) setActiveIndex(idx);
        }
      },
      {
        root,
        threshold: [0.6],
      },
    );

    for (const cardNode of cardRefs.current) {
      if (cardNode) {
        activeCardObserverRef.current.observe(cardNode);
      }
    }

    return () => activeCardObserverRef.current?.disconnect();
  }, [pairings, storageKey]);

  return (
    <div ref={feedContainerRef} className="h-dvh overflow-y-auto snap-y snap-mandatory">
      {pairings.map((pairing, index) => (
        <section
          key={pairing.id}
          data-pairing-id={pairing.id}
          ref={(node) => {
            cardRefs.current[index] = node as HTMLDivElement | null;
          }}
          className="flex h-dvh snap-start snap-always flex-col bg-transparent px-3 pb-4 pt-3 md:px-5 md:pb-5 md:pt-4"
        >
          <div className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col">
            <FeedCard
              pairing={pairing}
              index={index}
              total={pairings.length}
              isActive={index === activeIndex}
            />
          </div>
        </section>
      ))}

      {!exhausted ? (
        <div ref={loadTriggerRef} className="h-1 w-full" />
      ) : (
        <section className="h-dvh snap-start snap-always bg-transparent px-6 py-12">
          <div className="mx-auto flex h-full max-w-2xl flex-col items-center justify-center text-center">
            <p className="text-2xl font-semibold text-[var(--text-primary)]">You&apos;ve reached the end</p>
            <p className="mt-3 text-sm italic text-[var(--text-secondary)]">
              &quot;We have not sent down the Qur&apos;an to you to cause you distress&quot;
            </p>
            <p className="mt-1 text-xs text-[var(--accent-primary)]">Ta-Ha, 2</p>
          </div>
        </section>
      )}

      {loading ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-4 z-10 flex justify-center">
          <span className="rounded-full bg-[var(--bg-card)]/90 px-3 py-1 text-xs text-[var(--text-secondary)] shadow-sm">
            Loading more ayat...
          </span>
        </div>
      ) : null}
    </div>
  );
}
