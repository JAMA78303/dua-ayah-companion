import type { PrayerMoment } from "@/lib/prayer/sky";

/**
 * A hadith for each prayer time, shown with the sky on the prayer times page. The wording is ours,
 * close to the Arabic; each was checked against its collection and links to sunnah.com. Gradings for
 * collections other than al-Bukhari and Muslim are al-Albani's.
 */
export interface PrayerHadith {
  text: string;
  source: string;
  url: string;
  grade?: string;
}

export const PRAYER_HADITH: Record<PrayerMoment, PrayerHadith[]> = {
  Fajr: [
    {
      text: "Whoever prays Fajr is under the protection of Allah.",
      source: "Sahih Muslim 657a",
      url: "https://sunnah.com/muslim:657a",
    },
  ],
  Sunrise: [
    {
      text: "Pray Fajr, then hold back from praying until the sun has risen and is up. Then pray, for that prayer is witnessed and attended, until the shadow of a spear grows short at midday.",
      source: "Sahih Muslim 832",
      url: "https://sunnah.com/muslim:832",
    },
  ],
  Duha: [
    {
      text: "Every morning, charity is due for each joint of your body. Every “SubhanAllah” is charity, every “Alhamdulillah”, every “La ilaha illallah” and every “Allahu akbar” is charity; enjoining good is charity and forbidding evil is charity. And two rak'ahs prayed at Duha are enough for all of it.",
      source: "Sahih Muslim 720",
      url: "https://sunnah.com/muslim:720",
    },
    {
      text: "Abu Hurayrah said: my close friend ﷺ advised me to do three things: fast three days of every month, pray the two rak'ahs of Duha, and pray witr before I sleep.",
      source: "Sahih al-Bukhari 1981",
      url: "https://sunnah.com/bukhari:1981",
    },
    {
      text: "The prayer of those who often turn back to Allah is when the young camels feel the heat of the sun.",
      source: "Sahih Muslim 748a",
      url: "https://sunnah.com/muslim:748a",
    },
  ],
  Dhuhr: [
    {
      text: "Whoever keeps to four rak'ahs before Dhuhr and four after it, Allah makes the Fire forbidden for him.",
      source: "Jami' at-Tirmidhi 428",
      url: "https://sunnah.com/tirmidhi:428",
      grade: "Sahih (al-Albani)",
    },
  ],
  Asr: [
    {
      text: "Whoever prays the two cool prayers, Fajr and 'Asr, will enter Paradise.",
      source: "Sahih al-Bukhari 574",
      url: "https://sunnah.com/bukhari:574",
    },
  ],
  Maghrib: [
    {
      text: "My ummah will remain upon good, or upon the fitrah, as long as they do not delay Maghrib until the stars crowd the sky.",
      source: "Sunan Abi Dawud 418",
      url: "https://sunnah.com/abudawud:418",
      grade: "Hasan Sahih (al-Albani)",
    },
  ],
  Isha: [
    {
      text: "Whoever prays Isha in congregation, it is as if he stood half the night in prayer. And whoever prays Fajr in congregation, it is as if he prayed the whole night.",
      source: "Sahih Muslim 656a",
      url: "https://sunnah.com/muslim:656a",
    },
  ],
  LastThird: [
    {
      text: "Our Lord descends every night to the lowest heaven when the last third of the night remains, and says: Who is calling on Me, that I may answer him? Who is asking of Me, that I may give him? Who is asking My forgiveness, that I may forgive him?",
      source: "Sahih al-Bukhari 1145",
      url: "https://sunnah.com/bukhari:1145",
    },
  ],
};
