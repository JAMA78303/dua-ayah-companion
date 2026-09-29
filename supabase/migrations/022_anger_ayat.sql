-- Ayat for the new "anger" feeling: 12 new pairings, matching the other feelings.
--
-- Ayat and duas are Qur'anic only. Arabic: Quran.com text_uthmani (verbatim; a dua is a word-for-word
-- slice of its ayah). Translation: Saheeh International (verbatim). Dua transliteration: Quran.com
-- word-by-word transliteration. Summaries and prompts draw only on the Qur'an itself; the ayat each
-- relies on are listed in tafsir_source, and every quotation was checked against the Saheeh text.
--
-- All new rows are 'pending': nothing appears in the app until it is approved on the review screen.
-- Safe to re-run: existing rows are skipped.

-- Where a pairing's dua comes from a different ayah (e.g. '20:25-26'), so the app can cite and link it.
-- NULL on older rows, whose dua is taken from the pairing's own ayah.
ALTER TABLE public.ayah_pairings ADD COLUMN IF NOT EXISTS dua_verse_key TEXT;

ALTER TABLE public.ayah_pairings DROP CONSTRAINT IF EXISTS ayah_pairings_dua_verse_key_format;
ALTER TABLE public.ayah_pairings ADD CONSTRAINT ayah_pairings_dua_verse_key_format
  CHECK (dua_verse_key IS NULL OR dua_verse_key ~ '^[0-9]{1,3}:[0-9]{1,3}(-[0-9]{1,3})?$');

INSERT INTO public.ayah_pairings (
  surah, ayah_number, arabic_text, translation, emotion_category, tafsir_source, inclusion_reason, tafsir_summary, reflection_prompts, tone_tag, dua_text, dua_transliteration, dua_translation, dua_verse_key, source_type, status
)
VALUES
  -- anger · 42:37
  (
    42,
    37,
    'وَٱلَّذِينَ يَجْتَنِبُونَ كَبَـٰٓئِرَ ٱلْإِثْمِ وَٱلْفَوَٰحِشَ وَإِذَا مَا غَضِبُوا۟ هُمْ يَغْفِرُونَ',
    'And those who avoid the major sins and immoralities, and when they are angry, they forgive,',
    'anger',
    'Qur''anic context (Ash-Shura 42:36–37)',
    'Among the believers'' qualities: when they are angry, they forgive.',
    'Describing those for whom "what is with Allāh is better and more lasting" (42:36), the Qur''an includes "those who avoid the major sins and immoralities, and when they are angry, they forgive". Anger itself is not the failing; what matters is what you do with it, and here the believers answer it with forgiveness.',
    ARRAY['What made you angry recently?', 'What would forgiving look like here, even if the hurt was real?'],
    'balance',
    'رَبِّ إِنِّى ظَلَمْتُ نَفْسِى فَٱغْفِرْ لِى',
    'Rabbi innī ẓalamtu nafsī fa-igh''fir lī',
    'My Lord, indeed I have wronged myself, so forgive me',
    '28:16',
    'quranic',
    'pending'
  ),
  -- anger · 42:40
  (
    42,
    40,
    'وَجَزَٰٓؤُا۟ سَيِّئَةٍ سَيِّئَةٌ مِّثْلُهَا ۖ فَمَنْ عَفَا وَأَصْلَحَ فَأَجْرُهُۥ عَلَى ٱللَّهِ ۚ إِنَّهُۥ لَا يُحِبُّ ٱلظَّـٰلِمِينَ',
    'And the retribution for an evil act is an evil one like it, but whoever pardons and makes reconciliation - his reward is [due] from Allāh. Indeed, He does not like wrongdoers.',
    'anger',
    'Qur''anic context (Ash-Shura 42:40–41)',
    'Justice is allowed, but pardoning is rewarded by Allah Himself.',
    '"And the retribution for an evil act is an evil one like it, but whoever pardons and makes reconciliation - his reward is [due] from Allāh." The Qur''an allows a fair response to being wronged (42:41), yet it promises that the one who pardons and makes peace will be rewarded by Allah Himself.',
    ARRAY['Who has wronged you that you''re still angry with?', 'What would making peace look like, if it''s safe to do so?'],
    'balance',
    'رَّبِّ ٱغْفِرْ وَٱرْحَمْ وَأَنتَ خَيْرُ ٱلرَّٰحِمِينَ',
    'Rabbi igh''fir wa-ir''ḥam wa-anta khayru l-rāḥimīna',
    'My Lord, forgive and have mercy, and You are the best of the merciful.',
    '23:118',
    'quranic',
    'pending'
  ),
  -- anger · 42:43
  (
    42,
    43,
    'وَلَمَن صَبَرَ وَغَفَرَ إِنَّ ذَٰلِكَ لَمِنْ عَزْمِ ٱلْأُمُورِ',
    'And whoever is patient and forgives - indeed, that is of the matters [worthy] of resolve.',
    'anger',
    'Qur''anic context (Ash-Shura 42:43)',
    'Patience and forgiveness are named as matters of real resolve.',
    '"And whoever is patient and forgives - indeed, that is of the matters [worthy] of resolve." Holding back and forgiving is not weakness; the Qur''an names it among the things that take real strength.',
    ARRAY['When did holding back your anger take real strength?', 'What would patience look like in the situation you''re in now?'],
    'comfort',
    'رَبَّنَآ أَفْرِغْ عَلَيْنَا صَبْرًا وَتَوَفَّنَا مُسْلِمِينَ',
    'Rabbanā afrigh ʿalaynā ṣabran watawaffanā mus''limīna',
    'Our Lord, pour upon us patience and let us die as Muslims [in submission to You].',
    '7:126',
    'quranic',
    'pending'
  ),
  -- anger · 41:34
  (
    41,
    34,
    'وَلَا تَسْتَوِى ٱلْحَسَنَةُ وَلَا ٱلسَّيِّئَةُ ۚ ٱدْفَعْ بِٱلَّتِى هِىَ أَحْسَنُ فَإِذَا ٱلَّذِى بَيْنَكَ وَبَيْنَهُۥ عَدَٰوَةٌ كَأَنَّهُۥ وَلِىٌّ حَمِيمٌ',
    'And not equal are the good deed and the bad. Repel [evil] by that [deed] which is better; and thereupon, the one whom between you and him is enmity [will become] as though he was a devoted friend.',
    'anger',
    'Qur''anic context (Fussilat 41:34–35)',
    'Answer harm with something better, and an enemy can become a close friend.',
    '"And not equal are the good deed and the bad. Repel [evil] by that [deed] which is better; and thereupon, the one whom between you and him is enmity [will become] as though he was a devoted friend." The next ayah is honest about how hard this is: "none is granted it except those who are patient" (41:35).',
    ARRAY['Who is someone you''re in conflict with?', 'What is one better thing you could do in return for their harm?'],
    'comfort',
    'رَبَّنَا ٱغْفِرْ لَنَا وَلِإِخْوَٰنِنَا ٱلَّذِينَ سَبَقُونَا بِٱلْإِيمَـٰنِ وَلَا تَجْعَلْ فِى قُلُوبِنَا غِلًّا لِّلَّذِينَ ءَامَنُوا۟ رَبَّنَآ إِنَّكَ رَءُوفٌ رَّحِيمٌ',
    'Rabbanā igh''fir lanā wali-ikh''wāninā alladhīna sabaqūnā bil-īmāni walā tajʿal fī qulūbinā ghillan lilladhīna āmanū rabbanā innaka raūfun raḥīmun',
    'Our Lord, forgive us and our brothers who preceded us in faith and put not in our hearts [any] resentment toward those who have believed. Our Lord, indeed You are Kind and Merciful.',
    '59:10',
    'quranic',
    'pending'
  ),
  -- anger · 41:36
  (
    41,
    36,
    'وَإِمَّا يَنزَغَنَّكَ مِنَ ٱلشَّيْطَـٰنِ نَزْغٌ فَٱسْتَعِذْ بِٱللَّهِ ۖ إِنَّهُۥ هُوَ ٱلسَّمِيعُ ٱلْعَلِيمُ',
    'And if there comes to you from Satan an evil suggestion, then seek refuge in Allāh. Indeed, He is the Hearing, the Knowing.',
    'anger',
    'Qur''anic context (Fussilat 41:34–36)',
    'When anger feels like a push from Satan, seek refuge in Allah.',
    'Right after telling us to repel evil with what is better (41:34), Allah says: "And if there comes to you from Satan an evil suggestion, then seek refuge in Allāh. Indeed, He is the Hearing, the Knowing." When anger pushes you towards words or actions you''d regret, turning to Allah is the first step.',
    ARRAY['What does anger push you to say or do?', 'Could seeking refuge in Allah become your first response when it rises?'],
    'comfort',
    'رَبِّ ٱشْرَحْ لِى صَدْرِى وَيَسِّرْ لِىٓ أَمْرِى',
    'Rabbi ish''raḥ lī ṣadrī wayassir lī amrī',
    'My Lord, expand [i.e., relax] for me my breast [with assurance] and ease for me my task',
    '20:25-26',
    'quranic',
    'pending'
  ),
  -- anger · 7:199
  (
    7,
    199,
    'خُذِ ٱلْعَفْوَ وَأْمُرْ بِٱلْعُرْفِ وَأَعْرِضْ عَنِ ٱلْجَـٰهِلِينَ',
    'Take what is given freely, enjoin what is good, and turn away from the ignorant.',
    'anger',
    'Qur''anic context (Al-A''raf 7:199–200)',
    'Take what comes easily, command good, and turn away from the ignorant.',
    '"Take what is given freely, enjoin what is good, and turn away from the ignorant." The next ayah continues: "And if an evil suggestion comes to you from Satan, then seek refuge in Allāh" (7:200). Not every provocation needs an answer; sometimes turning away is the guided response.',
    ARRAY['Which argument are you tempted to keep having?', 'What would turning away from it look like?'],
    'balance',
    'ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ',
    'Ih''dinā l-ṣirāṭa l-mus''taqīma',
    'Guide us to the straight path',
    '1:6',
    'quranic',
    'pending'
  ),
  -- anger · 7:201
  (
    7,
    201,
    'إِنَّ ٱلَّذِينَ ٱتَّقَوْا۟ إِذَا مَسَّهُمْ طَـٰٓئِفٌ مِّنَ ٱلشَّيْطَـٰنِ تَذَكَّرُوا۟ فَإِذَا هُم مُّبْصِرُونَ',
    'Indeed, those who fear Allāh - when an impulse touches them from Satan, they remember [Him] and at once they have insight.',
    'anger',
    'Qur''anic context (Al-A''raf 7:200–201)',
    'When an impulse from Satan touches the mindful, they remember Allah and see clearly.',
    '"Indeed, those who fear Allāh - when an impulse touches them from Satan, they remember [Him] and at once they have insight." Anger can cloud everything, and remembering Allah is how clarity returns.',
    ARRAY['What helps you see clearly again after you''ve been angry?', 'Which words of remembrance could you reach for next time?'],
    'comfort',
    'رَّبِّ زِدْنِى عِلْمًا',
    'Rabbi zid''nī ʿil''man',
    'My Lord, increase me in knowledge.',
    '20:114',
    'quranic',
    'pending'
  ),
  -- anger · 25:63
  (
    25,
    63,
    'وَعِبَادُ ٱلرَّحْمَـٰنِ ٱلَّذِينَ يَمْشُونَ عَلَى ٱلْأَرْضِ هَوْنًا وَإِذَا خَاطَبَهُمُ ٱلْجَـٰهِلُونَ قَالُوا۟ سَلَـٰمًا',
    'And the servants of the Most Merciful are those who walk upon the earth easily, and when the ignorant address them [harshly], they say [words of] peace,',
    'anger',
    'Qur''anic context (Al-Furqan 25:63–64)',
    'The servants of the Most Merciful answer harshness with "peace".',
    '"And the servants of the Most Merciful are those who walk upon the earth easily, and when the ignorant address them [harshly], they say [words of] peace". They are the same people who "spend [part of] the night to their Lord prostrating and standing" (25:64): their calm with people grows from their time with Allah.',
    ARRAY['How do you usually respond when someone speaks to you harshly?', 'What would answering with words of peace sound like next time?'],
    'comfort',
    'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَٰجِنَا وَذُرِّيَّـٰتِنَا قُرَّةَ أَعْيُنٍ وَٱجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا',
    'Rabbanā hab lanā min azwājinā wadhurriyyātinā qurrata aʿyunin wa-ij''ʿalnā lil''muttaqīna imāman',
    'Our Lord, grant us from among our wives and offspring comfort to our eyes and make us a leader [i.e., example] for the righteous.',
    '25:74',
    'quranic',
    'pending'
  ),
  -- anger · 23:96
  (
    23,
    96,
    'ٱدْفَعْ بِٱلَّتِى هِىَ أَحْسَنُ ٱلسَّيِّئَةَ ۚ نَحْنُ أَعْلَمُ بِمَا يَصِفُونَ',
    'Repel, by [means of] what is best, [their] evil. We are most knowing of what they describe.',
    'anger',
    'Qur''anic context (Al-Mu''minun 23:96–98)',
    'Repel harm with what is best, and leave the rest to Allah, who knows.',
    '"Repel, by [means of] what is best, [their] evil. We are most knowing of what they describe." The very next words teach what to say: "My Lord, I seek refuge in You from the incitements of the devils" (23:97). Allah knows what was said about you; your part is to answer with what is best.',
    ARRAY['What has been said about you that still stings?', 'What would answering it with what is best look like?'],
    'comfort',
    'رَّبِّ أَعُوذُ بِكَ مِنْ هَمَزَٰتِ ٱلشَّيَـٰطِينِ وَأَعُوذُ بِكَ رَبِّ أَن يَحْضُرُونِ',
    'Rabbi aʿūdhu bika min hamazāti l-shayāṭīni wa-aʿūdhu bika rabbi an yaḥḍurūni',
    'My Lord, I seek refuge in You from the incitements of the devils, and I seek refuge in You, my Lord, lest they be present with me.',
    '23:97-98',
    'quranic',
    'pending'
  ),
  -- anger · 7:154
  (
    7,
    154,
    'وَلَمَّا سَكَتَ عَن مُّوسَى ٱلْغَضَبُ أَخَذَ ٱلْأَلْوَاحَ ۖ وَفِى نُسْخَتِهَا هُدًى وَرَحْمَةٌ لِّلَّذِينَ هُمْ لِرَبِّهِمْ يَرْهَبُونَ',
    'And when the anger subsided in Moses, he took up the tablets; and in their inscription was guidance and mercy for those who are fearful of their Lord.',
    'anger',
    'Qur''anic context (Al-A''raf 7:150–154)',
    'Even a prophet felt anger, and the Qur''an describes it settling.',
    'When Musa returned to find his people had taken the calf for worship, he came back "angry and grieved", threw down the tablets and seized his brother (7:150). Then he prayed, "My Lord, forgive me and my brother and admit us into Your mercy" (7:151), and "when the anger subsided in Moses, he took up the tablets". Anger can come even to the best of people; what matters is turning to Allah and picking up again what you put down.',
    ARRAY['What did you put down in a moment of anger that you need to pick up again?', 'Who might you need to make things right with?'],
    'comfort',
    'رَبِّ ٱغْفِرْ لِى وَلِأَخِى وَأَدْخِلْنَا فِى رَحْمَتِكَ ۖ وَأَنتَ أَرْحَمُ ٱلرَّٰحِمِينَ',
    'Rabbi igh''fir lī wali-akhī wa-adkhil''nā fī raḥmatika wa-anta arḥamu l-rāḥimīna',
    'My Lord, forgive me and my brother and admit us into Your mercy, for You are the most merciful of the merciful.',
    '7:151',
    'quranic',
    'pending'
  ),
  -- anger · 5:8
  (
    5,
    8,
    'يَـٰٓأَيُّهَا ٱلَّذِينَ ءَامَنُوا۟ كُونُوا۟ قَوَّٰمِينَ لِلَّهِ شُهَدَآءَ بِٱلْقِسْطِ ۖ وَلَا يَجْرِمَنَّكُمْ شَنَـَٔانُ قَوْمٍ عَلَىٰٓ أَلَّا تَعْدِلُوا۟ ۚ ٱعْدِلُوا۟ هُوَ أَقْرَبُ لِلتَّقْوَىٰ ۖ وَٱتَّقُوا۟ ٱللَّهَ ۚ إِنَّ ٱللَّهَ خَبِيرٌۢ بِمَا تَعْمَلُونَ',
    'O you who have believed, be persistently standing firm for Allāh, witnesses in justice, and do not let the hatred of a people prevent you from being just. Be just; that is nearer to righteousness. And fear Allāh; indeed, Allāh is [fully] Aware of what you do.',
    'anger',
    'Qur''anic context (Al-Ma''idah 5:8)',
    'Don''t let anger at people push you into being unjust.',
    '"O you who have believed, be persistently standing firm for Allāh, witnesses in justice, and do not let the hatred of a people prevent you from being just. Be just; that is nearer to righteousness." Even when you''re angry with someone, and even when you have reason to be, you are still asked to be fair to them.',
    ARRAY['Is anger making you unfair to someone?', 'What would being just look like, even while you''re still hurt?'],
    'balance',
    'رَبَّنَا ٱغْفِرْ لَنَا ذُنُوبَنَا وَإِسْرَافَنَا فِىٓ أَمْرِنَا وَثَبِّتْ أَقْدَامَنَا وَٱنصُرْنَا عَلَى ٱلْقَوْمِ ٱلْكَـٰفِرِينَ',
    'Rabbanā igh''fir lanā dhunūbanā wa-is''rāfanā fī amrinā wathabbit aqdāmanā wa-unṣur''nā ʿalā l-qawmi l-kāfirīna',
    'Our Lord, forgive us our sins and the excess [committed] in our affairs and plant firmly our feet and give us victory over the disbelieving people.',
    '3:147',
    'quranic',
    'pending'
  ),
  -- anger · 15:85
  (
    15,
    85,
    'وَمَا خَلَقْنَا ٱلسَّمَـٰوَٰتِ وَٱلْأَرْضَ وَمَا بَيْنَهُمَآ إِلَّا بِٱلْحَقِّ ۗ وَإِنَّ ٱلسَّاعَةَ لَـَٔاتِيَةٌ ۖ فَٱصْفَحِ ٱلصَّفْحَ ٱلْجَمِيلَ',
    'And We have not created the heavens and earth and that between them except in truth. And indeed, the Hour is coming; so forgive with gracious forgiveness.',
    'anger',
    'Qur''anic context (Al-Hijr 15:85–86)',
    'A short command: "so forgive with gracious forgiveness."',
    '"And We have not created the heavens and earth and that between them except in truth. And indeed, the Hour is coming; so forgive with gracious forgiveness." The next ayah adds, "Indeed, your Lord - He is the Knowing Creator" (15:86). Because Allah will bring every matter to its truth, you can let go and forgive graciously.',
    ARRAY['What are you holding on to that you could let go?', 'What would forgiving graciously, without reminding them of it, look like?'],
    'comfort',
    'أَنتَ وَلِيُّنَا فَٱغْفِرْ لَنَا وَٱرْحَمْنَا ۖ وَأَنتَ خَيْرُ ٱلْغَـٰفِرِينَ',
    'Anta waliyyunā fa-igh''fir lanā wa-ir''ḥamnā wa-anta khayru l-ghāfirīna',
    'You are our Protector, so forgive us and have mercy upon us; and You are the best of forgivers.',
    '7:155',
    'quranic',
    'pending'
  )
ON CONFLICT (surah, ayah_number, (md5(dua_text))) DO NOTHING;
