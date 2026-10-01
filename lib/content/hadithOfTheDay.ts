/**
 * A short hadith for each day, in our own words, close to the Arabic. Each was checked against its
 * collection and links to sunnah.com; gradings for collections other than al-Bukhari and Muslim are
 * al-Albani's, with any dissenting grading noted.
 */
export interface DailyHadith {
  text: string;
  source: string;
  url: string;
  grade?: string;
}

const bukhari = (n: string) => ({ source: `Sahih al-Bukhari ${n}`, url: `https://sunnah.com/bukhari:${n}` });
const muslim = (n: string) => ({ source: `Sahih Muslim ${n}`, url: `https://sunnah.com/muslim:${n}` });
const tirmidhi = (n: string, grade: string) => ({ source: `Jami' at-Tirmidhi ${n}`, url: `https://sunnah.com/tirmidhi:${n}`, grade });

export const DAILY_HADITH: DailyHadith[] = [
  { text: "Actions are only by intentions, and everyone will have only what they intended.", ...bukhari("1") },
  { text: "None of you truly believes until he loves for his brother what he loves for himself.", ...bukhari("13") },
  { text: "Whoever believes in Allah and the Last Day, let him say what is good or stay silent.", ...bukhari("6018") },
  { text: "The strong one is not the one who wins a wrestle; the strong one is the one who controls himself when angry.", ...bukhari("6114") },
  { text: "Allah does not look at your appearance or your wealth, but He looks at your hearts and your deeds.", ...muslim("2564c") },
  { text: "Whoever relieves a believer of a hardship of this world, Allah will relieve him of a hardship of the Day of Resurrection. Allah helps His servant as long as the servant helps his brother.", ...muslim("2699a") },
  { text: "The deeds most beloved to Allah are those done consistently, even if they are small.", ...bukhari("6465") },
  { text: "How wonderful is the affair of the believer: all of it is good. If something pleasing comes to him he is grateful, and that is good for him; if hardship befalls him he is patient, and that is good for him.", ...muslim("2999") },
  { text: "Two phrases are light on the tongue, heavy on the scale and beloved to the Most Merciful: SubhanAllahi wa bihamdihi, SubhanAllahil-'Azim.", ...bukhari("6406") },
  { text: "Purity is half of faith, and “Alhamdulillah” fills the scale.", ...muslim("223") },
  { text: "Charity never decreases wealth, and Allah only increases in honour the one who forgives, and whoever humbles himself for Allah, Allah raises him.", ...muslim("2588") },
  { text: "Be mindful of Allah wherever you are, follow a bad deed with a good one and it will wipe it out, and treat people with good character.", ...tirmidhi("1987", "Hasan (al-Albani)") },
  { text: "There are two blessings in which many people lose out: health and free time.", ...bukhari("6412") },
  { text: "Be in this world as though you were a stranger or a traveller passing through.", ...bukhari("6416") },
  { text: "The believers in their love, mercy and kindness to one another are like one body: when one part aches, the whole body shares in its sleeplessness and fever.", ...muslim("2586a") },
  { text: "Do not think little of any good deed, even meeting your brother with a cheerful face.", ...muslim("2626") },
  { text: "Your smile in your brother's face is charity.", ...tirmidhi("1956", "Sahih (al-Albani)") },
  { text: "The best of you are those who learn the Qur'an and teach it.", ...bukhari("5027") },
  { text: "Recite the Qur'an, for it will come on the Day of Resurrection as an intercessor for its companions.", ...muslim("804a") },
  { text: "Allah says: I am as My servant thinks of Me, and I am with him when he remembers Me.", ...bukhari("7405") },
  { text: "The one who remembers his Lord and the one who does not are like the living and the dead.", ...bukhari("6407") },
  { text: "Be mindful of Allah and He will protect you; be mindful of Allah and you will find Him before you. When you ask, ask Allah; when you seek help, seek help from Allah.", ...tirmidhi("2516", "Sahih (al-Albani)") },
  { text: "Truthfulness leads to righteousness, and righteousness leads to Paradise.", ...bukhari("6094") },
  { text: "A good word is charity.", ...bukhari("2989") },
  { text: "The religion is ease. Whoever makes it hard on himself will be overcome by it, so keep to what is right, come as close to it as you can, and have glad tidings.", ...bukhari("39") },
  { text: "When a person dies, their deeds end except for three: ongoing charity, knowledge that benefits others, or a righteous child who prays for them.", ...muslim("1631") },
  { text: "Convey from me, even if it is a single ayah.", ...bukhari("3461") },
  { text: "Among the best of you are those with the best character.", ...bukhari("3559") },
  { text: "Strive for what benefits you, seek help from Allah, and do not give up. If something befalls you, don't say “if only I had…”, but say: Allah decreed it, and He does what He wills.", ...muslim("2664") },
  { text: "Part of the excellence of a person's Islam is leaving what does not concern him.", ...tirmidhi("2317", "Sahih (al-Albani); Zubair Ali Zai graded it weak") },
  { text: "The merciful are shown mercy by the Most Merciful. Show mercy to those on earth, and the One above the heavens will show mercy to you.", ...tirmidhi("1924", "Sahih (al-Albani)") },
  { text: "Whoever does not show mercy will not be shown mercy.", ...bukhari("6013") },
  { text: "The religion is sincerity: to Allah, His Book, His Messenger, the leaders of the Muslims and their common people.", ...muslim("55a") },
  { text: "A Muslim is one from whose tongue and hand the Muslims are safe.", ...bukhari("10") },
  { text: "A man asked the Prophet ﷺ for advice. He said: “Don't get angry.” The man asked again and again, and each time he said: “Don't get angry.”", ...bukhari("6116") },
  { text: "Allah is gentle and loves gentleness, and He gives for gentleness what He does not give for harshness.", ...muslim("2593") },
];

/** Today's hadith: the same for everyone on the same date, going through the list in turn. */
export function hadithOfTheDay(date: Date): DailyHadith {
  const dayNumber = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);
  return DAILY_HADITH[dayNumber % DAILY_HADITH.length]!;
}
