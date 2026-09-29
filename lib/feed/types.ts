import type { Pairing } from "@/lib/content/fetchPairings";
import type { NameOfAllah } from "@/lib/content/namesOfAllah";
import type { StoryChapter } from "@/lib/content/prophetStories";
import type { SunnahDua } from "@/lib/content/sunnahDuas";

export type FeedItem =
  | { kind: "pairing"; id: string; pairing: Pairing }
  | {
      kind: "story";
      id: string;
      slug: string;
      prophetName: string;
      chapterIndex: number;
      chapterCount: number;
      chapter: StoryChapter;
    }
  | { kind: "name"; id: string; name: NameOfAllah }
  | { kind: "dua"; id: string; dua: SunnahDua };

export interface MixedFeedPage {
  items: FeedItem[];
  nextOffset: number;
  hasMore: boolean;
}
