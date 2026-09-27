import { adhkarFor, type AdhkarTime } from "@/lib/content/adhkar";

/** Per-device progress for today's morning or evening adhkar: dhikr id -> times said. */
export type AdhkarProgress = Record<string, number>;

export const ADHKAR_PROGRESS_EVENT = "dua-app-adhkar-progress";

function localDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function storageKey(time: AdhkarTime, date: Date) {
  return `adhkar:${localDateKey(date)}:${time}`;
}

export function readAdhkarProgress(time: AdhkarTime, date = new Date()): AdhkarProgress {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(storageKey(time, date)) ?? "{}") as unknown;
    return parsed && typeof parsed === "object" ? (parsed as AdhkarProgress) : {};
  } catch {
    return {};
  }
}

export function writeAdhkarProgress(time: AdhkarTime, progress: AdhkarProgress, date = new Date()) {
  try {
    window.localStorage.setItem(storageKey(time, date), JSON.stringify(progress));
    window.dispatchEvent(new CustomEvent(ADHKAR_PROGRESS_EVENT));
  } catch {
    /* progress just won't persist */
  }
}

export function adhkarCompletion(time: AdhkarTime, progress: AdhkarProgress) {
  const list = adhkarFor(time);
  const done = list.filter((dhikr) => (progress[dhikr.id] ?? 0) >= dhikr.repeat).length;
  return { done, total: list.length, complete: done === list.length };
}
