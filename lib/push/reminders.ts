import { nameOfTheDay } from "@/lib/content/namesOfAllah";

/** Local hours from which each reminder goes out (a missed hourly run catches up until the cutoff). */
export const REMINDER_WINDOWS = {
  morning: { from: 7, until: 12 },
  evening: { from: 17, until: 22 },
} as const;

export type ReminderKind = keyof typeof REMINDER_WINDOWS;

export interface ReminderSubscription {
  timezone: string;
  morning: boolean;
  evening: boolean;
  last_morning: string | null;
  last_evening: string | null;
}

export function isValidTimezone(timezone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}

/** Local calendar date ("YYYY-MM-DD") and hour (0-23) in a timezone. */
export function localClock(timezone: string, now: Date): { date: string; hour: number } {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(now)
      .map((part) => [part.type, part.value]),
  );
  return { date: `${parts.year}-${parts.month}-${parts.day}`, hour: Number(parts.hour) };
}

/** Which reminders a subscription should get right now (each at most once per local day). */
export function dueReminders(sub: ReminderSubscription, now: Date): ReminderKind[] {
  if (!isValidTimezone(sub.timezone)) return [];
  const { date, hour } = localClock(sub.timezone, now);
  const due: ReminderKind[] = [];
  const inWindow = (kind: ReminderKind) => hour >= REMINDER_WINDOWS[kind].from && hour < REMINDER_WINDOWS[kind].until;
  if (sub.morning && inWindow("morning") && sub.last_morning !== date) due.push("morning");
  if (sub.evening && inWindow("evening") && sub.last_evening !== date) due.push("evening");
  return due;
}

export interface ReminderMessage {
  title: string;
  body: string;
  url: string;
  tag: string;
}

/** Notification text; the morning one names that day's Name of Allah (same as the app shows). */
export function reminderMessage(kind: ReminderKind, localDate: string): ReminderMessage {
  if (kind === "evening") {
    return {
      title: "Evening adhkar",
      body: "Close your day with remembrance. It takes about ten minutes.",
      url: "/adhkar?time=evening",
      tag: "adhkar-evening",
    };
  }
  const [year, month, day] = localDate.split("-").map(Number);
  const name = nameOfTheDay(new Date(year!, month! - 1, day!));
  return {
    title: "Morning adhkar",
    body: `Start your day with remembrance. Today's Name: ${name.transliteration}, ${name.meaning}.`,
    url: "/adhkar?time=morning",
    tag: "adhkar-morning",
  };
}
