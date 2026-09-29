import { describe, expect, it } from "vitest";

import { journalDraftKey, journalTarget } from "@/lib/journal/saveJournalEntry";

const PAIRING_ID = "7c9e6679-7425-40de-944b-e07fc1f90ae7";

describe("journal targets", () => {
  it("accepts pairings and any real ayah, and nothing else", () => {
    expect(journalTarget(`pairing:${PAIRING_ID}`)).toEqual({ kind: "pairing", pairingId: PAIRING_ID });
    expect(journalTarget("ayah:2:255")).toEqual({ kind: "ayah", surah: 2, ayah: 255 });
    for (const key of ["ayah:1:8", "name:12", "adhkar:hisn-77", "sunnah:jk1", PAIRING_ID, "verse-2-255"]) {
      expect(journalTarget(key), key).toBeNull();
    }
  });

  it("keeps pairing drafts where they've always been, and gives each ayah its own", () => {
    expect(journalDraftKey(`pairing:${PAIRING_ID}`)).toBe(`journal-draft-${PAIRING_ID}`);
    expect(journalDraftKey("ayah:2:255")).toBe("journal-draft-ayah:2:255");
  });
});
