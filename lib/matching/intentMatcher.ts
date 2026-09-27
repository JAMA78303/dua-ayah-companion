import { createClient } from "@/lib/supabase/client";
import type { EmotionCategory } from "@/types/emotions";

export interface IntentMapping {
  keyword: string;
  category: EmotionCategory;
  weight: number;
}

const MAPPING_CACHE_TTL_MS = 5 * 60 * 1000;

/** Words that cancel a keyword when they appear shortly before it ("I'm not sad"). */
const NEGATORS = new Set(["not", "no", "never", "dont", "doesnt", "didnt", "isnt", "arent", "wasnt", "werent", "aint", "without", "hardly"]);
const NEGATION_WINDOW = 3;

/**
 * Built-in keywords, merged with the database's intent_mappings. Phrases outweigh single words so
 * "I lost someone" (grief) beats "lost" (guidance). Keywords are matched on whole words after
 * normalising, so "hope" doesn't match "hopeless" (which has its own entry).
 */
export const BUILTIN_MAPPINGS: IntentMapping[] = [
  ...(["anxious", "anxiety", "worried", "stressed", "panic", "panicking", "overthinking"] as const).map((keyword) => ({ keyword, category: "anxiety" as const, weight: 0.9 })),
  ...(["worry", "worrying", "nervous", "scared", "afraid", "stress"] as const).map((keyword) => ({ keyword, category: "anxiety" as const, weight: 0.8 })),
  { keyword: "overwhelmed", category: "anxiety", weight: 1 },
  { keyword: "fear", category: "anxiety", weight: 0.7 },
  { keyword: "exam", category: "anxiety", weight: 0.6 },
  { keyword: "exams", category: "anxiety", weight: 0.6 },

  ...(["sad", "depressed", "unhappy", "heartbroken", "miserable"] as const).map((keyword) => ({ keyword, category: "sadness" as const, weight: 0.9 })),
  ...(["upset", "depression", "feeling low", "feel low"] as const).map((keyword) => ({ keyword, category: "sadness" as const, weight: 0.8 })),
  { keyword: "crying", category: "sadness", weight: 0.7 },

  ...(["grateful", "thankful", "alhamdulillah", "thank allah"] as const).map((keyword) => ({ keyword, category: "gratitude" as const, weight: 0.9 })),
  { keyword: "blessed", category: "gratitude", weight: 0.8 },
  { keyword: "happy", category: "gratitude", weight: 0.7 },

  { keyword: "dont know what to do", category: "guidance", weight: 1 },
  ...(["confused", "istikhara"] as const).map((keyword) => ({ keyword, category: "guidance" as const, weight: 0.9 })),
  ...(["guidance", "unsure", "decision", "which way"] as const).map((keyword) => ({ keyword, category: "guidance" as const, weight: 0.8 })),
  ...(["decide", "direction"] as const).map((keyword) => ({ keyword, category: "guidance" as const, weight: 0.7 })),
  { keyword: "lost", category: "guidance", weight: 0.6 },

  { keyword: "going through a lot", category: "patience", weight: 0.9 },
  ...(["patient", "patience", "exhausted", "struggling", "hardship", "hard time"] as const).map((keyword) => ({ keyword, category: "patience" as const, weight: 0.8 })),
  ...(["waiting", "so tired"] as const).map((keyword) => ({ keyword, category: "patience" as const, weight: 0.7 })),
  { keyword: "difficult", category: "patience", weight: 0.6 },

  ...(["guilty", "guilt", "regret"] as const).map((keyword) => ({ keyword, category: "guilt" as const, weight: 0.9 })),
  ...(["ashamed"] as const).map((keyword) => ({ keyword, category: "guilt" as const, weight: 0.8 })),
  { keyword: "feel bad", category: "guilt", weight: 0.7 },

  { keyword: "passed away", category: "grief", weight: 1 },
  ...(["grief", "grieving", "died", "funeral", "bereaved"] as const).map((keyword) => ({ keyword, category: "grief" as const, weight: 0.9 })),
  ...(["death", "loss", "miss her", "miss him", "miss my"] as const).map((keyword) => ({ keyword, category: "grief" as const, weight: 0.8 })),

  ...(["hopeless", "no hope"] as const).map((keyword) => ({ keyword, category: "hope" as const, weight: 1 })),
  ...(["hopeful", "despair"] as const).map((keyword) => ({ keyword, category: "hope" as const, weight: 0.9 })),
  ...(["hope", "give up", "giving up"] as const).map((keyword) => ({ keyword, category: "hope" as const, weight: 0.8 })),

  ...(["forgiveness", "repent", "repentance"] as const).map((keyword) => ({ keyword, category: "forgiveness" as const, weight: 0.9 })),
  ...(["forgive", "forgive me", "sinned"] as const).map((keyword) => ({ keyword, category: "forgiveness" as const, weight: 0.8 })),
  ...(["sin", "sins"] as const).map((keyword) => ({ keyword, category: "forgiveness" as const, weight: 0.7 })),

  ...(["alone", "lonely", "loneliness", "isolated", "no friends"] as const).map((keyword) => ({ keyword, category: "loneliness" as const, weight: 0.9 })),
  { keyword: "left out", category: "loneliness", weight: 0.8 },
  { keyword: "nobody", category: "loneliness", weight: 0.7 },
];

/**
 * Lower-case words only, with apostrophes dropped ("can't" -> "cant", "I'm" -> "im"). Used for both the
 * input and every keyword, so database keywords with apostrophes match what people type.
 */
export function normaliseForMatching(text: string): string {
  return text
    .toLowerCase()
    .replace(/[’‘`']/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .join(" ");
}

/** Best-scoring feeling for the text, ignoring negated keywords; null when nothing matches. */
export function scoreIntent(input: string, mappings: IntentMapping[]): EmotionCategory | null {
  const tokens = normaliseForMatching(input).split(" ").filter(Boolean);
  if (tokens.length === 0) return null;

  const scores = new Map<EmotionCategory, number>();
  for (const mapping of mappings) {
    const keyword = normaliseForMatching(mapping.keyword).split(" ").filter(Boolean);
    if (keyword.length === 0) continue;
    for (let i = 0; i + keyword.length <= tokens.length; i++) {
      if (!keyword.every((word, k) => tokens[i + k] === word)) continue;
      const negated = tokens.slice(Math.max(0, i - NEGATION_WINDOW), i).some((t) => NEGATORS.has(t));
      if (!negated) scores.set(mapping.category, (scores.get(mapping.category) ?? 0) + mapping.weight);
    }
  }

  let best: EmotionCategory | null = null;
  let bestScore = 0;
  for (const [category, score] of scores) {
    if (score > bestScore) {
      best = category;
      bestScore = score;
    }
  }
  return best;
}

let cachedMappings: IntentMapping[] | null = null;
let lastFetchedAt = 0;

async function getMappings(): Promise<IntentMapping[]> {
  if (cachedMappings && Date.now() - lastFetchedAt < MAPPING_CACHE_TTL_MS) return cachedMappings;

  try {
    const { data, error } = await createClient().from("intent_mappings").select("keyword, category, weight");
    if (error) throw error;
    cachedMappings = [...((data ?? []) as IntentMapping[]), ...BUILTIN_MAPPINGS];
    lastFetchedAt = Date.now();
    return cachedMappings;
  } catch {
    // Database unreachable: the built-in keywords still give a useful match.
    return BUILTIN_MAPPINGS;
  }
}

export async function matchIntent(input: string): Promise<EmotionCategory | null> {
  if (!normaliseForMatching(input)) return null;
  return scoreIntent(input, await getMappings());
}
