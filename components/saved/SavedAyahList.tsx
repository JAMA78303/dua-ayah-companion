"use client";

import Link from "next/link";

import type { SavedRowWithPairing } from "@/components/saved/SavedSignedIn";
import { AyahCard } from "@/components/AyahCard";

interface SavedAyahListProps {
  rows: SavedRowWithPairing[];
}

export function SavedAyahList({ rows }: SavedAyahListProps) {
  return (
    <div className="space-y-8">
      {rows.map((row) => {
        const p = row.ayah_pairings;
        if (!p) {
          return (
            <p key={row.id} className="text-sm text-[var(--text-secondary)]">
              Pairing unavailable (deleted).{" "}
              <Link href="/saved" className="text-[var(--accent-primary)]">
                Refresh
              </Link>
            </p>
          );
        }
        return (
          <div key={row.id} className="space-y-2">
            <p className="text-xs text-[var(--text-secondary)]">Saved {new Date(row.created_at).toLocaleString()}</p>
            <AyahCard
              pairingId={p.id}
              surah={p.surah}
              ayahNumber={p.ayah_number}
              arabicText={p.arabic_text}
              translation={p.translation}
              tafsirSummary={p.tafsir_summary}
              reflectionPrompts={p.reflection_prompts}
              propheticStory={p.prophetic_story}
              prophetName={p.prophet_name}
              duaText={p.dua_text}
              duaTransliteration={p.dua_transliteration}
              duaTranslation={p.dua_translation}
              toneTag={p.tone_tag}
              sourceType={p.source_type ?? "quranic"}
              hadithSource={p.hadith_source}
            />
          </div>
        );
      })}
    </div>
  );
}
