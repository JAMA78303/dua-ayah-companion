import { describe, expect, it } from "vitest";

import { duaFromOtherAyah, verseRefHref, verseRefLabel } from "@/lib/quran/verseRef";

describe("dua source references", () => {
  it("labels single ayat and ranges", () => {
    expect(verseRefLabel("20:25-26")).toBe("Ta-Ha 20:25–26");
    expect(verseRefLabel("1:6")).toBe("Al-Fatihah 1:6");
    expect(verseRefHref("20:25-26")).toBe("/result?verseKey=20:25");
  });

  it("only cites a dua that comes from a different ayah", () => {
    expect(duaFromOtherAyah("20:25-26", 20, 46)).toBe("20:25-26");
    expect(duaFromOtherAyah("3:173", 3, 173)).toBeNull();
    expect(duaFromOtherAyah(null, 2, 286)).toBeNull();
  });
});
