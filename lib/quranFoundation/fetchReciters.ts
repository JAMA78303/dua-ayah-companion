import { qfContentGet } from "@/lib/quranFoundation/client";

export type QfReciter = {
  id: number;
  name: string;
  arabic_name: string;
  style: string | null;
};

/** Pinned at top of selector (Mishari, then Minshawi). */
export const PINNED_RECITER_IDS = [7, 9] as const;

export const DEFAULT_RECITER_ID = 7;

/**
 * Listed by the API but not offered: 173 is a second Mishari al-Afasy set ("streaming") whose ayah timings
 * are broken (zero-length in Al-Fatihah) and which has no per-ayah files. His main recording, 7, is listed.
 */
export const HIDDEN_RECITER_IDS: readonly number[] = [173];

let recitersCache: QfReciter[] | null = null;
let inflightReciters: Promise<QfReciter[]> | null = null;
let loggedReciterList = false;

function pickString(value: unknown): string | null {
  if (typeof value === "string" && value.trim()) return value.trim();
  return null;
}

function normalizeStyle(style: unknown): string | null {
  if (typeof style === "string" && style.trim()) return style.trim();
  if (style && typeof style === "object" && "name" in style) {
    return pickString((style as { name?: unknown }).name);
  }
  return null;
}

function normalizeReciter(raw: Record<string, unknown>): QfReciter | null {
  const id = typeof raw.id === "number" ? raw.id : Number(raw.id);
  if (!Number.isFinite(id) || id < 1) return null;

  const name = pickString(raw.name);
  if (!name) return null;

  const arabic_name = pickString(raw.arabic_name) ?? name;

  return {
    id,
    name,
    arabic_name,
    style: normalizeStyle(raw.style),
  };
}

/** Verified from live API 2026-05 — Minshawi is id 9, not 3 (Sudais). */
export const FALLBACK_RECITERS: QfReciter[] = [
  {
    id: 7,
    name: "Mishari Rashid Al-Afasy",
    arabic_name: "مشاري راشد العفاسي",
    style: "Murattal",
  },
  {
    id: 9,
    name: "Mohamed Siddiq Al-Minshawi",
    arabic_name: "محمد صديق المنشاوي",
    style: "Murattal",
  },
  {
    id: 1,
    name: "Abdul Basit Abdul Samad",
    arabic_name: "عبد الباسط عبد الصمد",
    style: "Mujawwad",
  },
  {
    id: 4,
    name: "Abu Bakr Al-Shatri",
    arabic_name: "أبو بكر الشاطري",
    style: "Murattal",
  },
  {
    id: 5,
    name: "Hani Ar-Rifai",
    arabic_name: "هاني الرفاعي",
    style: "Murattal",
  },
  {
    id: 2,
    name: "Abdul Rashid Sufi",
    arabic_name: "عبد الرشيد صوفي",
    style: "Murattal",
  },
  {
    id: 6,
    name: "Mahmoud Khalil Al-Hussary",
    arabic_name: "محمود خليل الحصري",
    style: "Murattal",
  },
];

export function sortRecitersForDisplay(list: QfReciter[]): QfReciter[] {
  const byId = new Map(list.map((r) => [r.id, r]));
  const pinned: QfReciter[] = [];
  for (const id of PINNED_RECITER_IDS) {
    const reciter = byId.get(id);
    if (reciter) pinned.push(reciter);
  }
  const pinnedSet = new Set<number>(PINNED_RECITER_IDS);
  const rest = list.filter((r) => !pinnedSet.has(r.id));
  return [...pinned, ...rest];
}

export function getReciterShortName(name: string): string {
  if (name.includes("Afasy") || name.includes("`Afasy")) return "Al-Afasy";
  if (name.includes("Minshawi")) return "Al-Minshawi";
  if (name.includes("Basit")) return "Abdul Basit";
  if (name.includes("Shatri")) return "Al-Shatri";
  if (name.includes("Rifai")) return "Ar-Rifai";
  if (name.includes("Husary") || name.includes("Hussary")) return "Al-Hussary";
  const parts = name.trim().split(/\s+/);
  return parts.length > 1 ? parts[parts.length - 1]! : name;
}

async function fetchRecitersUncached(): Promise<QfReciter[]> {
  try {
    const response = await qfContentGet("/audio/reciters?language=en", {
      next: { revalidate: 86_400 * 7 },
    });
    if (!response.ok) return FALLBACK_RECITERS;

    const payload = (await response.json()) as { reciters?: unknown[] };
    const raw = Array.isArray(payload.reciters) ? payload.reciters : [];
    const parsed = raw
      .map((item) =>
        item && typeof item === "object" ? normalizeReciter(item as Record<string, unknown>) : null,
      )
      .filter((r): r is QfReciter => r !== null && !HIDDEN_RECITER_IDS.includes(r.id));

    const list = parsed.length > 0 ? sortRecitersForDisplay(parsed) : FALLBACK_RECITERS;

    if (!loggedReciterList) {
      loggedReciterList = true;
      console.log("[dac] QF reciters (full list):", list);
    }

    return list;
  } catch {
    return FALLBACK_RECITERS;
  }
}

export async function fetchReciters(): Promise<QfReciter[]> {
  if (recitersCache) return recitersCache;

  if (!inflightReciters) {
    inflightReciters = fetchRecitersUncached().then((list) => {
      recitersCache = list;
      inflightReciters = null;
      return list;
    });
  }

  return inflightReciters;
}

export function getCachedReciters(): QfReciter[] | null {
  return recitersCache;
}

export function findReciterById(id: number, list?: QfReciter[]): QfReciter | undefined {
  const source = list ?? recitersCache ?? FALLBACK_RECITERS;
  return source.find((r) => r.id === id);
}
