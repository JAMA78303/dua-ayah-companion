import { moonCycleFraction } from "@/lib/prayer/moon";
import { minutesOf, type PrayerName } from "@/lib/prayer/prayerTimes";

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
