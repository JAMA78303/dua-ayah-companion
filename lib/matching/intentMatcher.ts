import { createClient } from "@/lib/supabase/client";
import type { EmotionCategory } from "@/types/emotions";

interface IntentMapping {
  keyword: string;
  category: EmotionCategory;
  weight: number;
}

const MAPPING_CACHE_TTL_MS = 5 * 60 * 1000;
const DIRECT_PHRASE_OVERRIDES: Array<{ regex: RegExp; category: EmotionCategory }> = [
  { regex: /\bi feel overwhelmed\b/i, category: "anxiety" },
  { regex: /\boverwhelmed\b/i, category: "anxiety" },
  { regex: /\bi feel sad\b/i, category: "sadness" },
  { regex: /\bsad\b/i, category: "sadness" },
  { regex: /\bi feel guilty\b/i, category: "guilt" },
  { regex: /\bguilty\b/i, category: "guilt" },
  { regex: /\bi feel alone\b/i, category: "loneliness" },
  { regex: /\blonely\b/i, category: "loneliness" },
  { regex: /\bi need forgiveness\b/i, category: "forgiveness" },
  { regex: /\bforgive me\b/i, category: "forgiveness" },
];
const BUILTIN_MAPPINGS: IntentMapping[] = [
  { keyword: "i feel sad", category: "sadness", weight: 1 },
  { keyword: "sad", category: "sadness", weight: 0.9 },
  { keyword: "grief", category: "grief", weight: 0.9 },
  { keyword: "i feel overwhelmed", category: "anxiety", weight: 1 },
  { keyword: "anxious", category: "anxiety", weight: 0.9 },
  { keyword: "worried", category: "anxiety", weight: 0.9 },
  { keyword: "guidance", category: "guidance", weight: 0.8 },
  { keyword: "patient", category: "patience", weight: 0.8 },
  { keyword: "grateful", category: "gratitude", weight: 0.9 },
  { keyword: "hope", category: "hope", weight: 0.8 },
  { keyword: "forgiveness", category: "forgiveness", weight: 0.9 },
  { keyword: "repent", category: "forgiveness", weight: 0.9 },
  { keyword: "alone", category: "loneliness", weight: 0.9 },
  { keyword: "lonely", category: "loneliness", weight: 0.9 },
];

let cachedMappings: IntentMapping[] | null = null;
let lastFetchedAt = 0;

function escapeRegex(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function getMappings(): Promise<IntentMapping[]> {
  const now = Date.now();
  const isCacheFresh = cachedMappings !== null && now - lastFetchedAt < MAPPING_CACHE_TTL_MS;

  if (isCacheFresh && cachedMappings) return cachedMappings;

  /* BUG-001: drop stale cache before refetch so admin mapping updates propagate. */
  cachedMappings = null;

  const supabase = createClient();
  const { data, error } = await supabase
    .from("intent_mappings")
    .select("keyword, category, weight");

  if (error) throw new Error(`Failed to fetch mappings: ${error.message}`);

  cachedMappings = [...((data ?? []) as IntentMapping[]), ...BUILTIN_MAPPINGS];
  lastFetchedAt = Date.now();
  return cachedMappings;
}

export async function matchIntent(input: string): Promise<EmotionCategory | null> {
  const normalised = input.toLowerCase().replace(/[^\w\s]/g, " ").trim();
  if (!normalised) return null;

  const directMatch = DIRECT_PHRASE_OVERRIDES.find((item) => item.regex.test(normalised));
  if (directMatch) return directMatch.category;

  const mappings = await getMappings();
  const candidates = mappings
    .filter((mapping) => {
      const regex = new RegExp(`\\b${escapeRegex(mapping.keyword.toLowerCase())}\\b`, "i");
      return regex.test(normalised);
    })
    .sort((a, b) => b.weight - a.weight);

  return candidates[0]?.category ?? null;
}
