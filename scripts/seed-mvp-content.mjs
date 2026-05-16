import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing env vars. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before seeding.",
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

/** @type {Array<{
 * surah: number;
 * ayah_number: number;
 * arabic_text: string;
 * translation: string;
 * emotion_category: "anxiety" | "sadness" | "gratitude" | "guidance" | "patience";
 * tafsir_source: string;
 * inclusion_reason: string;
 * tafsir_summary: string;
 * reflection_prompts: string[];
 * tone_tag: "comfort" | "warning" | "balance";
 * dua_text: string;
 * dua_transliteration: string;
 * dua_translation: string;
 * status: "approved";
 * }>} */
const SEED_ROWS = [
  {
    surah: 2,
    ayah_number: 286,
    arabic_text: "لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا",
    translation: "Allah does not burden a soul beyond what it can bear.",
    emotion_category: "anxiety",
    tafsir_source: "Ibn Kathir",
    inclusion_reason: "Directly addresses overwhelm and perceived inability.",
    tafsir_summary:
      "This verse reminds the believer that every burden is measured by divine wisdom, even when it feels heavy in the moment.",
    reflection_prompts: [
      "What pressure feels unbearable today?",
      "How might this ayah reframe that burden?",
    ],
    tone_tag: "comfort",
    dua_text: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
    dua_transliteration: "Hasbunallahu wa ni'mal wakeel",
    dua_translation: "Allah is sufficient for us, and He is the best disposer of affairs.",
    status: "approved",
  },
  {
    surah: 13,
    ayah_number: 28,
    arabic_text: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
    translation: "Surely, in the remembrance of Allah do hearts find rest.",
    emotion_category: "anxiety",
    tafsir_source: "Ibn Kathir",
    inclusion_reason: "Explicitly links emotional calm to dhikr.",
    tafsir_summary:
      "The heart settles when it turns toward Allah, because certainty replaces spiraling uncertainty.",
    reflection_prompts: [
      "Which remembrance can you return to repeatedly today?",
      "What happens in your chest when you slow down for dhikr?",
    ],
    tone_tag: "comfort",
    dua_text: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ",
    dua_transliteration: "Allahumma inni a'udhu bika min al-hammi wal-hazan",
    dua_translation: "O Allah, I seek refuge in You from anxiety and sorrow.",
    status: "approved",
  },
  {
    surah: 65,
    ayah_number: 3,
    arabic_text: "وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ",
    translation: "And whoever relies upon Allah — then He is sufficient for him.",
    emotion_category: "anxiety",
    tafsir_source: "Ibn Kathir",
    inclusion_reason: "Addresses fear of outcomes and trust in Allah.",
    tafsir_summary:
      "Reliance is not passivity; it is acting responsibly while entrusting outcomes to Allah.",
    reflection_prompts: [
      "What outcome are you trying to control too tightly?",
      "What would tawakkul look like in one practical step today?",
    ],
    tone_tag: "balance",
    dua_text: "رَبِّ اشْرَحْ لِي صَدْرِي",
    dua_transliteration: "Rabbi ishrah li sadri",
    dua_translation: "My Lord, expand for me my chest.",
    status: "approved",
  },
  {
    surah: 94,
    ayah_number: 5,
    arabic_text: "فَإِنَّ مَعَ الْعُسْرِ يُسْرًا",
    translation: "Indeed, with hardship comes ease.",
    emotion_category: "sadness",
    tafsir_source: "Ibn Kathir",
    inclusion_reason: "Gives hope during grief and emotional heaviness.",
    tafsir_summary:
      "Allah pairs difficulty with openings; despair is challenged by this repeated divine promise.",
    reflection_prompts: [
      "Where have you seen small ease appear in a hard season?",
      "What keeps hope alive right now?",
    ],
    tone_tag: "comfort",
    dua_text: "اللَّهُمَّ أْجُرْنِي فِي مُصِيبَتِي وَاخْلُفْ لِي خَيْرًا مِنْهَا",
    dua_transliteration: "Allahumma'jurni fi musibati wakhluf li khayran minha",
    dua_translation:
      "O Allah, reward me in my affliction and replace it for me with something better.",
    status: "approved",
  },
  {
    surah: 2,
    ayah_number: 153,
    arabic_text: "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ",
    translation: "Indeed, Allah is with the patient.",
    emotion_category: "sadness",
    tafsir_source: "Ibn Kathir",
    inclusion_reason: "Offers closeness of Allah in emotional pain.",
    tafsir_summary:
      "Patience in loss is not numbness; it is staying turned to Allah while carrying pain faithfully.",
    reflection_prompts: [
      "How can you ask for Allah's companionship in this sadness?",
      "What is one patient act you can do in this moment?",
    ],
    tone_tag: "comfort",
    dua_text: "إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ",
    dua_transliteration: "Inna lillahi wa inna ilayhi raji'un",
    dua_translation: "Surely we belong to Allah, and to Him we return.",
    status: "approved",
  },
  {
    surah: 12,
    ayah_number: 86,
    arabic_text: "إِنَّمَا أَشْكُو بَثِّي وَحُزْنِي إِلَى اللَّهِ",
    translation: "I only complain of my sorrow and grief to Allah.",
    emotion_category: "sadness",
    tafsir_source: "Ibn Kathir",
    inclusion_reason: "Normalises grief while directing it to Allah.",
    tafsir_summary:
      "Prophetic grief includes tears and honesty before Allah; turning pain into dua is an act of worship.",
    reflection_prompts: [
      "What grief have you been carrying silently?",
      "How can you express that to Allah today?",
    ],
    tone_tag: "balance",
    dua_text: "رَبِّ إِنِّي مَغْلُوبٌ فَانْتَصِرْ",
    dua_transliteration: "Rabbi inni maghloobun fantasir",
    dua_translation: "My Lord, I am overpowered, so help me.",
    status: "approved",
  },
  {
    surah: 14,
    ayah_number: 7,
    arabic_text: "لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ",
    translation: "If you are grateful, I will surely increase you.",
    emotion_category: "gratitude",
    tafsir_source: "Ibn Kathir",
    inclusion_reason: "Core Qur'anic principle linking gratitude and increase.",
    tafsir_summary:
      "Gratitude is both recognition and obedience; increase may be in blessing, clarity, or barakah.",
    reflection_prompts: [
      "What blessing are you overlooking because it feels ordinary?",
      "How can gratitude become action, not just words?",
    ],
    tone_tag: "balance",
    dua_text: "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ",
    dua_transliteration: "Allahumma a'inni ala dhikrika wa shukrika wa husni ibadatik",
    dua_translation:
      "O Allah, help me to remember You, thank You, and worship You excellently.",
    status: "approved",
  },
  {
    surah: 93,
    ayah_number: 11,
    arabic_text: "وَأَمَّا بِنِعْمَةِ رَبِّكَ فَحَدِّثْ",
    translation: "And as for the favor of your Lord, proclaim it.",
    emotion_category: "gratitude",
    tafsir_source: "Ibn Kathir",
    inclusion_reason: "Encourages conscious acknowledgment of Allah's favors.",
    tafsir_summary:
      "Remembering and speaking of blessings with humility deepens gratitude and protects from ingratitude.",
    reflection_prompts: [
      "Which blessing from this week deserves intentional acknowledgment?",
      "How can you share that blessing without pride?",
    ],
    tone_tag: "comfort",
    dua_text: "رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ",
    dua_transliteration: "Rabbi awzi'ni an ashkura ni'mataka",
    dua_translation: "My Lord, inspire me to be grateful for Your favor.",
    status: "approved",
  },
  {
    surah: 55,
    ayah_number: 13,
    arabic_text: "فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ",
    translation: "So which of the favors of your Lord will you deny?",
    emotion_category: "gratitude",
    tafsir_source: "Ibn Kathir",
    inclusion_reason: "Repeated ayah that actively calls attention to blessings.",
    tafsir_summary:
      "The repetition in Surah Ar-Rahman trains the heart to notice and confess Allah's constant favors.",
    reflection_prompts: [
      "What mercy from Allah appeared in your life today?",
      "How does remembering repeated blessings change your mood?",
    ],
    tone_tag: "balance",
    dua_text: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
    dua_transliteration: "Alhamdulillahi Rabbil alamin",
    dua_translation: "All praise is for Allah, Lord of the worlds.",
    status: "approved",
  },
  {
    surah: 1,
    ayah_number: 6,
    arabic_text: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
    translation: "Guide us to the straight path.",
    emotion_category: "guidance",
    tafsir_source: "Ibn Kathir",
    inclusion_reason: "Most direct and foundational prayer for guidance.",
    tafsir_summary:
      "Believers repeatedly ask for guidance because steadfastness requires ongoing divine help.",
    reflection_prompts: [
      "Where do you need guidance most right now?",
      "What decision can you place before Allah in sincere dua today?",
    ],
    tone_tag: "comfort",
    dua_text: "اللَّهُمَّ اهْدِنِي وَسَدِّدْنِي",
    dua_transliteration: "Allahumma ihdini wa saddidni",
    dua_translation: "O Allah, guide me and keep me upright.",
    status: "approved",
  },
  {
    surah: 18,
    ayah_number: 10,
    arabic_text: "رَبَّنَا آتِنَا مِن لَّدُنكَ رَحْمَةً وَهَيِّئْ لَنَا مِنْ أَمْرِنَا رَشَدًا",
    translation:
      "Our Lord, grant us mercy from Yourself and facilitate for us right guidance in our matter.",
    emotion_category: "guidance",
    tafsir_source: "Ibn Kathir",
    inclusion_reason: "Dua for clarity and right direction during uncertainty.",
    tafsir_summary:
      "The people of the cave asked for both mercy and right judgment, combining spiritual and practical guidance.",
    reflection_prompts: [
      "What matter needs both mercy and clarity right now?",
      "What would wise action look like after making this dua?",
    ],
    tone_tag: "balance",
    dua_text: "رَبِّ زِدْنِي عِلْمًا",
    dua_transliteration: "Rabbi zidni ilma",
    dua_translation: "My Lord, increase me in knowledge.",
    status: "approved",
  },
  {
    surah: 2,
    ayah_number: 186,
    arabic_text: "أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ",
    translation: "I respond to the call of the caller when he calls upon Me.",
    emotion_category: "guidance",
    tafsir_source: "Ibn Kathir",
    inclusion_reason: "Reassures seeker that dua is heard.",
    tafsir_summary:
      "Allah's nearness invites persistent dua; guidance often unfolds through this living connection.",
    reflection_prompts: [
      "How can you make your guidance-seeking dua more regular?",
      "What obstacle is stopping you from asking with full presence?",
    ],
    tone_tag: "comfort",
    dua_text: "اللَّهُمَّ أَرِنَا الْحَقَّ حَقًّا وَارْزُقْنَا اتِّبَاعَهُ",
    dua_transliteration: "Allahumma arinal-haqqa haqqan warzuqnat-tiba'ah",
    dua_translation: "O Allah, show us truth as truth and grant us following it.",
    status: "approved",
  },
  {
    surah: 3,
    ayah_number: 200,
    arabic_text: "يَا أَيُّهَا الَّذِينَ آمَنُوا اصْبِرُوا وَصَابِرُوا",
    translation: "O believers! Be patient and endure.",
    emotion_category: "patience",
    tafsir_source: "Ibn Kathir",
    inclusion_reason: "Direct command and framework for perseverance.",
    tafsir_summary:
      "Patience is active endurance in obedience, restraint, and response to hardship.",
    reflection_prompts: [
      "Where is Allah asking you to endure with dignity?",
      "How can you strengthen patience through worship today?",
    ],
    tone_tag: "balance",
    dua_text: "رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا",
    dua_transliteration: "Rabbana afrigh alayna sabran",
    dua_translation: "Our Lord, pour upon us patience.",
    status: "approved",
  },
  {
    surah: 2,
    ayah_number: 45,
    arabic_text: "وَاسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ",
    translation: "Seek help through patience and prayer.",
    emotion_category: "patience",
    tafsir_source: "Ibn Kathir",
    inclusion_reason: "Connects patience to practical spiritual support (salah).",
    tafsir_summary:
      "The verse links inner endurance with regular prayer as a stabilizing means of help.",
    reflection_prompts: [
      "What would it look like to seek help through salah today?",
      "Which difficulty needs both patience and prayer right now?",
    ],
    tone_tag: "comfort",
    dua_text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ صَبْرًا جَمِيلًا",
    dua_transliteration: "Allahumma inni as'aluka sabran jameelan",
    dua_translation: "O Allah, I ask You for beautiful patience.",
    status: "approved",
  },
  {
    surah: 16,
    ayah_number: 127,
    arabic_text: "وَاصْبِرْ وَمَا صَبْرُكَ إِلَّا بِاللَّهِ",
    translation: "Be patient, and your patience is only through Allah.",
    emotion_category: "patience",
    tafsir_source: "Ibn Kathir",
    inclusion_reason: "Frames patience as a gift sustained by Allah.",
    tafsir_summary:
      "True patience is not self-manufactured toughness; it is aid from Allah sought repeatedly.",
    reflection_prompts: [
      "Where are you relying only on yourself instead of asking Allah for strength?",
      "What dua can you repeat when patience feels thin?",
    ],
    tone_tag: "comfort",
    dua_text: "حَسْبِيَ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ",
    dua_transliteration: "Hasbiyallahu la ilaha illa huwa alayhi tawakkaltu",
    dua_translation: "Allah is sufficient for me; upon Him I rely.",
    status: "approved",
  },
];

async function seed() {
  let inserted = 0;
  let skipped = 0;

  for (const row of SEED_ROWS) {
    const { data: existing, error: checkError } = await supabase
      .from("ayah_pairings")
      .select("id")
      .eq("surah", row.surah)
      .eq("ayah_number", row.ayah_number)
      .eq("emotion_category", row.emotion_category)
      .limit(1)
      .maybeSingle();

    if (checkError) {
      throw new Error(`Check failed for ${row.surah}:${row.ayah_number} - ${checkError.message}`);
    }

    if (existing) {
      skipped += 1;
      continue;
    }

    const { error: insertError } = await supabase.from("ayah_pairings").insert(row);
    if (insertError) {
      throw new Error(
        `Insert failed for ${row.surah}:${row.ayah_number} - ${insertError.message}`,
      );
    }

    inserted += 1;
  }

  console.log(`Seed complete. Inserted: ${inserted}, skipped existing: ${skipped}`);
}

seed().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
