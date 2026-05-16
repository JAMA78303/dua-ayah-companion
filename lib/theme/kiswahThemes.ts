import type { ThemeId } from "@/types/theme";

export interface KiswahThemeMeta {
  id: ThemeId;
  nameArabic: string;
  nameEnglish: string;
  historicalNote: string;
}

export const KISWAH_THEME_META: Record<ThemeId, KiswahThemeMeta> = {
  abyad: {
    id: "abyad",
    nameArabic: "الكسوة البيضاء",
    nameEnglish: "Al-Abyad · The White",
    historicalNote: "Worn during parts of the Abbasid Caliphate.",
  },
  aswad: {
    id: "aswad",
    nameArabic: "الكسوة السوداء",
    nameEnglish: "Al-Aswad · The Black",
    historicalNote: "The current Kiswah design, standardised in the Saudi era.",
  },
  ahmar: {
    id: "ahmar",
    nameArabic: "الكسوة الحمراء",
    nameEnglish: "Al-Ahmar · The Red",
    historicalNote: "Used during the Mamluk Sultanate period.",
  },
  akhdar: {
    id: "akhdar",
    nameArabic: "الكسوة الخضراء",
    nameEnglish: "Al-Akhdar · The Green",
    historicalNote:
      "Used across multiple caliphates. Green is the colour of Jannah in the Qur'an.",
  },
  dhahabi: {
    id: "dhahabi",
    nameArabic: "الكسوة الذهبية",
    nameEnglish: "Al-Dhahabi · The Golden",
    historicalNote: "Recorded in early Islamic history.",
  },
  mukhattam: {
    id: "mukhattam",
    nameArabic: "الكسوة المخططة",
    nameEnglish: "Al-Mukhattam · The Striped",
    historicalNote:
      "Red and white stripes — among the earliest recorded Kiswah designs.",
  },
};
