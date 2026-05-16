import { qfUserGet, qfUserPost } from "@/lib/quranFoundation/client";

/**
 * Sync bookmark to Quran Foundation User API.
 * POST /api/v4/bookmarks — https://api-docs.quran.foundation
 */
export async function syncBookmarkToQF(verseKey: string, qfAuthToken: string): Promise<boolean> {
  try {
    const response = await qfUserPost(
      "/api/v4/bookmarks",
      { verse_key: verseKey },
      qfAuthToken,
    );
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Sync reflection to Quran Foundation User API.
 * POST /api/v4/reflections — https://api-docs.quran.foundation
 */
export async function syncReflectionToQF(verseKey: string, text: string, qfAuthToken: string): Promise<boolean> {
  try {
    const response = await qfUserPost(
      "/api/v4/reflections",
      { verse_key: verseKey, text },
      qfAuthToken,
    );
    return response.ok;
  } catch {
    return false;
  }
}

export type QfStreakPayload = {
  current: number | null;
  longest: number | null;
};

/**
 * Fetch streaks from Quran Foundation User API.
 * GET /api/v4/streaks — https://api-docs.quran.foundation
 */
export async function fetchStreakFromQF(qfAuthToken: string): Promise<QfStreakPayload | null> {
  try {
    const response = await qfUserGet("/api/v4/streaks", qfAuthToken);
    if (!response.ok) return null;
    const json = (await response.json()) as Record<string, unknown>;
    const streaks = (json.streaks as Record<string, unknown> | undefined) ?? json;
    const current =
      typeof streaks.current_streak === "number"
        ? streaks.current_streak
        : typeof streaks.current === "number"
          ? streaks.current
          : null;
    const longest =
      typeof streaks.longest_streak === "number"
        ? streaks.longest_streak
        : typeof streaks.longest === "number"
          ? streaks.longest
          : null;
    if (current === null && longest === null) return null;
    return { current, longest };
  } catch {
    return null;
  }
}
