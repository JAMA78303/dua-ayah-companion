"use server";

import { isCurrentUserAdmin } from "@/lib/auth/isAdmin";
import { createClient } from "@/lib/supabase/server";
import { isUuid } from "@/lib/uuid";
import { EMOTION_CATEGORIES } from "@/types/emotions";

type Result = { ok: true } | { ok: false; error: string };

const PAIRING_STATUSES = ["pending", "approved", "rejected"] as const;
const TONES = ["comfort", "warning", "balance"] as const;
const MAX_TEXT = 4000;

export interface PairingReviewInput {
  status: (typeof PAIRING_STATUSES)[number];
  reviewerNotes: string;
  emotionCategory: string;
  toneTag: string;
  tafsirSummary: string;
  reflectionPrompts: string[];
  duaTransliteration: string;
  duaTranslation: string;
  propheticStory: string;
}

function clean(value: string) {
  return value.trim().slice(0, MAX_TEXT);
}

/** Approve / reject / edit a dua pairing. Arabic text is deliberately not editable here. */
export async function reviewPairing(id: string, input: PairingReviewInput): Promise<Result> {
  if (!isUuid(id)) return { ok: false, error: "Unknown dua" };
  if (!PAIRING_STATUSES.includes(input.status)) return { ok: false, error: "Invalid status" };
  if (!(EMOTION_CATEGORIES as readonly string[]).includes(input.emotionCategory)) return { ok: false, error: "Invalid category" };
  if (!(TONES as readonly string[]).includes(input.toneTag)) return { ok: false, error: "Invalid tone" };
  const prompts = input.reflectionPrompts.map(clean).filter(Boolean);
  if (!clean(input.tafsirSummary) || !clean(input.duaTranslation) || prompts.length === 0) {
    return { ok: false, error: "Summary, dua translation and at least one prompt are required" };
  }
  if (!(await isCurrentUserAdmin())) return { ok: false, error: "Admins only" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from("ayah_pairings")
    .update({
      status: input.status,
      reviewer_notes: clean(input.reviewerNotes) || null,
      emotion_category: input.emotionCategory,
      tone_tag: input.toneTag,
      tafsir_summary: clean(input.tafsirSummary),
      reflection_prompts: prompts,
      dua_transliteration: clean(input.duaTransliteration) || null,
      dua_translation: clean(input.duaTranslation),
      prophetic_story: clean(input.propheticStory) || null,
      reviewed_by: user?.id ?? null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("id");

  if (error) return { ok: false, error: error.message };
  if (!data?.length) return { ok: false, error: "Nothing was updated" };
  return { ok: true };
}

const CONTENT_KEY = /^(story:[a-z-]+:\d+|name:\d+)$/;

/** Mark a story chapter or Name as reviewed ("approved"), hide it from the feed, or clear the review. */
export async function reviewContent(
  contentKey: string,
  status: "approved" | "hidden" | null,
  notes: string,
): Promise<Result> {
  if (!CONTENT_KEY.test(contentKey)) return { ok: false, error: "Unknown item" };
  if (!(await isCurrentUserAdmin())) return { ok: false, error: "Admins only" };

  const supabase = await createClient();
  if (status === null) {
    const { error } = await supabase.from("content_reviews").delete().eq("content_key", contentKey);
    return error ? { ok: false, error: error.message } : { ok: true };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { error } = await supabase.from("content_reviews").upsert({
    content_key: contentKey,
    status,
    notes: clean(notes) || null,
    reviewed_by: user?.id ?? null,
    reviewed_at: new Date().toISOString(),
  });
  return error ? { ok: false, error: error.message } : { ok: true };
}
