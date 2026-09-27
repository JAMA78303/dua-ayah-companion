-- More Qur'anic duas of the Prophets, plus cleanup of duplicated seed rows.
--
-- Arabic text: Quran.com text_uthmani (verbatim). Translation: Saheeh International (verbatim).
-- Stories / summaries / prompts draw only on the Qur'an itself; the ayat each relies on are listed
-- in tafsir_source. Please have them reviewed before publishing if your process requires it.
--
-- Safe to re-run: duplicates are merged once, and inserts skip rows that already exist.

-- ---------------------------------------------------------------------------
-- 1) Merge duplicate pairings (same ayah + same dua) left by seeds that ran more than once.
--    e.g. Ayyub 21:83, Yunus 21:87 and Zakariyya 21:89 each exist three times, which inflated the
--    dua counts on the Prophets page. References are moved to the kept (oldest) row first.
--    One DO block = one atomic statement, however the SQL editor sends the script.
-- ---------------------------------------------------------------------------

DO $$
BEGIN
  DROP TABLE IF EXISTS pg_temp.pairing_duplicates;
  CREATE TEMP TABLE pairing_duplicates AS
  SELECT id, keep_id
  FROM (
    SELECT
      id,
      first_value(id) OVER (
        PARTITION BY surah, ayah_number, md5(dua_text)
        ORDER BY created_at, id
      ) AS keep_id
    FROM public.ayah_pairings
  ) ranked
  WHERE id <> keep_id;

  -- Feedback has no ON DELETE CASCADE: re-point it.
  UPDATE public.resonance_feedback f
  SET pairing_id = d.keep_id
  FROM pairing_duplicates d
  WHERE f.pairing_id = d.id;

  -- Saves: one save per user on the kept row (the cap trigger is paused — these aren't new saves).
  ALTER TABLE public.saved_items DISABLE TRIGGER saved_items_free_cap;
  INSERT INTO public.saved_items (user_id, pairing_id, created_at)
  SELECT s.user_id, d.keep_id, min(s.created_at)
  FROM public.saved_items s
  JOIN pairing_duplicates d ON s.pairing_id = d.id
  GROUP BY s.user_id, d.keep_id
  ON CONFLICT (user_id, pairing_id) DO NOTHING;
  ALTER TABLE public.saved_items ENABLE TRIGGER saved_items_free_cap;

  -- Journal: merge any reflections written on duplicates into the kept row (nothing is dropped).
  INSERT INTO public.journal_entries (user_id, pairing_id, content, created_at, updated_at)
  SELECT
    j.user_id,
    d.keep_id,
    left(string_agg(j.content, E'\n\n' ORDER BY j.created_at), 2000),
    min(j.created_at),
    max(j.updated_at)
  FROM public.journal_entries j
  JOIN pairing_duplicates d ON j.pairing_id = d.id
  GROUP BY j.user_id, d.keep_id
  ON CONFLICT (user_id, pairing_id) DO UPDATE
  SET content = left(public.journal_entries.content || E'\n\n' || EXCLUDED.content, 2000),
      updated_at = greatest(public.journal_entries.updated_at, EXCLUDED.updated_at);

  -- Removing the duplicates cascades their (already copied) saves and journal rows.
  DELETE FROM public.ayah_pairings p
  USING pairing_duplicates d
  WHERE p.id = d.id;

  DROP TABLE pairing_duplicates;
END;
$$;

-- Prevent the same ayah + dua being inserted twice again.
CREATE UNIQUE INDEX IF NOT EXISTS ayah_pairings_ayah_dua_unique
  ON public.ayah_pairings (surah, ayah_number, md5(dua_text));

-- ---------------------------------------------------------------------------
-- 2) New prophetic duas
-- ---------------------------------------------------------------------------

INSERT INTO public.ayah_pairings (
  surah, ayah_number, arabic_text, translation, emotion_category, tafsir_source, inclusion_reason, tafsir_summary, reflection_prompts, tone_tag, dua_text, dua_transliteration, dua_translation, prophetic_story, prophet_name, source_type, status
)
VALUES
  -- Musa · 20:25
  (
    20,
    25,
    'قَالَ رَبِّ ٱشْرَحْ لِى صَدْرِى',
    '[Moses] said, "My Lord, expand [i.e., relax] for me my breast [with assurance]"',
    'anxiety',
    'Qur''anic context (Ta-Ha 20:24–36)',
    'Musa عليه السلام asked for this before facing Pharaoh — a dua for any task that feels too big.',
    'Musa was commanded, "Go to Pharaoh. Indeed, he has transgressed" (20:24). Before taking a step, he asked Allah to expand his chest, ease his task and untie the knot from his tongue (20:25–28), and Allah answered: "You have been granted your request, O Moses" (20:36). The ease he asked for began inside: a heart wide enough to carry what was ahead.',
    ARRAY[
      'What task in front of you feels heavier than you can carry right now?',
      'Musa asked for an open heart before he asked for an easy task. What would it look like to ask Allah for inner steadiness first?'
    ],
    'comfort',
    'رَبِّ ٱشْرَحْ لِى صَدْرِى وَيَسِّرْ لِىٓ أَمْرِى',
    'Rabbi ishrah li sadri wa yassir li amri',
    'My Lord, expand for me my breast and ease for me my task',
    'Musa عليه السلام was sent to Pharaoh, a tyrant who had transgressed all bounds, and he was aware of his own difficulty in speech. He did not refuse the mission; he asked Allah for an open heart, an eased path and words people would understand, and for his brother Harun as a helper. Allah granted all of it.',
    'Musa',
    'quranic',
    'approved'
  ),
  -- Musa · 28:24
  (
    28,
    24,
    'فَسَقَىٰ لَهُمَا ثُمَّ تَوَلَّىٰٓ إِلَى ٱلظِّلِّ فَقَالَ رَبِّ إِنِّى لِمَآ أَنزَلْتَ إِلَىَّ مِنْ خَيْرٍ فَقِيرٌ',
    'So he watered [their flocks] for them; then he went back to the shade and said, "My Lord, indeed I am, for whatever good You would send down to me, in need."',
    'hope',
    'Qur''anic context (Al-Qasas 28:21–28)',
    'Musa''s dua of need when he was alone, far from home and had nothing.',
    'Musa had fled Egypt in fear (28:21) and reached Madyan alone, with nothing. After watering the flock of two women, he turned to the shade and made this dua — naming his need without dictating the answer. The next ayah shows how the answer came: one of the women returned, walking with shyness, to invite him to her father (28:25).',
    ARRAY[
      'What do you need right now that you have not yet brought to Allah in plain words?',
      'Musa asked for "whatever good" Allah would send. Can you ask today without deciding in advance what the answer must look like?'
    ],
    'comfort',
    'رَبِّ إِنِّى لِمَآ أَنزَلْتَ إِلَىَّ مِنْ خَيْرٍ فَقِيرٌ',
    'Rabbi inni lima anzalta ilayya min khayrin faqeer',
    'My Lord, indeed I am, for whatever good You would send down to me, in need.',
    'Musa عليه السلام left Egypt afraid and alone and arrived in Madyan a stranger. He helped two women who were waiting to water their flock, then sat in the shade and turned to Allah with this short dua of need. Allah answered through the very people he had helped: their father welcomed him, gave him work and offered him one of his daughters in marriage.',
    'Musa',
    'quranic',
    'approved'
  ),
  -- Musa · 28:16
  (
    28,
    16,
    'قَالَ رَبِّ إِنِّى ظَلَمْتُ نَفْسِى فَٱغْفِرْ لِى فَغَفَرَ لَهُۥٓ ۚ إِنَّهُۥ هُوَ ٱلْغَفُورُ ٱلرَّحِيمُ',
    'He said, "My Lord, indeed I have wronged myself, so forgive me," and He forgave him. Indeed, He is the Forgiving, the Merciful.',
    'forgiveness',
    'Qur''anic context (Al-Qasas 28:15–17)',
    'A prophet''s immediate, excuse-free return to Allah after a serious mistake.',
    'Musa struck a man in a fight and the man died, which he had not intended. He immediately called it "from the work of Satan" (28:15), owned it without excuses and asked for forgiveness. The ayah records the answer in the same breath: "and He forgave him."',
    ARRAY[
      'Is there something you have done that you keep explaining away instead of owning before Allah?',
      'Musa named the wrong plainly and then simply asked. What would your honest version of this dua sound like?'
    ],
    'comfort',
    'رَبِّ إِنِّى ظَلَمْتُ نَفْسِى فَٱغْفِرْ لِى',
    'Rabbi inni zalamtu nafsi faghfir li',
    'My Lord, indeed I have wronged myself, so forgive me',
    'Before his prophethood, Musa عليه السلام stepped into a fight and struck a man, who died from the blow. He did not hide behind his intention or blame the other man; he turned straight to Allah and admitted he had wronged himself. Allah forgave him, and Musa vowed never again to support those who do wrong (28:17).',
    'Musa',
    'quranic',
    'approved'
  ),
  -- Nuh · 71:28
  (
    71,
    28,
    'رَّبِّ ٱغْفِرْ لِى وَلِوَٰلِدَىَّ وَلِمَن دَخَلَ بَيْتِىَ مُؤْمِنًا وَلِلْمُؤْمِنِينَ وَٱلْمُؤْمِنَـٰتِ وَلَا تَزِدِ ٱلظَّـٰلِمِينَ إِلَّا تَبَارًۢا',
    'My Lord, forgive me and my parents and whoever enters my house a believer and the believing men and believing women. And do not increase the wrongdoers except in destruction.',
    'forgiveness',
    'Qur''anic context (Nuh 71:5–28; Al-''Ankabut 29:14)',
    'Nuh''s closing dua: forgiveness that starts with oneself and widens to every believer.',
    'These are the closing words of Surah Nuh. After inviting his people "night and day" (71:5), Nuh''s final recorded dua begins with forgiveness for himself, then his parents, then everyone who entered his house in faith, and finally every believing man and woman.',
    ARRAY[
      'Who would you include if you widened your dua for forgiveness beyond yourself today?',
      'Nuh began with himself before anyone else. What do you need to ask forgiveness for first?'
    ],
    'comfort',
    'رَّبِّ ٱغْفِرْ لِى وَلِوَٰلِدَىَّ وَلِمَن دَخَلَ بَيْتِىَ مُؤْمِنًا وَلِلْمُؤْمِنِينَ وَٱلْمُؤْمِنَـٰتِ',
    'Rabbighfir li wa li-walidayya wa liman dakhala baytiya mu''minan wa lil-mu''mineena wal-mu''minaat',
    'My Lord, forgive me and my parents and whoever enters my house a believer and the believing men and believing women.',
    'Nuh عليه السلام remained among his people for a thousand years minus fifty (29:14), and only a few believed with him. At the end of that long mission, his dua did not begin with his people''s rejection but with his own need for forgiveness, then widened to his parents, his household and all the believers.',
    'Nuh',
    'quranic',
    'approved'
  ),
  -- Nuh · 54:10
  (
    54,
    10,
    'فَدَعَا رَبَّهُۥٓ أَنِّى مَغْلُوبٌ فَٱنتَصِرْ',
    'So he invoked his Lord, "Indeed, I am overpowered, so help."',
    'sadness',
    'Qur''anic context (Al-Qamar 54:9–15)',
    'A short dua for the moment you feel defeated and have nothing left to argue with.',
    'Nuh''s people called him "a madman" and he was repelled (54:9). His dua is only three words in Arabic: an admission that he had been overpowered and a request for help. The next ayat describe the answer: the gates of the heaven opened with pouring rain and the earth burst with springs (54:11–12).',
    ARRAY[
      'Where do you feel beaten right now — by circumstances, by people, or by your own tiredness?',
      'Nuh did not dress up his defeat. What would it mean to tell Allah, "I am overpowered," and leave the help to Him?'
    ],
    'comfort',
    'أَنِّى مَغْلُوبٌ فَٱنتَصِرْ',
    'Anni maghloobun fantasir',
    'Indeed, I am overpowered, so help.',
    'After centuries of patient calling, Nuh عليه السلام was mocked as mad and pushed away by his own people. He did not argue further; he called on his Lord with a short, exhausted dua. Allah answered with the flood, and saved him and those with him on the ship.',
    'Nuh',
    'quranic',
    'approved'
  ),
  -- Nuh · 23:29
  (
    23,
    29,
    'وَقُل رَّبِّ أَنزِلْنِى مُنزَلًا مُّبَارَكًا وَأَنتَ خَيْرُ ٱلْمُنزِلِينَ',
    'And say, ''My Lord, let me land at a blessed landing place, and You are the best to accommodate [us].''',
    'hope',
    'Qur''anic context (Al-Mu''minun 23:27–29)',
    'A dua Allah taught Nuh for setting out — fitting for any new beginning.',
    'Allah taught Nuh what to say once he boarded the ship: praise for being saved from the wrongdoing people (23:28), and this request to be settled somewhere blessed. It is a dua for every new beginning — a move, a new job, a new chapter — asking not only for a place, but for blessing in it.',
    ARRAY[
      'What new beginning are you standing at right now?',
      'Nuh asked for a blessed landing, not just a safe one. What would blessing look like in your next step?'
    ],
    'comfort',
    'رَّبِّ أَنزِلْنِى مُنزَلًا مُّبَارَكًا وَأَنتَ خَيْرُ ٱلْمُنزِلِينَ',
    'Rabbi anzilni munzalan mubarakan wa anta khayrul-munzileen',
    'My Lord, let me land at a blessed landing place, and You are the best to accommodate [us].',
    'When the flood came, Allah commanded Nuh عليه السلام to board the ship with his family and the believers, and taught him the words to say. After everything he had endured, he was not left to work out how to begin again: Allah gave him praise for the rescue and this dua for where he would land.',
    'Nuh',
    'quranic',
    'approved'
  ),
  -- Yusuf · 12:101
  (
    12,
    101,
    '۞ رَبِّ قَدْ ءَاتَيْتَنِى مِنَ ٱلْمُلْكِ وَعَلَّمْتَنِى مِن تَأْوِيلِ ٱلْأَحَادِيثِ ۚ فَاطِرَ ٱلسَّمَـٰوَٰتِ وَٱلْأَرْضِ أَنتَ وَلِىِّۦ فِى ٱلدُّنْيَا وَٱلْـَٔاخِرَةِ ۖ تَوَفَّنِى مُسْلِمًا وَأَلْحِقْنِى بِٱلصَّـٰلِحِينَ',
    'My Lord, You have given me [something] of sovereignty and taught me of the interpretation of dreams. Creator of the heavens and earth, You are my protector in this world and the Hereafter. Cause me to die a Muslim and join me with the righteous.',
    'gratitude',
    'Qur''anic context (Yusuf 12:99–101)',
    'Yusuf''s dua at the height of success: gratitude, and a request for a good ending.',
    'These words come at the very end of Yusuf''s story, after he was reunited with his family and raised his parents upon the throne (12:100). At the height of success he did not ask for more of this world; he acknowledged what Allah had given him and asked to die in submission and be joined with the righteous.',
    ARRAY[
      'What has Allah given you that you have not yet thanked Him for by name?',
      'Yusuf''s request at his peak was for a good ending. What would it change to keep that in view on your best days?'
    ],
    'comfort',
    'فَاطِرَ ٱلسَّمَـٰوَٰتِ وَٱلْأَرْضِ أَنتَ وَلِىِّۦ فِى ٱلدُّنْيَا وَٱلْـَٔاخِرَةِ ۖ تَوَفَّنِى مُسْلِمًا وَأَلْحِقْنِى بِٱلصَّـٰلِحِينَ',
    'Fatiras-samawati wal-ard, anta waliyyi fid-dunya wal-akhirah, tawaffani musliman wa alhiqni bis-saliheen',
    'Creator of the heavens and earth, You are my protector in this world and the Hereafter. Cause me to die a Muslim and join me with the righteous.',
    'Yusuf عليه السلام was thrown into a well by his brothers, sold, falsely accused and left in prison for several years. Allah raised him to authority in Egypt and finally brought his family back to him. At that moment of fulfilment, his dua was gratitude and hope for a good ending.',
    'Yusuf',
    'quranic',
    'approved'
  ),
  -- Yusuf · 12:33
  (
    12,
    33,
    'قَالَ رَبِّ ٱلسِّجْنُ أَحَبُّ إِلَىَّ مِمَّا يَدْعُونَنِىٓ إِلَيْهِ ۖ وَإِلَّا تَصْرِفْ عَنِّى كَيْدَهُنَّ أَصْبُ إِلَيْهِنَّ وَأَكُن مِّنَ ٱلْجَـٰهِلِينَ',
    'He said, "My Lord, prison is more to my liking than that to which they invite me. And if You do not avert from me their plan, I might incline toward them and [thus] be of the ignorant."',
    'patience',
    'Qur''anic context (Yusuf 12:23–35)',
    'A dua for holding firm against temptation without relying on one''s own strength.',
    'Yusuf was pursued by the wife of al-''Azeez and threatened with prison if he refused her (12:32). He chose prison over sin and, without trusting his own strength, asked Allah to turn their plan away from him. "So his Lord responded to him and averted from him their plan" (12:34).',
    ARRAY[
      'What temptation keeps returning to you, and what would it cost to choose the harder path?',
      'Yusuf did not rely on his own willpower; he asked Allah to turn the pull away from him. Where do you need to ask for that protection?'
    ],
    'balance',
    'رَبِّ ٱلسِّجْنُ أَحَبُّ إِلَىَّ مِمَّا يَدْعُونَنِىٓ إِلَيْهِ ۖ وَإِلَّا تَصْرِفْ عَنِّى كَيْدَهُنَّ أَصْبُ إِلَيْهِنَّ وَأَكُن مِّنَ ٱلْجَـٰهِلِينَ',
    'Rabbis-sijnu ahabbu ilayya mimma yad''oonani ilayh, wa illa tasrif ''anni kaydahunna asbu ilayhinna wa akun minal-jahileen',
    'My Lord, prison is more to my liking than that to which they invite me. And if You do not avert from me their plan, I might incline toward them and [thus] be of the ignorant.',
    'As a young man in the house of al-''Azeez, Yusuf عليه السلام was repeatedly invited to sin and threatened with prison if he refused. He preferred prison, and asked Allah to protect him from his own inclination. Allah answered him, and though he was later imprisoned unjustly, he kept his integrity.',
    'Yusuf',
    'quranic',
    'approved'
  ),
  -- Lut · 26:169
  (
    26,
    169,
    'رَبِّ نَجِّنِى وَأَهْلِى مِمَّا يَعْمَلُونَ',
    'My Lord, save me and my family from [the consequence of] what they do.',
    'loneliness',
    'Qur''anic context (Ash-Shu''ara 26:160–171; Al-A''raf 7:83)',
    'A dua for standing almost alone against the wrong around you.',
    'Lut told his people plainly, "Indeed, I am, toward your deed, of those who detest [it]" (26:168), standing almost alone against the practice of his whole town, who had threatened to evict him (26:167). He asked Allah to rescue him and his family, and Allah saved them, except his wife, who remained behind (7:83).',
    ARRAY[
      'Where do you feel like the only one holding on to what is right?',
      'Lut asked to be saved from what the people around him were doing. What environment do you need Allah to protect you from?'
    ],
    'comfort',
    'رَبِّ نَجِّنِى وَأَهْلِى مِمَّا يَعْمَلُونَ',
    'Rabbi najjini wa ahli mimma ya''maloon',
    'My Lord, save me and my family from [the consequence of] what they do.',
    'Lut عليه السلام lived among a people who openly committed indecency and threatened to expel him for objecting. He did not go along to fit in; he stated his rejection clearly and turned to Allah for rescue. Allah saved him and his family, except his wife.',
    'Lut',
    'quranic',
    'approved'
  ),
  -- Shu'ayb · 7:89
  (
    7,
    89,
    'قَدِ ٱفْتَرَيْنَا عَلَى ٱللَّهِ كَذِبًا إِنْ عُدْنَا فِى مِلَّتِكُم بَعْدَ إِذْ نَجَّىٰنَا ٱللَّهُ مِنْهَا ۚ وَمَا يَكُونُ لَنَآ أَن نَّعُودَ فِيهَآ إِلَّآ أَن يَشَآءَ ٱللَّهُ رَبُّنَا ۚ وَسِعَ رَبُّنَا كُلَّ شَىْءٍ عِلْمًا ۚ عَلَى ٱللَّهِ تَوَكَّلْنَا ۚ رَبَّنَا ٱفْتَحْ بَيْنَنَا وَبَيْنَ قَوْمِنَا بِٱلْحَقِّ وَأَنتَ خَيْرُ ٱلْفَـٰتِحِينَ',
    'We would have invented against Allāh a lie if we returned to your religion after Allāh had saved us from it. And it is not for us to return to it except that Allāh, our Lord, should will. Our Lord has encompassed all things in knowledge. Upon Allāh we have relied. Our Lord, decide between us and our people in truth, and You are the best of those who give decision.',
    'patience',
    'Qur''anic context (Al-A''raf 7:85–93)',
    'Reliance on Allah under pressure to abandon one''s faith.',
    'The arrogant leaders of Madyan threatened to evict Shu''ayb and the believers unless they returned to the people''s religion (7:88). Shu''ayb refused, declared "Upon Allah we have relied," and asked Allah to decide between them and their people in truth — leaving the outcome with the best of judges.',
    ARRAY[
      'Where are you being pressured to give up something you know is right?',
      'Shu''ayb stated his reliance before he made his request. What would it sound like to say "Upon Allah I rely" about your situation?'
    ],
    'balance',
    'عَلَى ٱللَّهِ تَوَكَّلْنَا ۚ رَبَّنَا ٱفْتَحْ بَيْنَنَا وَبَيْنَ قَوْمِنَا بِٱلْحَقِّ وَأَنتَ خَيْرُ ٱلْفَـٰتِحِينَ',
    '''Alallahi tawakkalna, Rabbanaftah baynana wa bayna qawmina bil-haqqi wa anta khayrul-fatiheen',
    'Upon Allah we have relied. Our Lord, decide between us and our people in truth, and You are the best of those who give decision.',
    'Shu''ayb عليه السلام called the people of Madyan to worship Allah alone and to give full measure and weight in their trade (7:85). Their leaders answered by threatening to drive him and the believers out of the city. He responded with reliance on Allah and this dua, and Allah decided between them.',
    'Shu''ayb',
    'quranic',
    'approved'
  ),
  -- Ibrahim · 14:40
  (
    14,
    40,
    'رَبِّ ٱجْعَلْنِى مُقِيمَ ٱلصَّلَوٰةِ وَمِن ذُرِّيَّتِى ۚ رَبَّنَا وَتَقَبَّلْ دُعَآءِ',
    'My Lord, make me an establisher of prayer, and [many] from my descendants. Our Lord, and accept my supplication.',
    'guilt',
    'Qur''anic context (Ibrahim 14:35–41)',
    'For anyone struggling to stay steady in prayer: even Ibrahim asked for it.',
    'Ibrahim made this dua after settling some of his descendants in an uncultivated valley near the Sacred House "that they may establish prayer" (14:37). Even as a prophet, he did not assume he would stay steady in prayer; he asked Allah for it, for himself and his descendants, and then asked Him to accept the dua itself.',
    ARRAY[
      'What has made prayer feel hard to hold on to lately?',
      'Ibrahim asked to be made one who establishes prayer — he did not assume he could do it alone. What would it mean to ask for that help instead of only blaming yourself?'
    ],
    'comfort',
    'رَبِّ ٱجْعَلْنِى مُقِيمَ ٱلصَّلَوٰةِ وَمِن ذُرِّيَّتِى ۚ رَبَّنَا وَتَقَبَّلْ دُعَآءِ',
    'Rabbij''alni muqeemas-salati wa min dhurriyyati, Rabbana wa taqabbal du''a''',
    'My Lord, make me an establisher of prayer, and [many] from my descendants. Our Lord, and accept my supplication.',
    'Ibrahim عليه السلام settled some of his descendants in a barren valley beside the Sacred House, trusting Allah to provide for them. His duas there asked that hearts would incline toward them and that they would be provided for — and, above all, that he and his children would keep establishing prayer.',
    'Ibrahim',
    'quranic',
    'approved'
  ),
  -- Ibrahim · 2:127
  (
    2,
    127,
    'وَإِذْ يَرْفَعُ إِبْرَٰهِـۧمُ ٱلْقَوَاعِدَ مِنَ ٱلْبَيْتِ وَإِسْمَـٰعِيلُ رَبَّنَا تَقَبَّلْ مِنَّآ ۖ إِنَّكَ أَنتَ ٱلسَّمِيعُ ٱلْعَلِيمُ',
    'And [mention] when Abraham was raising the foundations of the House and [with him] Ishmael, [saying], "Our Lord, accept [this] from us. Indeed, You are the Hearing, the Knowing."',
    'hope',
    'Qur''anic context (Al-Baqarah 2:127–129)',
    'Asking for acceptance while still doing the work.',
    'Ibrahim and Isma''il made this dua while raising the foundations of the House. Even in the middle of one of the greatest acts of worship in history, they did not speak about the work itself; they asked Allah to accept it, knowing effort only has value if He accepts it.',
    ARRAY[
      'What good are you working on right now that you want Allah to accept?',
      'Ibrahim and Isma''il asked for acceptance while still building. How would it change your effort to ask for that at the start, not just the end?'
    ],
    'comfort',
    'رَبَّنَا تَقَبَّلْ مِنَّآ ۖ إِنَّكَ أَنتَ ٱلسَّمِيعُ ٱلْعَلِيمُ',
    'Rabbana taqabbal minna innaka anta as-Samee'' al-''Aleem',
    'Our Lord, accept [this] from us. Indeed, You are the Hearing, the Knowing.',
    'Ibrahim عليه السلام and his son Isma''il عليه السلام raised the foundations of the House with their own hands. As they built, they asked Allah to accept their work, to make them and their descendants submissive to Him, and to send among them a messenger from themselves (2:128–129).',
    'Ibrahim',
    'quranic',
    'approved'
  ),
  -- Muhammad · 20:114
  (
    20,
    114,
    'فَتَعَـٰلَى ٱللَّهُ ٱلْمَلِكُ ٱلْحَقُّ ۗ وَلَا تَعْجَلْ بِٱلْقُرْءَانِ مِن قَبْلِ أَن يُقْضَىٰٓ إِلَيْكَ وَحْيُهُۥ ۖ وَقُل رَّبِّ زِدْنِى عِلْمًا',
    'So high [above all] is Allāh, the Sovereign, the Truth. And, [O Muḥammad], do not hasten with [recitation of] the Qur’ān before its revelation is completed to you, and say, "My Lord, increase me in knowledge."',
    'guidance',
    'Qur''anic context (Ta-Ha 20:113–114; Al-Qiyamah 75:16)',
    'A dua Allah taught the Prophet ﷺ directly — for every learner.',
    'Allah told the Prophet ﷺ not to hasten with the Qur''an before its revelation was complete, and in the same ayah taught him to ask for more knowledge. Patience with how knowledge arrives, and hunger for more of it, sit side by side.',
    ARRAY[
      'What do you most want to understand better about your faith right now?',
      'This dua pairs a desire for more with patience in how it arrives. Where are you rushing an answer that needs time?'
    ],
    'comfort',
    'رَّبِّ زِدْنِى عِلْمًا',
    'Rabbi zidni ''ilma',
    'My Lord, increase me in knowledge.',
    'As revelation came to the Prophet Muhammad ﷺ, he would hasten to recite it (75:16). Allah reassured him not to rush, and taught him instead to ask for an increase in knowledge — a dua every learner can carry.',
    'Muhammad',
    'quranic',
    'approved'
  ),
  -- Muhammad · 23:118
  (
    23,
    118,
    'وَقُل رَّبِّ ٱغْفِرْ وَٱرْحَمْ وَأَنتَ خَيْرُ ٱلرَّٰحِمِينَ',
    'And, [O Muḥammad], say, "My Lord, forgive and have mercy, and You are the best of the merciful."',
    'forgiveness',
    'Qur''anic context (Al-Mu''minun 23:99–118)',
    'The closing dua of Surah al-Mu''minun, taught to the Prophet ﷺ.',
    'Surah al-Mu''minun opens with "Certainly will the believers have succeeded" (23:1) and describes people who, at death, beg to be sent back to do good (23:99–100). It closes with this command to the Prophet ﷺ: to ask the best of those who show mercy for forgiveness and mercy while there is still time.',
    ARRAY[
      'What would you ask Allah to forgive if you truly believed He is the best of those who show mercy?',
      'This dua asks for forgiveness and mercy together. Where do you need not just pardon, but gentleness?'
    ],
    'comfort',
    'رَّبِّ ٱغْفِرْ وَٱرْحَمْ وَأَنتَ خَيْرُ ٱلرَّٰحِمِينَ',
    'Rabbighfir warham wa anta khayrur-rahimeen',
    'My Lord, forgive and have mercy, and You are the best of the merciful.',
    'This is one of the duas Allah taught the Prophet Muhammad ﷺ directly, closing a surah about who truly succeeds. It is short enough to say anywhere, and asks simply for forgiveness and mercy from the Most Merciful.',
    'Muhammad',
    'quranic',
    'approved'
  ),
  -- Zakariyya · 3:38
  (
    3,
    38,
    'هُنَالِكَ دَعَا زَكَرِيَّا رَبَّهُۥ ۖ قَالَ رَبِّ هَبْ لِى مِن لَّدُنكَ ذُرِّيَّةً طَيِّبَةً ۖ إِنَّكَ سَمِيعُ ٱلدُّعَآءِ',
    'At that, Zechariah called upon his Lord, saying, "My Lord, grant me from Yourself a good offspring. Indeed, You are the Hearer of supplication."',
    'hope',
    'Qur''anic context (Aal ''Imran 3:37–40)',
    'Hope renewed by seeing Allah''s generosity to someone else.',
    'Every time Zakariyya entered upon Maryam he found provision with her, and she told him, "It is from Allah. Indeed, Allah provides for whom He wills without account" (3:37). Right there, though he had reached old age and his wife was barren (3:40), he asked for good offspring — and the angels called to him with the glad tidings of Yahya while he stood in prayer (3:39).',
    ARRAY[
      'What have you stopped asking for because it seems impossible?',
      'Zakariyya''s hope was renewed by seeing what Allah had done for someone else. Whose blessing could remind you that Allah still gives?'
    ],
    'comfort',
    'رَبِّ هَبْ لِى مِن لَّدُنكَ ذُرِّيَّةً طَيِّبَةً ۖ إِنَّكَ سَمِيعُ ٱلدُّعَآءِ',
    'Rabbi hab li min ladunka dhurriyyatan tayyibatan innaka samee''ud-du''a''',
    'My Lord, grant me from Yourself a good offspring. Indeed, You are the Hearer of supplication.',
    'Zakariyya عليه السلام cared for Maryam and kept finding provision with her that he had not brought. Moved by that sign, he asked Allah for righteous offspring despite his old age. Allah gave him the glad tidings of Yahya, a prophet from among the righteous.',
    'Zakariyya',
    'quranic',
    'approved'
  )
ON CONFLICT (surah, ayah_number, (md5(dua_text))) DO NOTHING;
