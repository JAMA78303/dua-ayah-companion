import { describe, expect, it } from "vitest";

import { dueReminders, localClock, reminderMessage, type ReminderSubscription } from "@/lib/push/reminders";

const sub = (overrides: Partial<ReminderSubscription> = {}): ReminderSubscription => ({
  timezone: "Europe/London",
  morning: true,
  evening: true,
  last_morning: null,
  last_evening: null,
  ...overrides,
});

describe("reminder scheduling", () => {
  it("reads the local date and hour in the device's timezone", () => {
    const instant = new Date("2026-09-27T23:30:00Z");
    expect(localClock("Europe/London", instant)).toEqual({ date: "2026-09-28", hour: 0 });
    expect(localClock("America/New_York", instant)).toEqual({ date: "2026-09-27", hour: 19 });
  });

  it("sends the morning reminder from 07:00 local time, once a day", () => {
    const sevenLondon = new Date("2026-09-27T06:05:00Z"); // 07:05 BST
    expect(dueReminders(sub(), sevenLondon)).toEqual(["morning"]);
    expect(dueReminders(sub({ last_morning: "2026-09-27" }), sevenLondon)).toEqual([]);
    expect(dueReminders(sub({ morning: false }), sevenLondon)).toEqual([]);
  });

  it("catches up on a missed run within the window, but not after it", () => {
    expect(dueReminders(sub(), new Date("2026-09-27T09:10:00Z"))).toEqual(["morning"]); // 10:10 BST
    expect(dueReminders(sub(), new Date("2026-09-27T11:10:00Z"))).toEqual([]); // 12:10 BST
  });

  it("sends the evening reminder from 17:00 in each timezone", () => {
    const instant = new Date("2026-09-27T12:00:00Z"); // 17:00 in Karachi, 13:00 in London
    expect(dueReminders(sub({ timezone: "Asia/Karachi" }), instant)).toEqual(["evening"]);
    expect(dueReminders(sub(), instant)).toEqual([]);
  });

  it("ignores subscriptions with an invalid timezone", () => {
    expect(dueReminders(sub({ timezone: "Not/AZone" }), new Date("2026-09-27T06:05:00Z"))).toEqual([]);
  });

  it("names the day's Name of Allah in the morning message", () => {
    const message = reminderMessage("morning", "2026-09-27");
    expect(message.url).toBe("/adhkar?time=morning");
    expect(message.body).toMatch(/Today's Name: .+, .+\./);
  });
});
