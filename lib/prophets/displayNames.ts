/** Display labels for prophets / figures already stored in ayah_pairings. */
const PROPHET_ARABIC: Record<string, string> = {
  "Ya'qub": "يَعْقُوب",
  Zakariyya: "زَكَرِيَّا",
  Sulayman: "سُلَيْمَان",
  Adam: "آدَم",
  Ibrahim: "إِبْرَاهِيم",
  Muhammad: "مُحَمَّد",
  Musa: "مُوسَى",
  Yunus: "يُونُس",
  Ayyub: "أَيُّوب",
  Nuh: "نُوح",
};

export function prophetArabicName(englishName: string): string {
  return PROPHET_ARABIC[englishName] ?? englishName;
}

export function prophetEnglishLabel(name: string, asProphet = true): string {
  if (name.toLowerCase() === "muhammad") {
    return asProphet ? "Prophet Muhammad (AS)" : "Muhammad (AS)";
  }
  return asProphet ? `Prophet ${name} (AS)` : `${name} (AS)`;
}
