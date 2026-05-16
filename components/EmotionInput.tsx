"use client";

import { FormEvent, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { matchIntent } from "@/lib/matching/intentMatcher";
import type { EmotionCategory } from "@/types/emotions";

interface EmotionInputProps {
  onNoMatch: () => void;
}

export function EmotionInput({ onNoMatch }: EmotionInputProps) {
  const [value, setValue] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const lastSubmitAtRef = useRef(0);
  const concurrentGuardRef = useRef(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const now = Date.now();
    if (now - lastSubmitAtRef.current < 300) return;
    lastSubmitAtRef.current = now;

    if (isPending || concurrentGuardRef.current) return;

    startTransition(async () => {
      if (concurrentGuardRef.current) return;
      concurrentGuardRef.current = true;
      try {
        const trimmed = value.trim();
        if (!trimmed) {
          onNoMatch();
          return;
        }

        const match = (await matchIntent(trimmed)) as EmotionCategory | null;
        if (!match) {
          onNoMatch();
          return;
        }

        router.push(`/result?category=${match}`);
      } finally {
        concurrentGuardRef.current = false;
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label htmlFor="emotion-input" className="sr-only">
        How are you feeling right now?
      </label>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <textarea
          id="emotion-input"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="How are you feeling right now?"
          rows={3}
          className="min-h-[100px] w-full flex-1 resize-y rounded-2xl border-[1.5px] border-[var(--border)] bg-[var(--input-bg)] px-6 py-5 font-nunito text-sm not-italic text-[var(--text-primary)] shadow-[var(--card-shadow)] outline-none placeholder:text-[var(--text-secondary)] placeholder:italic focus:border-[var(--accent-primary)]/50 focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--accent-primary)_8%,transparent)]"
        />
        <button
          type="submit"
          disabled={isPending}
          className="h-fit shrink-0 rounded-2xl bg-[var(--accent-primary)] px-6 py-3 text-sm font-semibold text-[var(--on-accent-text)] shadow-[var(--card-shadow)] transition hover:opacity-90 disabled:opacity-60"
        >
          {isPending ? "Matching..." : "Find"}
        </button>
      </div>
    </form>
  );
}
