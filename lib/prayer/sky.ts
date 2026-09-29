import { moonCycleFraction } from "@/lib/prayer/moon";
import { duhaWindow, minutesOf, type PrayerName } from "@/lib/prayer/prayerTimes";

/** The part of the day the sky is drawn for, named after the prayer time it falls in. */
export type SkyPeriod = "night" | "fajr" | "morning" | "dhuhr" | "asr" | "maghrib";

const DAY_MINUTES = 1440;

export function skyPeriod(timings: Record<PrayerName, string>, nowMinutes: number): SkyPeriod {
  if (nowMinutes < minutesOf(timings.Fajr) || nowMinutes >= minutesOf(timings.Isha)) return "night";
  if (nowMinutes < minutesOf(timings.Sunrise)) return "fajr";
  if (nowMinutes < minutesOf(timings.Dhuhr)) return "morning";
  if (nowMinutes < minutesOf(timings.Asr)) return "dhuhr";
  if (nowMinutes < minutesOf(timings.Maghrib)) return "asr";
  return "maghrib";
}

/** How far across the sky a body is, 0 at rising (east) to 1 at setting (west), or null below the horizon. */
function arcProgress(riseMinutes: number, upForMinutes: number, nowMinutes: number): number | null {
  const since = (((nowMinutes - riseMinutes) % DAY_MINUTES) + DAY_MINUTES) % DAY_MINUTES;
  return since <= upForMinutes ? since / upForMinutes : null;
}

/** The sun is up from sunrise to Maghrib (sunset). */
export function sunProgress(timings: Record<PrayerName, string>, nowMinutes: number): number | null {
  const rise = minutesOf(timings.Sunrise);
  return arcProgress(rise, minutesOf(timings.Maghrib) - rise, nowMinutes);
}

/**
 * The moon rises about 50 minutes later each day: with the sun at new moon, around sunset at full moon.
 * Its path is drawn like the sun's, shifted by its age; good enough to place it, not to time moonrise.
 */
export function moonProgress(timings: Record<PrayerName, string>, nowMinutes: number, age: number): number | null {
  const sunrise = minutesOf(timings.Sunrise);
  const rise = sunrise + moonCycleFraction(age) * DAY_MINUTES;
  return arcProgress(rise, minutesOf(timings.Maghrib) - sunrise, nowMinutes);
}

/** Point on the sky's arc for a progress of 0 to 1: rises on the left, highest in the middle. */
export function arcPoint(progress: number, box: { left: number; right: number; horizon: number; peak: number }) {
  return {
    x: box.left + (box.right - box.left) * progress,
    y: box.horizon - (box.horizon - box.peak) * Math.sin(Math.PI * progress),
  };
}

/** The prayer time a moment belongs to, as the page names it: Duha and the last third of the night included. */
export type PrayerMoment = "Fajr" | "Sunrise" | "Duha" | "Dhuhr" | "Asr" | "Maghrib" | "Isha" | "LastThird";

/** Whether `minutes` falls in [from, to), where the span may run past midnight. */
function within(minutes: number, from: number, to: number): boolean {
  const since = (minutes - from + DAY_MINUTES) % DAY_MINUTES;
  return since < (to - from + DAY_MINUTES) % DAY_MINUTES;
}

export function prayerMoment(timings: Record<PrayerName, string>, minutes: number, lastThird: string | null): PrayerMoment {
  switch (skyPeriod(timings, minutes)) {
    case "fajr":
      return "Fajr";
    case "morning":
      return minutes < minutesOf(duhaWindow(timings).start) ? "Sunrise" : "Duha";
    case "dhuhr":
      return "Dhuhr";
    case "asr":
      return "Asr";
    case "maghrib":
      return "Maghrib";
    case "night":
      return lastThird && within(minutes, minutesOf(lastThird), minutesOf(timings.Fajr)) ? "LastThird" : "Isha";
  }
}

/** When to show the sky for a tapped prayer: just into its time (sunrise itself, Duha at its best). */
export function previewMinutes(moment: Exclude<PrayerMoment, "LastThird">, timings: Record<PrayerName, string>): number {
  if (moment === "Duha") return minutesOf(duhaWindow(timings).best);
  const offset = moment === "Sunrise" ? 5 : 20;
  return (minutesOf(timings[moment]) + offset) % DAY_MINUTES;
}
