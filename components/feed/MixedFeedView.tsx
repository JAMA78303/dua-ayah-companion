"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { EmotionInput } from "@/components/EmotionInput";
import { AdhkarFeedCard } from "@/components/feed/AdhkarFeedCard";
import { FeedCard } from "@/components/feed/FeedCard";
import { NameFeedCard } from "@/components/feed/NameFeedCard";
import { StoryFeedCard } from "@/components/feed/StoryFeedCard";
import { ZeroResultState } from "@/components/ZeroResultState";
import { adhkarCompletion, readAdhkarProgress } from "@/lib/adhkar/progress";
import { adhkarTimeNow, type AdhkarTime } from "@/lib/content/adhkar";
import type { FeedItem, MixedFeedPage } from "@/lib/feed/types";

const SEED_KEY = "feed:mixed:seed";
const INDEX_KEY = "feed:mixed:index";
const PAGE_SIZE = 12;

function readSession(key: string): number | null {
  try {
    const raw = window.sessionStorage.getItem(key);
    if (raw === null) return null; // Number(null) would be 0, a valid-looking seed
    const value = Number(raw);
    return Number.isInteger(value) && value >= 0 ? value : null;
  } catch {
    return null;
  }
}

function writeSession(key: string, value: number) {
  try {
    window.sessionStorage.setItem(key, String(value));
  } catch {
    /* position just won't be restored */
  }
}

function newSeed() {
  return Math.floor(Math.random() * 2 ** 31);
}

async function fetchPage(seed: number, offset: number, limit: number): Promise<MixedFeedPage | null> {
  const params = new URLSearchParams({ seed: String(seed), offset: String(offset), limit: String(limit) });
  const response = await fetch(`/api/feed/mixed?${params.toString()}`, { cache: "no-store" }).catch(() => null);
  if (!response?.ok) return null;
  return (await response.json()) as MixedFeedPage;
}

function FeedItemCard({ item, index, isActive }: { item: FeedItem; index: number; isActive: boolean }) {
  switch (item.kind) {
    case "pairing":
      return <FeedCard pairing={item.pairing} index={index} isActive={isActive} />;
    case "story":
      return <StoryFeedCard item={item} />;
    case "name":
      return <NameFeedCard item={item} />;
  }
}

function MoodSheet({ onClose }: { onClose: () => void }) {
  const [noMatch, setNoMatch] = useState(false);
  return (
    <div className="fixed inset-0 z-[70] flex flex-col justify-end" role="presentation">
      <button type="button" className="absolute inset-0 bg-black/40" aria-label="Close" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="mood-sheet-title"
        className="relative z-[1] max-h-[85dvh] space-y-4 overflow-y-auto rounded-t-[20px] bg-[var(--card-bg)] px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-3"
      >
        <div className="mx-auto h-1 w-10 rounded-full bg-[var(--border)]" aria-hidden />
        <h2 id="mood-sheet-title" className="font-playfair text-lg text-[var(--text-primary)]">
          How are you feeling?
        </h2>
        <EmotionInput onNoMatch={() => setNoMatch(true)} />
        {noMatch ? <ZeroResultState /> : null}
        <Link href="/discover" onClick={onClose} className="block text-sm font-medium text-[var(--accent-primary)]">
          Or browse by feeling →
        </Link>
      </div>
    </div>
  );
}

/**
 * Full-screen swipe feed mixing ayah & dua pairings, prophet story chapters and Names of Allah.
 * The order comes from a per-visit seed (fresh each visit, no repeats); the seed and position are kept
 * in sessionStorage so returning from a card's full page lands on the same card.
 */
export function MixedFeedView() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const loadTriggerRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const restoreIndexRef = useRef<number | null>(null);

  const [seed, setSeed] = useState<number | null>(null);
  const [items, setItems] = useState<FeedItem[]>([]);
  const [nextOffset, setNextOffset] = useState(0);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [exhausted, setExhausted] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [moodOpen, setMoodOpen] = useState(false);
  const [adhkarDue, setAdhkarDue] = useState<{ time: AdhkarTime; done: number; total: number } | null>(null);

  // Morning / evening adhkar lead the feed while they're due and unfinished today.
  useEffect(() => {
    const time = adhkarTimeNow(new Date());
    if (!time) return;
    const { done, total, complete } = adhkarCompletion(time, readAdhkarProgress(time));
    if (!complete) queueMicrotask(() => setAdhkarDue({ time, done, total }));
  }, []);

  const start = useCallback(async (sessionSeed: number, resumeIndex: number) => {
    setStatus("loading");
    const page = await fetchPage(sessionSeed, 0, Math.min(60, Math.max(PAGE_SIZE, resumeIndex + 6)));
    if (!page) {
      setStatus("error");
      return;
    }
    restoreIndexRef.current = resumeIndex > 0 ? Math.min(resumeIndex, page.items.length - 1) : null;
    setItems(page.items);
    setNextOffset(page.nextOffset);
    setExhausted(!page.hasMore);
    setActiveIndex(restoreIndexRef.current ?? 0);
    setStatus("ready");
  }, []);

  useEffect(() => {
    const storedSeed = readSession(SEED_KEY);
    const sessionSeed = storedSeed ?? newSeed();
    writeSession(SEED_KEY, sessionSeed);
    queueMicrotask(() => {
      setSeed(sessionSeed);
      void start(sessionSeed, storedSeed === null ? 0 : (readSession(INDEX_KEY) ?? 0));
    });
  }, [start]);

  // Return to the card the viewer was on before opening its full page.
  useEffect(() => {
    const index = restoreIndexRef.current;
    if (status !== "ready" || index === null) return;
    restoreIndexRef.current = null;
    cardRefs.current[index]?.scrollIntoView({ block: "start" });
  }, [status, items]);

  const loadMore = useCallback(async () => {
    if (seed === null || loadingMore || exhausted || status !== "ready") return;
    setLoadingMore(true);
    const page = await fetchPage(seed, nextOffset, PAGE_SIZE);
    if (!page) {
      // Stop rather than retry in a loop while the trigger stays in range.
      setExhausted(true);
    } else {
      setItems((prev) => [...prev, ...page.items]);
      setNextOffset(page.nextOffset);
      if (!page.hasMore) setExhausted(true);
    }
    setLoadingMore(false);
  }, [exhausted, loadingMore, nextOffset, seed, status]);

  useEffect(() => {
    const root = containerRef.current;
    const trigger = loadTriggerRef.current;
    if (!root || !trigger) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void loadMore();
      },
      { root, rootMargin: "0px 0px 200% 0px" },
    );
    observer.observe(trigger);
    return () => observer.disconnect();
  }, [loadMore, items.length]);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        const top = visible.sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        const index = Number(top?.target.getAttribute("data-feed-index"));
        if (top && Number.isInteger(index)) {
          setActiveIndex(index);
          writeSession(INDEX_KEY, index);
        }
      },
      { root, threshold: [0.6] },
    );
    for (const node of cardRefs.current) if (node) observer.observe(node);
    return () => observer.disconnect();
  }, [items]);

  function freshFeed() {
    const fresh = newSeed();
    writeSession(SEED_KEY, fresh);
    writeSession(INDEX_KEY, 0);
    setSeed(fresh);
    setItems([]);
    containerRef.current?.scrollTo({ top: 0 });
    void start(fresh, 0);
  }

  return (
    <>
      <div
        ref={containerRef}
        className="fixed inset-x-0 bottom-16 top-[var(--app-header-h)] snap-y snap-mandatory overflow-y-auto overscroll-contain"
      >
        {status === "loading" ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-[var(--text-secondary)]">Preparing your feed...</p>
          </div>
        ) : null}

        {status === "error" ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="text-sm text-[var(--text-secondary)]">The feed couldn&apos;t load right now.</p>
            <button
              type="button"
              onClick={() => seed !== null && void start(seed, 0)}
              className="rounded-full bg-[var(--accent-primary)] px-4 py-2 text-sm font-semibold text-[var(--on-accent-text)]"
            >
              Try again
            </button>
          </div>
        ) : null}

        {status === "ready" && adhkarDue ? (
          <section className="flex h-full snap-start snap-always flex-col px-3 pb-3 pt-14 md:px-5">
            <div className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col">
              <AdhkarFeedCard time={adhkarDue.time} done={adhkarDue.done} total={adhkarDue.total} />
            </div>
          </section>
        ) : null}

        {items.map((item, index) => (
          <section
            key={item.id}
            data-feed-index={index}
            data-feed-kind={item.kind}
            ref={(node) => {
              cardRefs.current[index] = node;
            }}
            className="flex h-full snap-start snap-always flex-col px-3 pb-3 pt-14 md:px-5"
          >
            <div className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col">
              <FeedItemCard item={item} index={index} isActive={index === activeIndex} />
            </div>
          </section>
        ))}

        {status === "ready" && !exhausted ? <div ref={loadTriggerRef} className="h-1 w-full" /> : null}

        {status === "ready" && exhausted ? (
          <section className="flex h-full snap-start snap-always flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="font-playfair text-2xl font-semibold text-[var(--text-primary)]">You&apos;ve seen everything for now</p>
            <p className="text-sm italic text-[var(--text-secondary)]">
              &quot;We have not sent down the Qur&apos;an to you to cause you distress&quot; · Ta-Ha 20:2
            </p>
            <button
              type="button"
              onClick={freshFeed}
              className="rounded-full bg-[var(--accent-primary)] px-5 py-2.5 text-sm font-semibold text-[var(--on-accent-text)]"
            >
              Start a fresh feed
            </button>
          </section>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => setMoodOpen(true)}
        className="fixed left-1/2 top-[calc(var(--app-header-h)+0.75rem)] z-30 -translate-x-1/2 rounded-full border border-[var(--border)] bg-[var(--card-bg)]/90 px-4 py-2 text-sm font-medium text-[var(--text-primary)] shadow-[var(--card-shadow)] backdrop-blur"
      >
        How are you feeling?
      </button>

      {moodOpen ? <MoodSheet onClose={() => setMoodOpen(false)} /> : null}
    </>
  );
}
