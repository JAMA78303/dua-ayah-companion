import { describe, expect, it } from "vitest";

import { BUILTIN_MAPPINGS, normaliseForMatching, scoreIntent, type IntentMapping } from "@/lib/matching/intentMatcher";

// A few of the database's intent_mappings, including ones written with apostrophes.
const DATABASE_SAMPLE: IntentMapping[] = [
  { keyword: "i can't sleep", category: "anxiety", weight: 1 },
  { keyword: "i'm scared of the future", category: "anxiety", weight: 1 },
  { keyword: "i lost someone", category: "grief", weight: 1 },
  { keyword: "i can't stop crying", category: "grief", weight: 1 },
  { keyword: "no one understands me", category: "loneliness", weight: 1 },
];
const mappings = [...DATABASE_SAMPLE, ...BUILTIN_MAPPINGS];
const match = (text: string) => scoreIntent(text, mappings);

describe("mood matching", () => {
  it("normalises apostrophes the same way for keywords and input", () => {
    expect(normaliseForMatching("I can’t sleep!")).toBe("i cant sleep");
    expect(match("I can't sleep at night")).toBe("anxiety");
    expect(match("I’m scared of the future")).toBe("anxiety");
  });

  it("ignores negated feelings", () => {
    expect(match("I'm not sad, just really anxious about my exams")).toBe("anxiety");
    expect(match("I don't feel lonely anymore, I'm grateful")).toBe("gratitude");
    expect(match("there is no hope")).toBe("hope");
  });

  it("prefers specific phrases over single words", () => {
    expect(match("I lost someone close to me")).toBe("grief");
    expect(match("I can't stop crying")).toBe("grief");
    expect(match("I lost my job and I'm so stressed")).toBe("anxiety");
  });

  it("understands everyday phrasing", () => {
    expect(match("my grandmother passed away")).toBe("grief");
    expect(match("I feel hopeless")).toBe("hope");
    expect(match("I don't know what to do")).toBe("guidance");
    expect(match("I feel so alone")).toBe("loneliness");
    expect(match("I feel overwhelmed")).toBe("anxiety");
    expect(match("I want to repent")).toBe("forgiveness");
  });

  it("returns null when nothing matches", () => {
    expect(match("the weather is nice")).toBeNull();
    expect(match("   ")).toBeNull();
  });
});
