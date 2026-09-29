import { describe, expect, it } from "vitest";

import { moonAge, moonIllumination, moonLitPath, moonPhaseName } from "@/lib/prayer/moon";
import { arcPoint, moonProgress, skyPeriod, sunProgress } from "@/lib/prayer/sky";
import { minutesOf } from "@/lib/prayer/prayerTimes";

const timings = { Fajr: "05:05", Sunrise: "06:58", Dhuhr: "12:51", Asr: "16:01", Maghrib: "18:43", Isha: "20:28" };

describe("the moon", () => {
  it("matches real new and full moons in 2026", () => {
    // The total solar eclipse of 12 August 2026 fell on a new moon, the lunar eclipse of 28 August on a full moon.
    expect(moonPhaseName(moonAge(new Date("2026-08-12T17:37:00Z")))).toBe("New moon");
    expect(moonPhaseName(moonAge(new Date("2026-08-28T04:18:00Z")))).toBe("Full moon");
    expect(moonIllumination(moonAge(new Date("2026-08-28T04:18:00Z")))).toBeGreaterThan(0.99);
    expect(moonPhaseName(moonAge(new Date("2026-09-29T12:00:00Z")))).toBe("Waning gibbous");
  });

  it("names every phase in order through the month", () => {
    const names = [0.5, 4, 7.4, 11, 14.8, 18, 22.1, 26, 29.2].map(moonPhaseName);
    expect(names).toEqual([
      "New moon",
      "Waxing crescent",
      "First quarter",
      "Waxing gibbous",
      "Full moon",
      "Waning gibbous",
      "Last quarter",
      "Waning crescent",
      "New moon",
    ]);
  });

  it("draws a waxing moon lit on the right and a waning one on the left", () => {
    expect(moonLitPath(50, 50, 10, 4)).toMatch(/^M 50 40 A 10 10 0 0 1 50 60 /);
    expect(moonLitPath(50, 50, 10, 26)).toMatch(/^M 50 40 A 10 10 0 0 0 50 60 /);
  });
});

describe("the sky", () => {
  it("names the period by the prayer time it falls in", () => {
    expect(skyPeriod(timings, minutesOf("03:00"))).toBe("night");
    expect(skyPeriod(timings, minutesOf("05:30"))).toBe("fajr");
    expect(skyPeriod(timings, minutesOf("09:00"))).toBe("morning");
    expect(skyPeriod(timings, minutesOf("13:00"))).toBe("dhuhr");
    expect(skyPeriod(timings, minutesOf("17:00"))).toBe("asr");
    expect(skyPeriod(timings, minutesOf("19:00"))).toBe("maghrib");
    expect(skyPeriod(timings, minutesOf("22:00"))).toBe("night");
  });

  it("keeps the sun up from sunrise to Maghrib, highest around Dhuhr", () => {
    expect(sunProgress(timings, minutesOf("05:30"))).toBeNull();
    expect(sunProgress(timings, minutesOf("06:58"))).toBe(0);
    expect(sunProgress(timings, minutesOf("12:51"))).toBeCloseTo(0.5, 1);
    expect(sunProgress(timings, minutesOf("18:43"))).toBe(1);
    expect(sunProgress(timings, minutesOf("21:00"))).toBeNull();
  });

  it("brings a full moon up around sunset and sets it around sunrise", () => {
    expect(moonProgress(timings, minutesOf("12:00"), 14.77)).toBeNull();
    expect(moonProgress(timings, minutesOf("19:30"), 14.77)).toBeLessThan(0.15);
    expect(moonProgress(timings, minutesOf("01:00"), 14.77)).toBeCloseTo(0.5, 1);
  });

  it("puts a first-quarter moon high in the evening and a new moon up with the sun", () => {
    expect(moonProgress(timings, minutesOf("19:00"), 7.38)).toBeGreaterThan(0.5);
    expect(moonProgress(timings, minutesOf("12:51"), 0.1)).toBeCloseTo(0.5, 1);
  });

  it("maps progress to a point on the arc", () => {
    const box = { left: 20, right: 300, horizon: 110, peak: 20 };
    expect(arcPoint(0, box)).toEqual({ x: 20, y: 110 });
    expect(arcPoint(0.5, box)).toEqual({ x: 160, y: 20 });
  });
});
