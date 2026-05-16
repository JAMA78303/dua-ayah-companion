"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { FeedCard } from "@/components/feed/FeedCard";
import type { Pairing } from "@/lib/content/fetchPairings";

interface FeedViewProps {
  initialPairings: Pairing[];
  initialCategory?: string;
  startAtId?: string;
}

export function FeedView({ initialPairings, initialCategory, startAtId }: FeedViewProps) {
  const [pairings, setPairings] = useState(initialPairings);
  const [loading, setLoading] = useState(false);
  const [exhausted, setExhausted] = useState(initialPairings.length === 0);
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
        offset: String(pairings.length),
        limit: "10",
      });
      if (initialCategory) {
        params.set("category", initialCategory);
      }

      const response = await fetch(`/api/feed?${params.toString()}`, { cache: "no-store" });
      if (!response.ok) {
        return;
      }

      const nextBatch = (await response.json()) as Pairing[];
      if (nextBatch.length === 0) {
        setExhausted(true);
      } else {
        const existingIds = new Set(pairings.map((item) => item.id));
        const uniqueBatch = nextBatch.filter((item) => !existingIds.has(item.id));
        if (uniqueBatch.length === 0) {
          setExhausted(true);
        } else {
          setPairings((prev) => [...prev, ...uniqueBatch]);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [exhausted, initialCategory, loading, pairings]);

  useEffect(() => {
    if (startIndex <= 0) return;
    queueMicrotask(() => setActiveIndex(startIndex));
    const node = cardRefs.current[startIndex];
    if (!node) return;
    node.scrollIntoView({ block: "start" });
  }, [startIndex]);

  useEffect(() => {
    const node = loadTriggerRef.current;
    if (!node) return;

    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadMore();
        }
      },
      { threshold: 0.1 },
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
