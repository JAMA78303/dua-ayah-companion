"use client";

import { useRouter } from "next/navigation";

import type { EmotionCategory } from "@/types/emotions";

const CATEGORIES: {
  id: EmotionCategory;
  label: string;
  description: string;
}[] = [
  { id: "anxiety", label: "Anxiety", description: "Worry, overwhelm, fear" },
  { id: "sadness", label: "Sadness", description: "Grief, loss, despair" },
  { id: "gratitude", label: "Gratitude", description: "Thankfulness, contentment" },
  { id: "guidance", label: "Guidance", description: "Lost, uncertain, seeking" },
  { id: "patience", label: "Patience", description: "Waiting, enduring, persisting" },
  { id: "guilt", label: "Guilt", description: "Regret, heaviness, seeking return" },
  { id: "grief", label: "Grief", description: "Loss, longing, sorrow" },
  { id: "hope", label: "Hope", description: "Waiting for ease, light ahead" },
  { id: "forgiveness", label: "Forgiveness", description: "Repentance, mercy, return" },
  { id: "loneliness", label: "Loneliness", description: "Alone, unseen, disconnected" },
];

function EmotionGlyph({ category }: { category: EmotionCategory }) {
  const stroke = "stroke-[var(--accent-primary)]";
  const common = `size-6 ${stroke}`;
  switch (category) {
    case "anxiety":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M4 14c2.5-2 5.5-2 8 0s5.5 2 8 0"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M5 18c2.5-1.7 5.6-1.7 8 0s5.5 1.7 8 0"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.65"
          />
        </svg>
      );
    case "sadness":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 5c-2 3-4 5.5-4 9a4 4 0 0 0 8 0c0-3.5-2-6-4-9z"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "gratitude":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 18V10m0 0l3 3m-3-3l-3 3M8 7l4-2 4 2"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "guidance":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="7" strokeWidth="1.5" />
          <path d="M12 8v8m3.5-5.5L12 8l-3.5 2.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "patience":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M9 5h6v2H9V5zm0 12h6v2H9v-2zM10 7v10M14 7v10"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path d="M11 9h2M11 15h2" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "guilt":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M18.4 14.5A7 7 0 1 1 15 5.5"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path d="M14 10l4 4" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "grief":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M4 14c3.2-2.5 7-2.5 10 0" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M4 18c3.5-2 8.5-2 12 0" strokeWidth="1.5" strokeLinecap="round" opacity="0.65" />
        </svg>
      );
    case "hope":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M7 14a5 5 0 0 1 10 0"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path d="M17 9l1.2-2.2" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="17.8" cy="6.7" r="1" strokeWidth="1.5" />
        </svg>
      );
    case "forgiveness":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M18 12a6 6 0 1 1-6-6"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      );
    case "loneliness":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M12 7v11" strokeWidth="1.5" strokeLinecap="round" />
          <circle cx="12" cy="6" r="1.3" strokeWidth="1.5" />
        </svg>
      );
    default:
      return (
        <svg className={common} viewBox="0 0 24 24" aria-hidden>
          <circle cx="12" cy="12" r="6" strokeWidth="1.5" fill="none" className={stroke} />
        </svg>
      );
  }
}

export function CategoryTiles() {
  const router = useRouter();

  const tileClass =
    "card-elevated group flex flex-col items-center gap-2 bg-gradient-to-b from-[var(--card-bg)] to-[var(--bg-subtle)] px-4 py-5 text-center transition duration-200 ease-out hover:scale-[1.02] hover:border-[var(--accent-primary)]/30";

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {CATEGORIES.map((category) => (
        <button
          key={category.id}
          type="button"
          onClick={() => router.push(`/feed?category=${category.id}`)}
          className={tileClass}
        >
          <EmotionGlyph category={category.id} />
          <span className="font-nunito text-sm font-semibold text-[var(--text-primary)]">{category.label}</span>
          <span className="text-xs leading-snug text-[var(--text-secondary)]">{category.description}</span>
        </button>
      ))}
      <button type="button" onClick={() => router.push("/favourites")} className={tileClass}>
        <svg
          className="size-6 stroke-[var(--accent-primary)]"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
        >
          <path
            d="M12 17.5l-6.3 3.8 1.7-7.2L2 9.6l7.4-.6L12 2l2.6 7 7.4.6-5.4 4.5 1.7 7.2L12 17.5z"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
        <span className="font-nunito text-sm font-semibold text-[var(--text-primary)]">Favourite Tabs</span>
        <span className="text-xs leading-snug text-[var(--text-secondary)]">Most selected reflections</span>
      </button>
    </div>
  );
}
