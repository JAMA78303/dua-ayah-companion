/**
 * Stories of the Companions, in our own words. Every chapter rests on the sources it cites: hadith checked
 * against their collections and linked to sunnah.com (gradings outside al-Bukhari and Muslim are
 * al-Albani's, with any dissent noted), the Qur'an, and, where a detail is only in the early biographies,
 * those books, marked as such. Popular stories without a sound source are left out.
 *
 * Chapters appear in the app only once approved on the review screen (keys "story:<slug>:<index>").
 * Each Companion links to their episodes of "The Firsts" by Dr. Omar Suleiman (Yaqeen Institute) for the
 * full story; nothing here is taken from the series.
 */

export interface CompanionSource {
  label: string;
  /** sunnah.com for hadith; absent for a book that isn't online there. */
  url?: string;
  grade?: string;
  /** For the reader, e.g. that a detail comes from the biographies rather than a hadith. */
  note?: string;
}

export interface CompanionChapter {
  title: string;
  body: string;
  sources: CompanionSource[];
  /** Ayat the chapter refers to, "surah:ayah" or "surah:from-to". */
  ayat?: string[];
}

export interface CompanionStory {
  slug: string;
  name: string;
  arabic: string;
  /** A line under the name. */
  epithet: string;
  intro: string;
  chapters: CompanionChapter[];
  /** Their episodes of The Firsts on YouTube. */
  episodes: { title: string; videoId: string }[];
}

const bukhari = (n: string): CompanionSource => ({ label: `Sahih al-Bukhari ${n}`, url: `https://sunnah.com/bukhari:${n}` });
const muslim = (n: string): CompanionSource => ({ label: `Sahih Muslim ${n}`, url: `https://sunnah.com/muslim:${n}` });

const IBN_MAJAH_150: CompanionSource = {
  label: "Sunan Ibn Majah 150",
  url: "https://sunnah.com/ibnmajah:150",
  grade: "Hasan Sahih (al-Albani)",
};

export const FIRSTS_PLAYLIST_URL = "https://www.youtube.com/playlist?list=PLCFksdDWMRQGl0lJJAtW8crlLUwdyAlW3";

export const COMPANION_STORIES: CompanionStory[] = [
  {
    slug: "khadijah",
    name: "Khadijah bint Khuwaylid",
    arabic: "خديجة بنت خويلد",
    epithet: "The first to believe, and the mother of the believers",
    intro:
      "The Prophet's ﷺ first wife, and the first person to believe in him. She stood by him from the very first night of revelation, and he never stopped loving her.",
    chapters: [
      {
        title: "The first night",
        body: "When the first revelation came in the cave of Hira, the Prophet ﷺ returned home trembling and said, \"Cover me, cover me,\" and told Khadijah he feared for himself. She answered: \"Never, by Allah. Allah will never disgrace you. You keep the ties of kinship, you carry the burdens of the weak, you earn for those who have nothing, you honour your guests and you help people through the trials that come by right.\" Then she took him to her cousin Waraqah ibn Nawfal, who knew the earlier scriptures.",
        sources: [bukhari("3")],
        ayat: ["96:1-5"],
      },
      {
        title: "Waraqah's answer",
        body: "Waraqah was an old man by then, and blind, who had become a Christian and wrote out the Gospel in Hebrew. Khadijah said to him: \"Cousin, listen to your nephew.\" When the Prophet ﷺ told him what he had seen, Waraqah said: \"This is the same angel Allah sent down to Musa. I wish I were young, and alive when your people drive you out.\" The Prophet ﷺ asked, \"Will they drive me out?\" He said: \"No man has ever come with what you have brought without being met with hostility.\"",
        sources: [bukhari("3")],
      },
      {
        title: "The best of women",
        body: "The Prophet ﷺ said that the best of the women of her time was Maryam, daughter of 'Imran, and the best of the women of her time was Khadijah.",
        sources: [bukhari("3432")],
      },
      {
        title: "Greetings from her Lord",
        body: "Jibril came to the Prophet ﷺ and said: here is Khadijah coming with a dish of food or drink. When she reaches you, give her greetings of peace from her Lord and from me, and give her glad tidings of a house in Paradise made of hollowed pearl, with no noise in it and no tiredness.",
        sources: [bukhari("3820")],
      },
      {
        title: "His only wife while she lived",
        body: "'A'ishah reported that the Prophet ﷺ did not marry any other woman while Khadijah was alive. For all the years of their marriage, through the first revelation and the hardest years in Makkah, she was his only wife.",
        sources: [muslim("2436")],
      },
      {
        title: "A love that did not fade",
        body: "Years after she died, 'A'ishah said she was never as jealous of any woman as she was of Khadijah, though she had never met her, because the Prophet ﷺ spoke of her so often. When he slaughtered a sheep he would send portions to Khadijah's friends. When 'A'ishah once spoke of her sharply, he said: \"I was given her love.\" And when he heard the voice of Khadijah's sister Halah asking to come in, it reminded him of Khadijah and he was moved, saying, \"O Allah, it is Halah.\"",
        sources: [bukhari("3818"), muslim("2435b"), bukhari("3821")],
      },
    ],
    episodes: [{ title: "Khadijah (ra): His First Love, Our First Mother", videoId: "gRBTQKlfC78" }],
  },
  {
    slug: "abu-bakr",
    name: "Abu Bakr as-Siddiq",
    arabic: "أبو بكر الصديق",
    epithet: "The one who believed when others called it a lie",
    intro:
      "The Prophet's ﷺ closest friend and companion in the cave, the first of the men to believe, and the first caliph after him.",
    chapters: [
      {
        title: "\"Abu Bakr said: he has told the truth\"",
        body: "Once, when Abu Bakr had a disagreement with 'Umar, the Prophet ﷺ defended him: \"Allah sent me to you, and you said, 'You are lying,' while Abu Bakr said, 'He has told the truth,' and he supported me with himself and his wealth. Will you not leave my companion alone for me?\" He said it twice, and after that no one hurt Abu Bakr.",
        sources: [bukhari("3661")],
      },
      {
        title: "The protection of Allah",
        body: "When the persecution grew, Abu Bakr set out to emigrate to Abyssinia. A chief named Ibn ad-Dughunnah met him on the road and said a man like him should never be driven out: \"You earn for those who have nothing, you keep the ties of kinship, you carry the burdens of the weak, you honour your guests and you help people through their trials.\" He brought Abu Bakr back under his protection. Abu Bakr built a small mosque in the courtyard of his house and prayed and recited there, and he could not hold back his tears when he recited. The women and children of the Quraysh gathered to watch, and their leaders took fright. When Ibn ad-Dughunnah told him to stop or lose his protection, Abu Bakr said: \"I give you back your protection, and I am content with the protection of Allah.\"",
        sources: [bukhari("3905")],
      },
      {
        title: "Preparing the hijrah",
        body: "When the Prophet ﷺ was given permission to emigrate, Abu Bakr asked to go with him, and had two camels ready. They hid for three nights in a cave on Mount Thawr. His son 'Abdullah spent each night with them and returned to Makkah before dawn, so it looked as if he had slept at home, bringing them every plot he heard of. His freed slave 'Amir ibn Fuhayrah grazed sheep nearby, bringing them milk in the evening and leading the flock over their tracks. His daughter Asma' packed their food and, finding nothing to tie it with, tore her waistband in two, so she was called \"the one with two waistbands\".",
        sources: [bukhari("3905"), bukhari("3907")],
      },
      {
        title: "Two in the cave",
        body: "On the hijrah, the Prophet ﷺ and Abu Bakr hid in the cave of Thawr while the Quraysh searched for them. Abu Bakr said that if any of them looked down at his feet, he would see them. The Prophet ﷺ answered: \"What do you think, Abu Bakr, of two when Allah is their third?\" The Qur'an recalls the moment: \"Do not grieve; indeed Allah is with us.\"",
        sources: [bukhari("3653")],
        ayat: ["9:40"],
      },
      {
        title: "Everything he had",
        body: "When the Prophet ﷺ asked the Companions to give in charity, 'Umar brought half of all he owned, hoping to outdo Abu Bakr for once. Abu Bakr brought everything he had. Asked what he had left for his family, he said: \"I have left them Allah and His Messenger.\" 'Umar said he would never be able to outdo him in anything.",
        sources: [{ label: "Jami' at-Tirmidhi 3675", url: "https://sunnah.com/tirmidhi:3675", grade: "Hasan (al-Albani)" }],
      },
      {
        title: "Four good deeds in one day",
        body: "The Prophet ﷺ asked his Companions: \"Who among you is fasting today?\" Abu Bakr said, \"I am.\" \"Who among you has followed a funeral today?\" Abu Bakr said, \"I have.\" \"Who among you has fed a poor person today?\" Abu Bakr said, \"I have.\" \"Who among you has visited someone who is ill today?\" Abu Bakr said, \"I have.\" The Prophet ﷺ said: \"These do not come together in a person except that he enters Paradise.\"",
        sources: [muslim("1028")],
      },
      {
        title: "Called from every gate",
        body: "The Prophet ﷺ said that people would be called into Paradise from the gate of the deeds they were known for: the gate of prayer, of jihad, of charity, of fasting. Abu Bakr asked whether anyone would be called from all of them. The Prophet ﷺ said: \"Yes, and I hope you will be one of them, Abu Bakr.\"",
        sources: [bukhari("3666")],
      },
      {
        title: "The most beloved",
        body: "'Amr ibn al-'As asked the Prophet ﷺ who was most beloved to him. He said 'A'ishah. \"And among the men?\" He said: \"Her father.\" And he said that if he were to take an intimate friend other than his Lord, he would take Abu Bakr, but the bond between them was the brotherhood of Islam.",
        sources: [bukhari("3662"), bukhari("3654")],
      },
      {
        title: "\"Tell Abu Bakr to lead the prayer\"",
        body: "In his final illness the Prophet ﷺ said: \"Tell Abu Bakr to lead the people in prayer.\" He was told that Abu Bakr was a tender-hearted man who wept, and could not stand in his place, but the Prophet ﷺ repeated it three times. So Abu Bakr led the prayer. When the Prophet ﷺ felt a little better he came out, supported between two men, his feet dragging along the ground. Abu Bakr began to step back, but the Prophet ﷺ signalled to him to stay where he was.",
        sources: [bukhari("664")],
      },
      {
        title: "The day the Prophet ﷺ died",
        body: "When the Prophet ﷺ died, the people were stunned, and 'Umar would not accept it. Abu Bakr came, kissed the Prophet's ﷺ face, and went out to them. He praised Allah and said: \"Whoever worshipped Muhammad, Muhammad has died. Whoever worshipped Allah, Allah is Ever-Living and does not die.\" Then he recited: \"Muhammad is not but a messenger. Other messengers have passed on before him…\" It was as if the people had never heard the ayah until he recited it.",
        sources: [bukhari("3667"), bukhari("4454")],
        ayat: ["3:144", "39:30"],
      },
    ],
    episodes: [
      { title: "Abu Bakr (ra) - Part 1: Second to None in the Pursuit of God", videoId: "Rck2DlxxkTc" },
      { title: "Abu Bakr (ra) - Part 2: Setting His Own Standards", videoId: "tbPimlm0r2w" },
      { title: "Abu Bakr (ra) - Part 3: There Will Never Be Another One", videoId: "QCJfaDw-6zM" },
    ],
  },
  {
    slug: "bilal",
    name: "Bilal ibn Rabah",
    arabic: "بلال بن رباح",
    epithet: "The voice of the adhan",
    intro:
      "An enslaved man in Makkah who was among the first seven to declare Islam openly, held firm under torture, and became the first mu'adhdhin of Islam.",
    chapters: [
      {
        title: "\"Ahad, Ahad\"",
        body: "'Abdullah ibn Mas'ud said the first seven to make their Islam public were the Prophet ﷺ, Abu Bakr, 'Ammar and his mother Sumayyah, Suhayb, Bilal and al-Miqdad. The Prophet ﷺ was protected by his uncle and Abu Bakr by his clan, but the others were seized, dressed in iron armour and left to scorch in the sun. Bilal counted himself as nothing for the sake of Allah, so they handed him to boys who dragged him through the valleys of Makkah, and all he would say was: \"One. One.\"",
        sources: [IBN_MAJAH_150],
      },
      {
        title: "Freed by Abu Bakr",
        body: "Abu Bakr bought Bilal's freedom. 'Umar would later say: \"Abu Bakr is our master, and he freed our master,\" meaning Bilal.",
        sources: [bukhari("3754")],
      },
      {
        title: "The first adhan",
        body: "When 'Abdullah ibn Zayd saw the words of the adhan in a dream, the Prophet ﷺ told him it was a true dream and said: teach it to Bilal, for his voice is stronger and more beautiful than yours. So Bilal became the first to call the adhan.",
        sources: [{ label: "Sunan Abi Dawud 499", url: "https://sunnah.com/abudawud:499", grade: "Hasan Sahih (al-Albani)" }],
      },
      {
        title: "The call before dawn",
        body: "Bilal gave a call while it was still night, and the Prophet ﷺ told the people to keep eating and drinking until Ibn Umm Maktum, who was blind, gave the call for Fajr. In Ramadan, Bilal's voice told Madinah there was still time for suhur.",
        sources: [bukhari("617")],
      },
      {
        title: "Longing for Makkah",
        body: "When they first reached Madinah, fever struck Abu Bakr and Bilal. When the fever left Bilal, he would raise his voice with lines of poetry longing for the valleys of Makkah, its grasses and its springs, and he cursed the leaders of the Quraysh who had driven them from their land. The Prophet ﷺ prayed: \"O Allah, make Madinah beloved to us as You made Makkah beloved, or more, bless us in its food, make it healthy for us, and take its fever away.\"",
        sources: [bukhari("1889")],
      },
      {
        title: "Face to face at Badr",
        body: "At the battle of Badr, 'Abdur-Rahman ibn 'Awf was leading Umayyah ibn Khalaf away as a captive when Bilal saw him. Bilal cried out to the Ansar: \"Umayyah ibn Khalaf! May I not survive if he survives!\" and they went after him. The early biographies record that Umayyah was the master who had tortured Bilal in Makkah.",
        sources: [
          bukhari("2301"),
          { label: "Ibn Ishaq's Sirah", note: "That Umayyah was the master who tortured Bilal is from the early biographies." },
        ],
      },
      {
        title: "\"Give us rest with it, Bilal\"",
        body: "When it was time to pray, the Prophet ﷺ would say: \"Bilal, call the iqamah for the prayer; give us rest with it.\" Prayer was not a burden to be got through, but the rest itself, and Bilal was the one who called them to it.",
        sources: [{ label: "Sunan Abi Dawud 4985", url: "https://sunnah.com/abudawud:4985", grade: "Sahih (al-Albani)" }],
      },
      {
        title: "Footsteps in Paradise",
        body: "The Prophet ﷺ asked Bilal which deed he hoped most from, because he had heard the sound of Bilal's footsteps ahead of him in Paradise. Bilal said: whenever I make wudu, at any hour of the day or night, I pray with it whatever Allah has written for me to pray.",
        sources: [bukhari("1149")],
      },
    ],
    episodes: [{ title: "Bilal Ibn Rabah (ra): The Voice of Certainty", videoId: "DjZhcjPEwbU" }],
  },
  {
    slug: "sumayyah",
    name: "Sumayyah bint Khayyat",
    arabic: "سمية بنت خياط",
    epithet: "The first martyr of Islam",
    intro:
      "The mother of 'Ammar ibn Yasir. She was among the very first to declare Islam, and the first person to be killed for it.",
    chapters: [
      {
        title: "Among the first seven",
        body: "'Abdullah ibn Mas'ud named Sumayyah, with her son 'Ammar, among the first seven people to make their Islam public in Makkah. Unlike the Prophet ﷺ and Abu Bakr, they had no clan to protect them, and they were seized and tortured in the heat of the sun.",
        sources: [IBN_MAJAH_150],
      },
      {
        title: "\"Patience, family of Yasir\"",
        body: "Sumayyah, her husband Yasir and their son 'Ammar were tortured together. The Prophet ﷺ passed them and, unable to stop it, told them to be patient, for their meeting place would be Paradise.",
        sources: [
          {
            label: "Al-Hakim, al-Mustadrak",
            note: "Not on sunnah.com; for the reviewer to confirm the reference and its grading.",
          },
        ],
      },
      {
        title: "The first martyr",
        body: "Sumayyah refused to give up her faith, and Abu Jahl killed her. She is remembered as the first person to die for Islam, before the hijrah, before any battle.",
        sources: [
          {
            label: "Ibn Sa'd, al-Tabaqat al-Kubra; Ibn Ishaq's Sirah",
            note: "From the early biographies rather than a hadith collection.",
          },
        ],
      },
    ],
    episodes: [{ title: "Sumayyah (ra): The First Martyr", videoId: "YV0huLXPBz8" }],
  },
];

export function getCompanionStory(slug: string): CompanionStory | undefined {
  return COMPANION_STORIES.find((story) => story.slug === slug);
}
