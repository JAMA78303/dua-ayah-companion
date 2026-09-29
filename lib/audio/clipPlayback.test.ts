import { describe, expect, it } from "vitest";

import { clipProgress, quranWords, reachedClipEnd, recitedWordIndex } from "@/lib/audio/clipPlayback";
import { clipsFromTimedChapter, normalizeAudioUrl } from "@/lib/quranFoundation/fetchAudio";

describe("the words of an ayah", () => {
  it("keeps pause marks with the word before, as the word timings count them", () => {
    // Al-Baqarah 2:2: 'ۛ' pause marks after "rayb" and "fih".
    expect(quranWords("ذَٰلِكَ ٱلْكِتَـٰبُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ")).toEqual([
      "ذَٰلِكَ",
      "ٱلْكِتَـٰبُ",
      "لَا",
      "رَيْبَ ۛ",
      "فِيهِ ۛ",
      "هُدًى",
      "لِّلْمُتَّقِينَ",
    ]);
  });

  it("keeps an opening hizb mark with the first word", () => {
    expect(quranWords("۞ إِنَّ ٱللَّهَ")).toEqual(["۞ إِنَّ", "ٱللَّهَ"]);
  });
});

describe("following the recitation", () => {
  const words: [number, number, number][] = [
    [1, 1000, 1500],
    [2, 1600, 2000],
    [3, 2100, 2600],
  ];

  it("lights the word being recited, holding it through the pause before the next", () => {
    expect(recitedWordIndex(words, 900, 3)).toBeNull();
    expect(recitedWordIndex(words, 1200, 3)).toBe(0);
    expect(recitedWordIndex(words, 1550, 3)).toBe(0);
    expect(recitedWordIndex(words, 1700, 3)).toBe(1);
    expect(recitedWordIndex(words, 2500, 3)).toBe(2);
    // Never past the last word on screen.
    expect(recitedWordIndex(words, 2500, 2)).toBe(1);
  });

  it("measures progress and the end within the ayah, not the whole surah file", () => {
    const clip = { url: "https://x/2.mp3", startMs: 10_000, endMs: 20_000 };
    expect(clipProgress(clip, 15_000, 7_000_000)).toBe(0.5);
    expect(reachedClipEnd(clip, 19_999)).toBe(false);
    expect(reachedClipEnd(clip, 20_000)).toBe(true);
    expect(clipProgress({ url: "https://x/002001.mp3", startMs: 0, endMs: null }, 3000, 6000)).toBe(0.5);
    expect(reachedClipEnd({ url: "https://x/002001.mp3", startMs: 0, endMs: null }, 99_999)).toBe(false);
  });
});

describe("reciters' audio", () => {
  it("fixes protocol-relative links (Al-Husary's files)", () => {
    expect(normalizeAudioUrl("//mirrors.quranicaudio.com/everyayah/Husary_64kbps/001001.mp3")).toBe(
      "https://mirrors.quranicaudio.com/everyayah/Husary_64kbps/001001.mp3",
    );
    expect(normalizeAudioUrl("Alafasy/mp3/001001.mp3")).toBe("https://verses.quran.com/Alafasy/mp3/001001.mp3");
    expect(normalizeAudioUrl("http://download.quranicaudio.com/x.mp3")).toBe("https://download.quranicaudio.com/x.mp3");
  });

  it("reads a whole-surah file's ayah and word timings, leaving out broken ones", () => {
    const clips = clipsFromTimedChapter(
      {
        audio_files: [
          {
            audio_url: "https://download.quranicaudio.com/quran/yasser_ad-dussary//001.mp3",
            verse_timings: [
              { verse_key: "1:1", timestamp_from: 280, timestamp_to: 3080, segments: [[1, 180, 780], [2, "800", "1430"], [0, 1, 2]] },
              { verse_key: "1:2", timestamp_from: 80, timestamp_to: 80, segments: [] },
              { verse_key: "2:1", timestamp_from: 0, timestamp_to: 100 },
            ],
          },
        ],
      },
      1,
    );
    expect(clips).toEqual({
      "1:1": {
        url: "https://download.quranicaudio.com/quran/yasser_ad-dussary//001.mp3",
        startMs: 280,
        endMs: 3080,
        words: [
          [1, 180, 780],
          [2, 800, 1430],
        ],
      },
    });
    expect(clipsFromTimedChapter({ audio_files: [] }, 1)).toBeNull();
  });
});
