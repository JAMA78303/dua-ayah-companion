import { afterEach, describe, expect, it, vi } from "vitest";

import { fetchDayTimes, nextPrayer, nowInTimezone, roundedLocation } from "@/lib/prayer/prayerTimes";

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

describe("fetching a day's times", () => {
  afterEach(() => vi.unstubAllGlobals());

  const settings = { location: { latitude: 51.51, longitude: -0.13, label: "London" }, method: 3, school: 0 as const };
  const respond = (data: unknown) =>
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ data }), { status: 200 })));

  it("reads the Islamic date and when the last third of the night begins", async () => {
    respond({
      timings: { ...timings, Sunset: "18:47", Lastthird: "02:53 (BST)" },
      date: { hijri: { day: "18", month: { number: 4, en: "Rabīʿ al-thānī" }, year: "1448" } },
      meta: { timezone: "Europe/London" },
    });
    const day = await fetchDayTimes(settings, new Date(2026, 8, 29));
    expect(day).toMatchObject({ lastThird: "02:53", hijri: { day: 18, month: 4, year: 1448 }, timezone: "Europe/London" });
  });

  it("still gives the times when the Islamic date is missing or malformed", async () => {
    respond({ timings, date: { hijri: { day: "40", month: { number: 13 }, year: "x" } }, meta: { timezone: "Europe/London" } });
    const day = await fetchDayTimes(settings, new Date(2026, 8, 29));
    expect(day).toMatchObject({ lastThird: null, hijri: null, timings: { Fajr: "05:02" } });
  });
});
