import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { ADHKAR, adhkarFor } from "@/lib/content/adhkar";
import { DUA_GUIDE, GUIDE_AYAH } from "@/lib/content/duaGuide";
import { DAILY_HADITH, hadithOfTheDay } from "@/lib/content/hadithOfTheDay";
import { NAMES_OF_ALLAH, nameOfTheDay } from "@/lib/content/namesOfAllah";
import { PROPHET_STORIES } from "@/lib/content/prophetStories";
import { prophetArabicName } from "@/lib/prophets/displayNames";
import { isValidAyahRef, VERSE_COUNTS } from "@/lib/quran/verseCounts";

describe("verse counts", () => {
  it("covers 114 surahs and 6236 ayat", () => {
    expect(VERSE_COUNTS).toHaveLength(114);
    expect(VERSE_COUNTS.reduce((a, b) => a + b, 0)).toBe(6236);
  });

  it("validates references", () => {
    expect(isValidAyahRef("2:286")).toBe(true);
    expect(isValidAyahRef("2:287")).toBe(false);
    expect(isValidAyahRef("112:1-4")).toBe(true);
    expect(isValidAyahRef("112:3-2")).toBe(false);
    expect(isValidAyahRef("115:1")).toBe(false);
  });
});

describe("stories of the prophets", () => {
  it("has 25 prophets with unique slugs and Arabic names", () => {
    expect(PROPHET_STORIES).toHaveLength(25);
    expect(new Set(PROPHET_STORIES.map((s) => s.slug)).size).toBe(25);
    for (const story of PROPHET_STORIES) {
      expect(prophetArabicName(story.name), story.name).not.toBe(story.name);
    }
  });

  it("cites only real ayat, in every chapter", () => {
    for (const story of PROPHET_STORIES) {
      for (const chapter of story.chapters) {
        expect(chapter.refs.length, `${story.slug} / ${chapter.title}`).toBeGreaterThan(0);
        for (const ref of chapter.refs) expect(isValidAyahRef(ref), `${story.slug}: ${ref}`).toBe(true);
      }
    }
  });
});

describe("names of Allah", () => {
  it("numbers 1 to 99 once each, with a real ayah reference", () => {
    expect(NAMES_OF_ALLAH.map((n) => n.number)).toEqual(Array.from({ length: 99 }, (_, i) => i + 1));
    for (const name of NAMES_OF_ALLAH) expect(isValidAyahRef(name.ref), `${name.number}: ${name.ref}`).toBe(true);
  });

  it("gives everyone the same name on the same date and cycles through all 99", () => {
    expect(nameOfTheDay(new Date(2026, 8, 27, 1))).toBe(nameOfTheDay(new Date(2026, 8, 27, 23)));
    const seen = new Set(Array.from({ length: 99 }, (_, i) => nameOfTheDay(new Date(2026, 0, 1 + i)).number));
    expect(seen.size).toBe(99);
  });
});

describe("adhkar", () => {
  it("has unique ids, positive repeat counts and valid Qur'an references", () => {
    expect(new Set(ADHKAR.map((d) => d.id)).size).toBe(ADHKAR.length);
    for (const dhikr of ADHKAR) {
      expect(dhikr.repeat, dhikr.id).toBeGreaterThan(0);
      for (const ref of dhikr.refs ?? []) expect(isValidAyahRef(ref), `${dhikr.id}: ${ref}`).toBe(true);
    }
  });

  it("splits morning-only and evening-only items correctly", () => {
    expect(adhkarFor("morning").some((d) => d.time === "evening")).toBe(false);
    expect(adhkarFor("evening").some((d) => d.time === "morning")).toBe(false);
  });
});

describe("how to make dua", () => {
  const sunnahDuasSql = readFileSync(join(process.cwd(), "supabase/migrations/021_sunnah_duas.sql"), "utf8");

  it("has unique section ids and point titles", () => {
    expect(new Set(DUA_GUIDE.map((s) => s.id)).size).toBe(DUA_GUIDE.length);
    for (const section of DUA_GUIDE) {
      expect(section.points.length, section.id).toBeGreaterThan(0);
      expect(new Set(section.points.map((p) => p.title)).size, section.id).toBe(section.points.length);
    }
  });

  it("cites real ayat, sunnah.com hadith and duas that exist in the app", () => {
    expect(isValidAyahRef(GUIDE_AYAH.verseKey)).toBe(true);
    for (const section of DUA_GUIDE) {
      for (const point of section.points) {
        for (const ref of point.refs) {
          if (ref.kind === "ayah") expect(isValidAyahRef(ref.verseKey), point.title).toBe(true);
          if (ref.kind === "hadith") expect(ref.url, point.title).toMatch(/^https:\/\/sunnah\.com\/[a-z]+:\d+[a-z]?$/);
          if (ref.kind === "dua") expect(sunnahDuasSql, point.title).toContain(`\n    '${ref.id}',\n`);
        }
      }
    }
  });
});

describe("hadith of the day", () => {
  it("links every hadith to sunnah.com, each once", () => {
    for (const hadith of DAILY_HADITH) expect(hadith.url, hadith.source).toMatch(/^https:\/\/sunnah\.com\/[a-z]+:\d+[a-z]?$/);
    expect(new Set(DAILY_HADITH.map((h) => h.url)).size).toBe(DAILY_HADITH.length);
  });

  it("gives everyone the same hadith on the same date and goes through them all", () => {
    expect(hadithOfTheDay(new Date(2026, 9, 1, 1))).toBe(hadithOfTheDay(new Date(2026, 9, 1, 23)));
    const seen = new Set(Array.from({ length: DAILY_HADITH.length }, (_, i) => hadithOfTheDay(new Date(2026, 0, 1 + i)).url));
    expect(seen.size).toBe(DAILY_HADITH.length);
  });
});
