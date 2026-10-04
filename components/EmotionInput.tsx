"use client";

import { FormEvent, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { MessageCircleHeart, Sparkles } from "lucide-react";

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
    <form onSubmit={onSubmit} className="space-y-3.5">
      <label htmlFor="emotion-input" className="sr-only">
        How are you feeling right now?
      </label>
      <div className="flex min-h-[104px] gap-2.5 rounded-[18px] border border-[var(--border)] bg-[var(--input-bg)] p-4 focus-within:border-[var(--accent-primary)]">
        <MessageCircleHeart className="mt-0.5 size-5 shrink-0 text-[var(--accent-primary)]" strokeWidth={1.6} aria-hidden />
        <textarea
          id="emotion-input"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Write what's on your heart…"
          rows={3}
          className="w-full flex-1 resize-none bg-transparent font-nunito text-sm leading-[1.45] text-[var(--text-primary)] outline-none placeholder:text-[var(--text-secondary)]"
        />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[var(--gold)] px-4 text-[13px] font-bold text-[#0a0a0f] transition hover:opacity-90 disabled:opacity-60"
      >
        <Sparkles className="size-[17px]" strokeWidth={1.6} aria-hidden />
        {isPending ? "Finding…" : "Find guidance"}
      </button>
    </form>
  );
}
