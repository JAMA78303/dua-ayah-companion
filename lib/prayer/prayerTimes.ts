/**
 * Prayer times and qibla, computed in the browser:
 *  - times and qibla: Aladhan (api.aladhan.com), always by coordinates — its city/address lookup
 *    returns placeholder coordinates, so we never use it;
 *  - place search: Open-Meteo geocoding (geocoding-api.open-meteo.com).
 * Coordinates are rounded to 2 decimals (~1 km) before they're stored or sent anywhere.
 */

export const PRAYERS = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;
export type PrayerName = (typeof PRAYERS)[number];

export interface PrayerLocation {
  latitude: number;
  longitude: number;
  label: string;
}

export interface PrayerSettings {
  location: PrayerLocation | null;
  /** Aladhan calculation method id (3 = Muslim World League). */
  method: number;
  /** Asr school: 0 = standard (Shafi'i, Maliki, Hanbali), 1 = Hanafi. */
  school: 0 | 1;
}

export const CALCULATION_METHODS: { id: number; name: string }[] = [
  { id: 3, name: "Muslim World League" },
  { id: 2, name: "Islamic Society of North America (ISNA)" },
  { id: 15, name: "Moonsighting Committee Worldwide" },
  { id: 5, name: "Egyptian General Authority of Survey" },
  { id: 4, name: "Umm Al-Qura University, Makkah" },
  { id: 1, name: "University of Islamic Sciences, Karachi" },
  { id: 8, name: "Gulf Region" },
  { id: 9, name: "Kuwait" },
  { id: 10, name: "Qatar" },
  { id: 16, name: "Dubai" },
  { id: 11, name: "Majlis Ugama Islam Singapura, Singapore" },
  { id: 17, name: "JAKIM, Malaysia" },
  { id: 20, name: "Kementerian Agama, Indonesia" },
  { id: 12, name: "Union des Organisations Islamiques de France" },
  { id: 13, name: "Diyanet İşleri Başkanlığı, Turkey" },
  { id: 14, name: "Spiritual Administration of Muslims of Russia" },
  { id: 18, name: "Tunisia" },
  { id: 19, name: "Algeria" },
  { id: 21, name: "Morocco" },
  { id: 22, name: "Comunidade Islamica de Lisboa" },
  { id: 23, name: "Ministry of Awqaf, Jordan" },
  { id: 7, name: "Institute of Geophysics, University of Tehran" },
  { id: 0, name: "Shia Ithna-Ashari, Leva Institute, Qum" },
];

const SETTINGS_KEY = "dac-prayer-settings";
const DEFAULTS: PrayerSettings = { location: null, method: 3, school: 0 };

const round2 = (n: number) => Math.round(n * 100) / 100;

export function roundedLocation(latitude: number, longitude: number, label: string): PrayerLocation {
  return { latitude: round2(latitude), longitude: round2(longitude), label };
}

export function readPrayerSettings(): PrayerSettings {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(SETTINGS_KEY) ?? "null") as Partial<PrayerSettings> | null;
    return { ...DEFAULTS, ...(parsed ?? {}) };
  } catch {
    return DEFAULTS;
  }
}

export function writePrayerSettings(settings: PrayerSettings) {
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    /* settings just won't persist */
  }
}

export interface DayTimes {
  timings: Record<PrayerName, string>;
  timezone: string;
}

function ddmmyyyy(date: Date) {
  return `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`;
}

export async function fetchDayTimes(settings: PrayerSettings, date: Date): Promise<DayTimes> {
  const { location, method, school } = settings;
  if (!location) throw new Error("No location");
  const params = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    method: String(method),
    school: String(school),
  });
  const response = await fetch(`https://api.aladhan.com/v1/timings/${ddmmyyyy(date)}?${params.toString()}`);
  if (!response.ok) throw new Error(`Prayer times unavailable (${response.status})`);
  const { data } = (await response.json()) as { data: { timings: Record<string, string>; meta: { timezone: string } } };
  const timings = Object.fromEntries(PRAYERS.map((p) => [p, data.timings[p]!.slice(0, 5)])) as Record<PrayerName, string>;
  return { timings, timezone: data.meta.timezone };
}

export async function fetchQiblaDirection(location: PrayerLocation): Promise<number> {
  const response = await fetch(`https://api.aladhan.com/v1/qibla/${location.latitude}/${location.longitude}`);
  if (!response.ok) throw new Error("Qibla unavailable");
  const { data } = (await response.json()) as { data: { direction: number } };
  return data.direction;
}

export interface PlaceResult {
  label: string;
  latitude: number;
  longitude: number;
}

export async function searchPlaces(query: string): Promise<PlaceResult[]> {
  const params = new URLSearchParams({ name: query.trim(), count: "6", language: "en", format: "json" });
  const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params.toString()}`);
  if (!response.ok) throw new Error("Place search unavailable");
  const { results = [] } = (await response.json()) as {
    results?: { name: string; admin1?: string; country?: string; latitude: number; longitude: number }[];
  };
  return results.map((r) => ({
    label: [r.name, r.admin1, r.country].filter(Boolean).join(", "),
    latitude: r.latitude,
    longitude: r.longitude,
  }));
}

/** "HH:MM" for the current moment in the place's own timezone. */
export function nowInTimezone(timezone: string, now = new Date()): string {
  return new Intl.DateTimeFormat("en-GB", { timeZone: timezone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(now);
}

const minutes = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));

/** The next prayer today (Sunrise excluded), or null after Isha. */
export function nextPrayer(timings: Record<PrayerName, string>, nowHHMM: string): { name: PrayerName; inMinutes: number } | null {
  const now = minutes(nowHHMM);
  for (const name of PRAYERS) {
    if (name === "Sunrise") continue;
    const at = minutes(timings[name]);
    if (at > now) return { name, inMinutes: at - now };
  }
  return null;
}
