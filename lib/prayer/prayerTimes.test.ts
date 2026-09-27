import { describe, expect, it } from "vitest";

import { nextPrayer, nowInTimezone, roundedLocation } from "@/lib/prayer/prayerTimes";

const timings = { Fajr: "05:02", Sunrise: "06:55", Dhuhr: "12:51", Asr: "16:04", Maghrib: "18:47", Isha: "20:33" };

describe("prayer times helpers", () => {
  it("finds the next prayer, skipping sunrise", () => {
    expect(nextPrayer(timings, "04:00")).toEqual({ name: "Fajr", inMinutes: 62 });
    expect(nextPrayer(timings, "06:00")).toEqual({ name: "Dhuhr", inMinutes: 411 });
    expect(nextPrayer(timings, "18:47")).toEqual({ name: "Isha", inMinutes: 106 });
    expect(nextPrayer(timings, "21:00")).toBeNull();
  });

  it("reads the clock in the place's own timezone", () => {
    const instant = new Date("2026-09-27T12:00:00Z");
    expect(nowInTimezone("Europe/London", instant)).toBe("13:00");
    expect(nowInTimezone("Asia/Karachi", instant)).toBe("17:00");
  });

  it("rounds coordinates to about 1 km before storing", () => {
    expect(roundedLocation(52.48142, -1.89983, "Birmingham")).toEqual({ latitude: 52.48, longitude: -1.9, label: "Birmingham" });
  });
});
