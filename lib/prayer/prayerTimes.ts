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

/** Our spellings of the Islamic months, by number. */
export const HIJRI_MONTHS = [
  "Muharram",
  "Safar",
  "Rabi' al-Awwal",
  "Rabi' al-Thani",
  "Jumada al-Ula",
  "Jumada al-Akhirah",
  "Rajab",
  "Sha'ban",
  "Ramadan",
  "Shawwal",
  "Dhul-Qa'dah",
  "Dhul-Hijjah",
] as const;

export interface HijriDate {
  day: number;
  /** 1 to 12. */
  month: number;
  year: number;
}

export interface DayTimes {
  timings: Record<PrayerName, string>;
  /** When the last third of the night begins ("HH:MM"). */
  lastThird: string | null;
  /** Aladhan's calculated date, which can differ by a day from the local moon sighting. */
  hijri: HijriDate | null;
  timezone: string;
}

function parseHijri(hijri: { day?: string; month?: { number?: number }; year?: string } | undefined): HijriDate | null {
  const day = Number(hijri?.day);
  const month = Number(hijri?.month?.number);
  const year = Number(hijri?.year);
  if (!Number.isInteger(day) || day < 1 || day > 30 || !Number.isInteger(month) || month < 1 || month > 12 || !year) return null;
  return { day, month, year };
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
  const { data } = (await response.json()) as {
    data: {
      timings: Record<string, string>;
      date?: { hijri?: { day?: string; month?: { number?: number }; year?: string } };
      meta: { timezone: string };
    };
  };
  const timings = Object.fromEntries(PRAYERS.map((p) => [p, data.timings[p]!.slice(0, 5)])) as Record<PrayerName, string>;
  return {
    timings,
    lastThird: data.timings.Lastthird?.slice(0, 5) ?? null,
    hijri: parseHijri(data.date?.hijri),
    timezone: data.meta.timezone,
  };
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

/** Minutes since midnight for "HH:MM". */
export const minutesOf = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));

/** The next prayer today (Sunrise excluded), or null after Isha. */
export function nextPrayer(timings: Record<PrayerName, string>, nowHHMM: string): { name: PrayerName; inMinutes: number } | null {
  const now = minutesOf(nowHHMM);
  for (const name of PRAYERS) {
    if (name === "Sunrise") continue;
    const at = minutesOf(timings[name]);
    if (at > now) return { name, inMinutes: at - now };
  }
  return null;
}

const hhmm = (totalMinutes: number) => {
  const m = ((Math.round(totalMinutes) % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
};

/** Minutes after sunrise before Duha begins: the sun must have risen and be up (Sahih Muslim 832). */
export const DUHA_AFTER_SUNRISE_MINUTES = 15;
/** Minutes before Dhuhr that Duha ends: no prayer while the sun is at its height (Sahih Muslim 832). */
export const DUHA_BEFORE_DHUHR_MINUTES = 10;

/**
 * The voluntary Duha prayer: from once the sun is up until shortly before Dhuhr, best when the sun is hot
 * (Sahih Muslim 748), taken as halfway between sunrise and Dhuhr. All three are approximate.
 */
export function duhaWindow(timings: Record<PrayerName, string>): { start: string; best: string; end: string } {
  const sunrise = minutesOf(timings.Sunrise);
  const dhuhr = minutesOf(timings.Dhuhr);
  return {
    start: hhmm(sunrise + DUHA_AFTER_SUNRISE_MINUTES),
    best: hhmm((sunrise + dhuhr) / 2),
    end: hhmm(dhuhr - DUHA_BEFORE_DHUHR_MINUTES),
  };
}
