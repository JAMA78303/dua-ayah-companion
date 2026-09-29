/**
 * "How to make dua": the teaching on dua in Ibn al-Qayyim's al-Jawab al-Kafi ("Spiritual Disease and Its
 * Cure"), in our own words (the book's English translation is not quoted). Every hadith was checked against
 * its collection and on sunnah.com; gradings for collections other than al-Bukhari and Muslim are
 * al-Albani's, with any dissenting grading noted. Ayat use Saheeh International, as elsewhere in the app.
 * A few weak narrations the book cites are left out.
 */

/** What a point in the guide rests on: an ayah (opened in the app), a hadith on sunnah.com, or one of the app's duas. */
export type GuideRef =
  | { kind: "ayah"; verseKey: string }
  | { kind: "hadith"; label: string; url: string; grade?: string }
  | { kind: "dua"; id: string; label: string };

export interface GuidePoint {
  title: string;
  body: string;
  refs: GuideRef[];
}

export interface GuideSection {
  id: string;
  title: string;
  intro?: string;
  /** Steps or a list to count through, shown numbered. */
  ordered?: boolean;
  points: GuidePoint[];
}

/** Al-Baqarah 2:186, up to its first pause mark (Uthmani text from Quran.com). */
export const GUIDE_AYAH = {
  verseKey: "2:186",
  arabic: "وَإِذَا سَأَلَكَ عِبَادِى عَنِّى فَإِنِّى قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ ٱلدَّاعِ إِذَا دَعَانِ",
  translation:
    "And when My servants ask you, [O Muḥammad], concerning Me - indeed I am near. I respond to the invocation of the supplicant when he calls upon Me.",
};

const ZAI_WEAK = "Zubair Ali Zai graded it weak";

export const DUA_GUIDE: GuideSection[] = [
  {
    id: "why",
    title: "Why ask",
    intro:
      "Ibn al-Qayyim calls dua one of the strongest cures there is: it pushes away what harms us and brings what we need. It is the enemy of hardship, keeping it away, and lifting or lightening it when it comes.",
    points: [
      {
        title: "Allah tells us to ask",
        body: "“Call upon Me; I will respond to you.” And when His servants ask about Him, He is near, and answers the one who calls.",
        refs: [
          { kind: "ayah", verseKey: "40:60" },
          { kind: "ayah", verseKey: "2:186" },
        ],
      },
      {
        title: "He loves to be asked",
        body: "The Prophet ﷺ said that whoever does not ask Allah, Allah is angry with him. Ibn al-Qayyim draws the lesson: pleasing Allah lies in asking Him, not only in obeying Him.",
        refs: [
          {
            kind: "hadith",
            label: "Jami' at-Tirmidhi 3373",
            url: "https://sunnah.com/tirmidhi:3373",
            grade: `Hasan (al-Albani); ${ZAI_WEAK}`,
          },
        ],
      },
      {
        title: "Dua can change what is coming",
        body: "The Prophet ﷺ said that nothing turns back the decree except dua.",
        refs: [
          {
            kind: "hadith",
            label: "Jami' at-Tirmidhi 2139",
            url: "https://sunnah.com/tirmidhi:2139",
            grade: `Hasan (al-Albani); ${ZAI_WEAK}`,
          },
        ],
      },
      {
        title: "When dua meets a hardship",
        body: "Ibn al-Qayyim describes three outcomes. If the dua is stronger, it drives the hardship away. If it is weaker, it still lightens it. If they are equal, each holds the other back. So no dua made against a trial is wasted.",
        refs: [],
      },
    ],
  },
  {
    id: "decree",
    title: "“If it's written, why ask?”",
    intro:
      "Some people stop asking because they think whatever is decreed will happen either way. Ibn al-Qayyim answers them directly.",
    points: [
      {
        title: "Allah decrees things together with their causes",
        body: "Being full is decreed through eating, a harvest through planting, and Paradise through good deeds. No one stops eating because their fullness is already written. Dua is one of these causes, and among the strongest of them: asking is part of the decree, not a way around it.",
        refs: [],
      },
      {
        title: "Worry about the asking, not the answer",
        body: "Ibn al-Qayyim quotes 'Umar ibn al-Khattab as saying that he never carried the worry of the answer, only the worry of the dua itself, because whoever is guided to ask, the answer comes with it.",
        refs: [],
      },
    ],
  },
  {
    id: "how",
    title: "How to ask",
    ordered: true,
    intro: "Ibn al-Qayyim gives an order for asking that brings together the manners of dua found in the Sunnah.",
    points: [
      {
        title: "Be present",
        body: "Turn your heart to Allah, humble before Him, and ask sure that He will answer. The Prophet ﷺ said Allah does not answer a dua from a heart that is heedless and distracted.",
        refs: [
          {
            kind: "hadith",
            label: "Jami' at-Tirmidhi 3479",
            url: "https://sunnah.com/tirmidhi:3479",
            grade: `Hasan (al-Albani); ${ZAI_WEAK}`,
          },
        ],
      },
      {
        title: "Face the qiblah, in wudu if you can",
        body: "Ibn al-Qayyim counts these among the things that make a dua more likely to be answered.",
        refs: [],
      },
      {
        title: "Raise your hands",
        body: "The Prophet ﷺ said Allah is shy and generous: He is too shy to send back empty the hands His servant raises to Him.",
        refs: [
          { kind: "hadith", label: "Sunan Abi Dawud 1488", url: "https://sunnah.com/abudawud:1488", grade: "Sahih (al-Albani)" },
        ],
      },
      {
        title: "Begin with praise, then send blessings on the Prophet ﷺ",
        body: "The Prophet ﷺ heard a man make dua without sending blessings on him and said he had rushed. He taught that we should start by praising Allah, then send blessings on the Prophet ﷺ, then ask for whatever we wish.",
        refs: [
          { kind: "hadith", label: "Jami' at-Tirmidhi 3477", url: "https://sunnah.com/tirmidhi:3477", grade: "Sahih (al-Albani)" },
        ],
      },
      {
        title: "Ask forgiveness before you ask for anything",
        body: "In Ibn al-Qayyim's order, you seek Allah's forgiveness and turn back to Him before making your request.",
        refs: [],
      },
      {
        title: "Then ask, and keep asking",
        body: "Ask for what you need, insist and repeat it, and call on Allah by His Names and Attributes, affirming that He alone is God. The duas below are the ones he points to.",
        refs: [],
      },
    ],
  },
  {
    id: "times",
    title: "Times when dua is answered",
    ordered: true,
    intro: "Ibn al-Qayyim names six times to aim for, when a dua made with a present heart is most likely to be answered.",
    points: [
      {
        title: "The last third of the night",
        body: "Our Lord descends every night to the lowest heaven when the last third of the night remains, and says: who is calling on Me, that I may answer him?",
        refs: [{ kind: "hadith", label: "Sahih al-Bukhari 1145", url: "https://sunnah.com/bukhari:1145" }],
      },
      {
        title: "While the adhan is called",
        body: "The Prophet ﷺ said two duas are not turned back, or rarely are: one at the call to prayer, and one in the thick of battle.",
        refs: [
          { kind: "hadith", label: "Sunan Abi Dawud 2540", url: "https://sunnah.com/abudawud:2540", grade: "Sahih (al-Albani)" },
        ],
      },
      {
        title: "Between the adhan and the iqamah",
        body: "The Prophet ﷺ said a dua between the adhan and the iqamah is not turned back.",
        refs: [
          { kind: "hadith", label: "Jami' at-Tirmidhi 212", url: "https://sunnah.com/tirmidhi:212", grade: "Sahih (al-Albani)" },
        ],
      },
      {
        title: "At the end of the obligatory prayers",
        body: "Asked which dua is most heard, the Prophet ﷺ said: in the last part of the night, and at the end of the obligatory prayers.",
        refs: [
          {
            kind: "hadith",
            label: "Jami' at-Tirmidhi 3499",
            url: "https://sunnah.com/tirmidhi:3499",
            grade: `Hasan (al-Albani); ${ZAI_WEAK}`,
          },
        ],
      },
      {
        title: "Friday, from when the imam sits on the minbar until the prayer ends",
        body: "The Prophet ﷺ spoke of an hour on Friday in which dua is answered, and placed it between the imam sitting down on the minbar and the end of the prayer.",
        refs: [{ kind: "hadith", label: "Sahih Muslim 853", url: "https://sunnah.com/muslim:853" }],
      },
      {
        title: "The last hour after 'Asr on Friday",
        body: "The Prophet ﷺ also said to seek that hour at the end of Friday, in the last hour after 'Asr.",
        refs: [
          { kind: "hadith", label: "Sunan Abi Dawud 1048", url: "https://sunnah.com/abudawud:1048", grade: "Sahih (al-Albani)" },
        ],
      },
    ],
  },
  {
    id: "obstacles",
    title: "What holds a dua back",
    intro:
      "Ibn al-Qayyim compares dua to a weapon: how well it works depends on the weapon, on the arm that uses it, and on nothing standing in the way. These are the things that stand in the way.",
    points: [
      {
        title: "Giving up",
        body: "The Prophet ﷺ said a servant's dua keeps being answered as long as he isn't hasty, saying “I asked and asked and saw no answer”, and then stops asking. Ibn al-Qayyim likens him to someone who plants seeds and waters them, then leaves them because they grow slowly.",
        refs: [
          { kind: "hadith", label: "Sahih al-Bukhari 6340", url: "https://sunnah.com/bukhari:6340" },
          { kind: "hadith", label: "Sahih Muslim 2735c", url: "https://sunnah.com/muslim:2735c" },
        ],
      },
      {
        title: "Asking for something wrong",
        body: "A dua for something sinful, or to cut ties with family, is not answered.",
        refs: [{ kind: "hadith", label: "Sahih Muslim 2735c", url: "https://sunnah.com/muslim:2735c" }],
      },
      {
        title: "Unlawful food, drink or earnings",
        body: "The Prophet ﷺ described a man on a long journey, dishevelled and dusty, raising his hands to the sky: “O Lord, O Lord”, while his food, drink and clothing were unlawful and he was nourished by the unlawful. How could he be answered?",
        refs: [{ kind: "hadith", label: "Sahih Muslim 1015", url: "https://sunnah.com/muslim:1015" }],
      },
      {
        title: "A heart that isn't there",
        body: "Words said while the heart is elsewhere are like a weapon with no arm behind it.",
        refs: [
          {
            kind: "hadith",
            label: "Jami' at-Tirmidhi 3479",
            url: "https://sunnah.com/tirmidhi:3479",
            grade: `Hasan (al-Albani); ${ZAI_WEAK}`,
          },
        ],
      },
      {
        title: "Sins piling up, and desires taking over",
        body: "This is the subject of the whole book: sins weaken the heart, and a weak heart asks weakly. Repentance clears the way.",
        refs: [],
      },
    ],
  },
  {
    id: "answered",
    title: "No dua is wasted",
    points: [
      {
        title: "Every sincere dua is answered in one of three ways",
        body: "The Prophet ﷺ said that a Muslim who asks Allah for nothing sinful and nothing that cuts family ties is given one of three things: what he asked for, soon; the same good saved for him in the Hereafter; or an equal harm turned away from him. The Companions said, “Then we will ask a lot.” He said, “Allah has more.”",
        refs: [
          { kind: "hadith", label: "al-Adab al-Mufrad 710", url: "https://sunnah.com/adab:710" },
          {
            kind: "hadith",
            label: "Jami' at-Tirmidhi 3573",
            url: "https://sunnah.com/tirmidhi:3573",
            grade: "Hasan Sahih (al-Albani)",
          },
        ],
      },
      {
        title: "It isn't only the words",
        body: "Ibn al-Qayyim notes that when a dua is answered, people often credit the words alone. Often it was the distress that made them turn to Allah sincerely, a good deed Allah was rewarding, or a blessed time. The words matter, and so does the heart behind them.",
        refs: [],
      },
    ],
  },
  {
    id: "words",
    title: "Words he points to",
    intro: "The duas Ibn al-Qayyim singles out, calling on Allah by His greatest Name and in times of distress. Each opens in Duas from the Sunnah.",
    points: [
      {
        title: "Allahumma innee as'aluka bi-annee ashhadu annaka antal-lah…",
        body: "The Prophet ﷺ said the man who asked with these words had asked Allah by His greatest Name, by which, when He is asked, He gives.",
        refs: [{ kind: "dua", id: "jk2", label: "Jami' at-Tirmidhi 3475" }],
      },
      {
        title: "The two ayat with the greatest Name",
        body: "The Prophet ﷺ said Allah's greatest Name is in two ayat: “And your god is one God. There is no deity [worthy of worship] except Him, the Entirely Merciful, the Especially Merciful”, and the opening of Al 'Imran: “Allāh - there is no deity except Him, the Ever-Living, the Self-Sustaining.”",
        refs: [
          { kind: "ayah", verseKey: "2:163" },
          { kind: "ayah", verseKey: "3:1-2" },
          {
            kind: "hadith",
            label: "Jami' at-Tirmidhi 3478",
            url: "https://sunnah.com/tirmidhi:3478",
            grade: "Hasan (al-Albani)",
          },
        ],
      },
      {
        title: "Ya Hayyu ya Qayyum, bi rahmatika astagheeth",
        body: "What the Prophet ﷺ said when something distressed him.",
        refs: [{ kind: "dua", id: "jk1", label: "Jami' at-Tirmidhi 3524" }],
      },
      {
        title: "Ya Dhal-Jalali wal-Ikram",
        body: "The Prophet ﷺ told us to hold on to calling Allah by these words.",
        refs: [{ kind: "dua", id: "jk3", label: "Jami' at-Tirmidhi 3525" }],
      },
      {
        title: "The dua of Yunus in the whale",
        body: "“There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers.” The Prophet ﷺ said no Muslim calls on Allah with it for anything without Allah answering him.",
        refs: [
          { kind: "ayah", verseKey: "21:87-88" },
          { kind: "dua", id: "124", label: "Jami' at-Tirmidhi 3505" },
        ],
      },
      {
        title: "La ilaha illallahul-'Azeemul-Haleem…",
        body: "What the Prophet ﷺ would say at a time of distress.",
        refs: [{ kind: "dua", id: "122", label: "Sahih al-Bukhari 6346" }],
      },
      {
        title: "Allahumma innee 'abduk, ibnu 'abdik…",
        body: "The Prophet ﷺ said Allah removes the worry and grief of whoever says it and replaces them with joy, and that everyone who hears it should learn it.",
        refs: [{ kind: "dua", id: "120", label: "Musnad Ahmad" }],
      },
    ],
  },
];
