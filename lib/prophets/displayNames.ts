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
  Yusuf: "يُوسُف",
  Lut: "لُوط",
  "Shu'ayb": "شُعَيْب",
  Idris: "إِدْرِيس",
  Hud: "هُود",
  Salih: "صَالِح",
  "Isma'il": "إِسْمَاعِيل",
  Ishaq: "إِسْحَاق",
  Harun: "هَارُون",
  "Dhul-Kifl": "ذُو الْكِفْل",
  Dawud: "دَاوُود",
  Ilyas: "إِلْيَاس",
  "Al-Yasa'": "الْيَسَع",
  Yahya: "يَحْيَى",
  "'Isa": "عِيسَى",
};

export function prophetArabicName(englishName: string): string {
  return PROPHET_ARABIC[englishName] ?? englishName;
}

export function prophetEnglishLabel(name: string, asProphet = true): string {
  if (name.toLowerCase() === "muhammad") {
    return asProphet ? "Prophet Muhammad ﷺ" : "Muhammad ﷺ";
  }
  return asProphet ? `Prophet ${name} (AS)` : `${name} (AS)`;
}
