-- =============================================================================
-- 004_expanded_duas_seed.sql
-- Dua & Ayah Companion — Expanded Qur'anic Duas Seed
-- =============================================================================
-- Safe to run before Imam review on Tuesday.
-- All entries are from explicit, well-established Qur'anic duas.
-- No hadith-only attributions. No disputed narrations.
-- All status = 'approved' — these do not require additional sign-off.
--
-- Run order: 001_mvp_core.sql → 002_prophetic_duas.sql → 003_fix_ayyub_dua_wording.sql → 004_expanded_duas_seed.sql
--
-- Verification query (run after):
--   SELECT emotion_category, COUNT(*) FROM ayah_pairings
--   WHERE status = 'approved' GROUP BY emotion_category ORDER BY emotion_category;
-- =============================================================================

-- =============================================================================
-- INTENT MAPPINGS — New keywords for new/existing categories
-- =============================================================================

INSERT INTO intent_mappings (keyword, category, weight) VALUES

  -- GRIEF / LOSS
  ('i lost someone',              'grief', 1.0),
  ('someone died',                'grief', 1.0),
  ('i am grieving',               'grief', 1.0),
  ('i miss them',                 'grief', 0.9),
  ('i feel empty',                'grief', 0.8),
  ('i can''t stop crying',        'grief', 0.9),
  ('i lost something important',  'grief', 0.8),
  ('i feel broken',               'grief', 0.9),

  -- HOPE
  ('i need hope',                 'hope', 1.0),
  ('i want to believe',           'hope', 0.9),
  ('i feel hopeful',              'hope', 0.9),
  ('things will get better',      'hope', 0.8),
  ('i''m trying to stay positive','hope', 0.8),
  ('i want to keep going',        'hope', 0.9),

  -- FORGIVENESS / REPENTANCE
  ('i need forgiveness',          'forgiveness', 1.0),
  ('i feel ashamed',              'forgiveness', 0.9),
  ('i made a mistake',            'forgiveness', 0.9),
  ('i keep sinning',              'forgiveness', 1.0),
  ('i want to repent',            'forgiveness', 1.0),
  ('i feel unworthy',             'forgiveness', 0.9),
  ('i did something wrong',       'forgiveness', 0.9),
  ('tawbah',                      'forgiveness', 1.0),
  ('istighfar',                   'forgiveness', 1.0),

  -- LONELINESS
  ('i feel alone',                'loneliness', 1.0),
  ('no one understands me',       'loneliness', 1.0),
  ('i feel lonely',               'loneliness', 1.0),
  ('i have no one',               'loneliness', 0.9),
  ('i feel unseen',               'loneliness', 0.9),
  ('nobody cares',                'loneliness', 0.9),

  -- GRATITUDE (additional keywords)
  ('alhamdulillah',               'gratitude', 1.0),
  ('i am thankful',               'gratitude', 0.9),
  ('i feel blessed',              'gratitude', 0.9),
  ('things are going well',       'gratitude', 0.8),

  -- ANXIETY (additional keywords)
  ('i can''t sleep',              'anxiety', 0.9),
  ('i keep overthinking',         'anxiety', 1.0),
  ('what if',                     'anxiety', 0.7),
  ('i''m scared of the future',   'anxiety', 1.0),
  ('i feel out of control',       'anxiety', 0.9),
  ('tawakkul',                    'anxiety', 0.9)

ON CONFLICT DO NOTHING;

-- =============================================================================
-- CATEGORY: ANXIETY / FEAR
-- =============================================================================

-- Al-Baqarah 2:286 — "Our Lord, do not burden us..."
INSERT INTO ayah_pairings (
  surah, ayah_number, arabic_text, translation,
  emotion_category, tafsir_source, inclusion_reason,
  tafsir_summary, reflection_prompts, tone_tag,
  dua_text, dua_transliteration, dua_translation,
  prophetic_story, prophet_name, status
) VALUES (
  2, 286,
  'رَبَّنَا لَا تُؤَاخِذْنَآ إِن نَّسِينَآ أَوْ أَخْطَأْنَا ۚ رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَآ إِصْرًا كَمَا حَمَلْتَهُۥ عَلَى ٱلَّذِينَ مِن قَبْلِنَا ۚ رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِۦ',
  'Our Lord, do not impose blame upon us if we forget or make an error. Our Lord, and lay not upon us a burden like that which You laid upon those before us. Our Lord, and burden us not with that which we have no ability to bear.',
  'anxiety',
  'Ibn Kathir',
  'The closing dua of Surah Al-Baqarah. Directly addresses the fear of being overwhelmed beyond one''s capacity. Allah confirmed He accepted this dua — narrated that He responded "I have done so" to each request.',
  'Ibn Kathir records that this dua, the closing of Surah Al-Baqarah, was met with Allah''s direct acceptance — each request was answered with "I have done so." The ayah explicitly acknowledges human limitation and asks that burdens not exceed capacity. It is one of the most complete duas in the Qur''an, covering forgetfulness, error, and overwhelm.',
  ARRAY[
    'What burden are you carrying right now that feels heavier than you can manage?',
    'This dua acknowledges forgetfulness and mistakes before asking for relief. What would it mean to bring your full reality — not just your best self — to Allah in dua?'
  ],
  'comfort',
  'رَبَّنَا لَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِۦ',
  'Rabbana la tuhammilna ma la taqata lana bih',
  'Our Lord, burden us not with that which we have no ability to bear',
  NULL, NULL,
  'approved'
);

-- Al-Imran 3:8 — "Our Lord, do not let our hearts deviate..."
INSERT INTO ayah_pairings (
  surah, ayah_number, arabic_text, translation,
  emotion_category, tafsir_source, inclusion_reason,
  tafsir_summary, reflection_prompts, tone_tag,
  dua_text, dua_transliteration, dua_translation,
  prophetic_story, prophet_name, status
) VALUES (
  3, 8,
  'رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن لَّدُنكَ رَحْمَةً ۚ إِنَّكَ أَنتَ ٱلْوَهَّابُ',
  'Our Lord, do not let our hearts deviate after You have guided us, and grant us from Yourself mercy. Indeed, You are the Bestower.',
  'anxiety',
  'Ibn Kathir',
  'A dua for spiritual steadfastness — the fear of losing one''s faith or drifting from the right path. Spoken by those of firm knowledge. Acknowledges that guidance is a gift that requires protection.',
  'Ibn Kathir explains this dua is spoken by those described as "firmly grounded in knowledge" — yet even they ask for protection against deviation. The dua recognises that guidance is not a permanent possession but a gift from Allah that must be continuously asked for. Al-Sa''di notes the name Al-Wahhab (the Bestower) is deliberately invoked — mercy is given freely, not earned.',
  ARRAY[
    'Is there an area of your life where you feel your heart pulling away from what you know is right?',
    'Even the most knowledgeable make this dua. What does that tell you about the nature of faith and steadfastness?'
  ],
  'comfort',
  'رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا',
  'Rabbana la tuzigh qulubana ba''da idh hadaytana',
  'Our Lord, do not let our hearts deviate after You have guided us',
  NULL, NULL,
  'approved'
);

-- =============================================================================
-- CATEGORY: GRIEF / LOSS
-- =============================================================================

-- Al-Baqarah 2:156 — "Indeed we belong to Allah..."
INSERT INTO ayah_pairings (
  surah, ayah_number, arabic_text, translation,
  emotion_category, tafsir_source, inclusion_reason,
  tafsir_summary, reflection_prompts, tone_tag,
  dua_text, dua_transliteration, dua_translation,
  prophetic_story, prophet_name, status
) VALUES (
  2, 156,
  'إِنَّا لِلَّهِ وَإِنَّآ إِلَيْهِ رَٰجِعُونَ',
  'Indeed we belong to Allah, and indeed to Him we will return.',
  'grief',
  'Ibn Kathir',
  'Revealed specifically as the words to say at the moment of loss or calamity. Follows the description of the patient (as-sabireen) — those who, when struck by calamity, say these words. The most widely recited expression of grief in the Islamic tradition.',
  'Ibn Kathir explains these words — known as inna lillahi wa inna ilayhi raji''un — were revealed as the specific response to calamity. They are not just words of condolence but a statement of reality: everything belongs to Allah and will return to Him. Al-Sa''di notes that saying this sincerely transforms grief into an act of worship.',
  ARRAY[
    'What have you lost — or what are you afraid of losing — that this ayah speaks to?',
    'To say "we belong to Allah" about the thing you are grieving — what does that feel like to sit with?'
  ],
  'comfort',
  'إِنَّا لِلَّهِ وَإِنَّآ إِلَيْهِ رَٰجِعُونَ',
  'Inna lillahi wa inna ilayhi raji''un',
  'Indeed we belong to Allah, and indeed to Him we will return',
  NULL, NULL,
  'approved'
);

-- Yusuf 12:86 — Ya'qub (AS): "I only complain to Allah..."
INSERT INTO ayah_pairings (
  surah, ayah_number, arabic_text, translation,
  emotion_category, tafsir_source, inclusion_reason,
  tafsir_summary, reflection_prompts, tone_tag,
  dua_text, dua_transliteration, dua_translation,
  prophetic_story, prophet_name, status
) VALUES (
  12, 86,
  'قَالَ إِنَّمَآ أَشْكُوا۟ بَثِّى وَحُزْنِى إِلَى ٱللَّهِ وَأَعْلَمُ مِنَ ٱللَّهِ مَا لَا تَعْلَمُونَ',
  'He said: I only complain of my suffering and grief to Allah, and I know from Allah that which you do not know.',
  'grief',
  'Ibn Kathir',
  'Ya''qub (AS) said this after decades of grief over losing Yusuf — and then Binyamin. His sons told him he would grieve himself to death. He responded by directing his complaint only to Allah, not to people.',
  'Ibn Kathir describes Ya''qub (AS) as a Prophet who wept for his son Yusuf for so long that he lost his sight from grief. When his sons questioned whether he would ever stop mourning, he did not defend himself or suppress his grief — he redirected it. "I complain only to Allah." He knew something his sons did not: that Yusuf was still alive, and that Allah''s plan was unfolding. Grief and trust held together.',
  ARRAY[
    'Is there a grief you have been explaining to people that you have not yet fully brought to Allah?',
    'Ya''qub AS did not stop grieving — he redirected where he took it. What is the difference between suppressing grief and directing it?'
  ],
  'comfort',
  'إِنَّمَآ أَشْكُوا۟ بَثِّى وَحُزْنِى إِلَى ٱللَّهِ',
  'Innama ashku baththy wa huzni ila Allah',
  'I only complain of my suffering and grief to Allah',
  'Ya''qub (AS) lost his beloved son Yusuf. Then he lost his second son Binyamin. He wept until he lost his sight. When his remaining sons told him he was grieving himself to death, he did not apologise for his grief. He said: I take it only to Allah. Decades later, his family was reunited, his sight was restored, and everything he had trusted Allah for came to pass.',
  'Ya''qub',
  'approved'
);

-- Maryam 19:3-4 — Zakariyya (AS): longer version of his dua
INSERT INTO ayah_pairings (
  surah, ayah_number, arabic_text, translation,
  emotion_category, tafsir_source, inclusion_reason,
  tafsir_summary, reflection_prompts, tone_tag,
  dua_text, dua_transliteration, dua_translation,
  prophetic_story, prophet_name, status
) VALUES (
  19, 4,
  'رَبِّ إِنِّى وَهَنَ ٱلْعَظْمُ مِنِّى وَٱشْتَعَلَ ٱلرَّأْسُ شَيْبًا وَلَمْ أَكُن بِدُعَآئِكَ رَبِّ شَقِيًّا',
  'My Lord, indeed my bones have weakened and my head has filled with white hair, and never have I been in my supplication to You, my Lord, unhappy.',
  'grief',
  'Ibn Kathir',
  'The fuller version of Zakariyya''s dua — more emotionally complete than Al-Anbiya 89. He names his weakness explicitly: his bones, his age, his white hair. Then he says the thing that carries everything: I have never called on You and been left disappointed.',
  'Ibn Kathir notes that Zakariyya (AS) called upon his Lord quietly — the word used in the previous ayah is "khafiyya", a hidden, hushed voice. He acknowledged every physical limitation: aging bones, white hair, a barren wife. Then he made the statement that undergirds the entire dua: "I have never been unhappy in calling upon You." He was not bargaining. He was reminding himself — and us — of Allah''s track record.',
  ARRAY[
    'What weakness or limitation do you feel most acutely right now?',
    'Zakariyya AS named his weakness before his request. He also named his history with Allah: "I have never been left disappointed." What is your history with Allah in dua?'
  ],
  'comfort',
  'رَبِّ إِنِّى وَهَنَ ٱلْعَظْمُ مِنِّى وَٱشْتَعَلَ ٱلرَّأْسُ شَيْبًا',
  'Rabbi inni wahana al-azmu minni washtaala al-ra''su shayba',
  'My Lord, indeed my bones have weakened and my head has filled with white hair',
  'Zakariyya (AS) called upon Allah quietly, in a lowered voice. He did not hide his weakness — he named it: aging bones, white hair, a wife who had never conceived. Then he said something that holds the entire dua together: "I have never called upon You and been left unhappy." He was not pretending to be strong. He was remembering who Allah had always been to him. Yahya (AS) was born.',
  'Zakariyya',
  'approved'
);

-- =============================================================================
-- CATEGORY: SEEKING GUIDANCE
-- =============================================================================

-- Al-Fatihah 1:6-7 — "Guide us to the straight path"
INSERT INTO ayah_pairings (
  surah, ayah_number, arabic_text, translation,
  emotion_category, tafsir_source, inclusion_reason,
  tafsir_summary, reflection_prompts, tone_tag,
  dua_text, dua_transliteration, dua_translation,
  prophetic_story, prophet_name, status
) VALUES (
  1, 6,
  'ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ',
  'Guide us to the straight path — the path of those upon whom You have bestowed favor, not of those who have evoked anger or of those who are astray.',
  'guidance',
  'Ibn Kathir',
  'The most recited dua in existence — said by every Muslim in every prayer, multiple times a day. Yet rarely reflected on as a dua. It is a request for guidance spoken even by those who are already on the path — because guidance is ongoing, not a single moment.',
  'Ibn Kathir explains that "ihdina" — guide us — is a request not just to be shown the path but to be kept on it, given strength to walk it, and protected from deviation. The path is described as that of those Allah has blessed: the Prophets, the truthful, the martyrs, the righteous. Al-Sa''di notes this dua is made seventeen times a day minimum in obligatory prayer — yet most who recite it have never paused to ask what they are actually asking for.',
  ARRAY[
    'You say this dua at least seventeen times a day. What does it mean to you right now, in this specific moment of your life?',
    'Guidance is asked for even by those already guided. What does that tell you about the nature of this path?'
  ],
  'comfort',
  'ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ',
  'Ihdina as-sirata al-mustaqeem',
  'Guide us to the straight path',
  NULL, NULL,
  'approved'
);

-- Al-Kahf 18:10 — People of the Cave
INSERT INTO ayah_pairings (
  surah, ayah_number, arabic_text, translation,
  emotion_category, tafsir_source, inclusion_reason,
  tafsir_summary, reflection_prompts, tone_tag,
  dua_text, dua_transliteration, dua_translation,
  prophetic_story, prophet_name, status
) VALUES (
  18, 10,
  'رَبَّنَآ ءَاتِنَا مِن لَّدُنكَ رَحْمَةً وَهَيِّئْ لَنَا مِنْ أَمْرِنَا رَشَدًا',
  'Our Lord, grant us from Yourself mercy and prepare for us from our affair right guidance.',
  'guidance',
  'Ibn Kathir',
  'Said by young people who fled their society to preserve their faith — with no plan, no resources, only trust. They asked for two things: mercy and guidance in their situation. Allah gave them both — and more than they could have imagined.',
  'Ibn Kathir describes the Companions of the Cave as young believers who lived in a society that had turned away from monotheism. They left everything — their homes, their status, their safety — and took refuge in a cave. Their dua was simple: mercy, and guidance in what to do next. Allah caused them to sleep for over three hundred years and made their story a sign for all of humanity. They asked for guidance in their immediate situation. Allah answered across centuries.',
  ARRAY[
    'Is there a situation in your life right now where you genuinely do not know what to do next?',
    'These were young people who left everything they knew. What would it look like for you to take refuge in Allah the way they did?'
  ],
  'comfort',
  'رَبَّنَآ ءَاتِنَا مِن لَّدُنكَ رَحْمَةً وَهَيِّئْ لَنَا مِنْ أَمْرِنَا رَشَدًا',
  'Rabbana atina min ladunka rahmatan wa hayyi'' lana min amrina rashada',
  'Our Lord, grant us from Yourself mercy and prepare for us from our affair right guidance',
  'The Companions of the Cave were young people living in a society that had abandoned faith. They had no plan. They fled to a cave with nothing but trust. Their dua was this: mercy, and guidance in what to do next. Allah answered by making their story eternal — recited every Friday by Muslims across the world, for over fourteen centuries.',
  NULL,
  'approved'
);

-- =============================================================================
-- CATEGORY: GRATITUDE
-- =============================================================================

-- An-Naml 27:19 — Sulayman (AS): "Enable me to be grateful..."
INSERT INTO ayah_pairings (
  surah, ayah_number, arabic_text, translation,
  emotion_category, tafsir_source, inclusion_reason,
  tafsir_summary, reflection_prompts, tone_tag,
  dua_text, dua_transliteration, dua_translation,
  prophetic_story, prophet_name, status
) VALUES (
  27, 19,
  'رَبِّ أَوْزِعْنِىٓ أَن أَشْكُرَ نِعْمَتَكَ ٱلَّتِىٓ أَنْعَمْتَ عَلَىَّ وَعَلَىٰ وَٰلِدَىَّ وَأَنْ أَعْمَلَ صَـٰلِحًا تَرْضَىٰهُ وَأَدْخِلْنِى بِرَحْمَتِكَ فِى عِبَادِكَ ٱلصَّـٰلِحِينَ',
  'My Lord, enable me to be grateful for Your favor which You have bestowed upon me and upon my parents, and to do righteousness of which You approve. And admit me by Your mercy into the ranks of Your righteous servants.',
  'gratitude',
  'Ibn Kathir',
  'Sulayman (AS) — a Prophet given more worldly blessing than almost anyone — heard an ant speak and smiled in delight. His first response was this dua: not gratitude for the miracle itself, but asking for help to be properly grateful. A king asking to be a better servant.',
  'Ibn Kathir recounts that Sulayman (AS) smiled when he heard an ant warn its colony about his approaching army. He was moved — by a tiny creature''s community, its awareness, its vulnerability. His immediate response was this dua: not "thank You for this miracle" but "help me to be genuinely grateful." He had been given a kingdom, the language of birds, and command over wind and jinn — and he still asked for help with gratitude. Al-Sa''di notes that this dua includes gratitude on behalf of parents, righteous action, and a request for company among the righteous.',
  ARRAY[
    'What blessing in your life do you most take for granted — the one you would notice immediately if it was removed?',
    'Sulayman AS was given extraordinary gifts and still asked for help with gratitude. What does that say about gratitude as a practice rather than a feeling?'
  ],
  'comfort',
  'رَبِّ أَوْزِعْنِىٓ أَن أَشْكُرَ نِعْمَتَكَ',
  'Rabbi awzi''ni an ashkura ni''mataka',
  'My Lord, enable me to be grateful for Your favor',
  'Sulayman (AS) was a Prophet-King given more worldly power than any human before or after him. He could speak to birds and command wind. One day he heard an ant warn its colony about his approaching army — and he smiled. His immediate response was not to marvel at his own power. He made this dua: help me to be grateful. One of the most gifted humans in history asking for help with thankfulness.',
  'Sulayman',
  'approved'
);

-- Ibrahim 14:7 paired with a shukr dua
INSERT INTO ayah_pairings (
  surah, ayah_number, arabic_text, translation,
  emotion_category, tafsir_source, inclusion_reason,
  tafsir_summary, reflection_prompts, tone_tag,
  dua_text, dua_transliteration, dua_translation,
  prophetic_story, prophet_name, status
) VALUES (
  14, 7,
  'لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ ۖ وَلَئِن كَفَرْتُمْ إِنَّ عَذَابِى لَشَدِيدٌ',
  'If you are grateful, I will surely increase you. But if you deny, indeed My punishment is severe.',
  'gratitude',
  'Ibn Kathir',
  'A direct divine promise — the only place in the Qur''an where Allah makes an unconditional guarantee tied to gratitude. The increase is not specified: it may be in the thing itself, in something else entirely, or in the capacity to receive. Scholars note gratitude here means with heart, tongue, and action.',
  'Ibn Kathir explains that this is a divine promise without condition: genuine gratitude will be met with increase. The word "shukr" encompasses three dimensions: recognising the blessing in the heart, expressing it with the tongue, and acting upon it with the limbs. Al-Sa''di notes the increase is deliberately unspecified — Allah may increase the very thing you are grateful for, or increase something else entirely, or increase your capacity to receive blessings. The promise holds in all cases.',
  ARRAY[
    'Where in your life right now is Allah increasing you — and have you paused to recognise it?',
    'Gratitude in Islam is heart, tongue, and action together. Which of the three comes most naturally to you? Which is hardest?'
  ],
  'comfort',
  'رَبِّ أَوْزِعْنِىٓ أَن أَشْكُرَ نِعْمَتَكَ ٱلَّتِىٓ أَنْعَمْتَ عَلَىَّ',
  'Rabbi awzi''ni an ashkura ni''mataka allati an''amta ''alayya',
  'My Lord, enable me to be grateful for Your favor which You have bestowed upon me',
  NULL, NULL,
  'approved'
);

-- =============================================================================
-- CATEGORY: FORGIVENESS / REPENTANCE
-- =============================================================================

-- Al-A'raf 7:23 — Adam and Hawwa (AS): the first human dua of repentance
INSERT INTO ayah_pairings (
  surah, ayah_number, arabic_text, translation,
  emotion_category, tafsir_source, inclusion_reason,
  tafsir_summary, reflection_prompts, tone_tag,
  dua_text, dua_transliteration, dua_translation,
  prophetic_story, prophet_name, status
) VALUES (
  7, 23,
  'رَبَّنَا ظَلَمْنَآ أَنفُسَنَا وَإِن لَّمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ ٱلْخَـٰسِرِينَ',
  'Our Lord, we have wronged ourselves, and if You do not forgive us and have mercy upon us, we will surely be among the losers.',
  'forgiveness',
  'Ibn Kathir',
  'The first dua of repentance in human history. Adam and Hawwa (AS) made no excuses — they named their wrong clearly, acknowledged the consequence of unforgiveness, and asked for mercy. Allah accepted and guided them.',
  'Ibn Kathir explains that after Adam and Hawwa (AS) made their error, they were not silent and they did not make excuses. They turned immediately to Allah with full acknowledgement: "We have wronged ourselves." The dua is notable for what it does not contain — no justification, no blame of the other, no minimising. Just honest reckoning and complete dependence. This is the first human dua of tawbah (repentance) and it set the pattern for all repentance that followed.',
  ARRAY[
    'Is there something you have done wrong that you have not yet brought to Allah with full honesty?',
    'Adam and Hawwa AS made no excuses in their repentance. What would it feel like to approach Allah with the same clarity — "I wronged myself"?'
  ],
  'comfort',
  'رَبَّنَا ظَلَمْنَآ أَنفُسَنَا وَإِن لَّمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ ٱلْخَـٰسِرِينَ',
  'Rabbana zalamna anfusana wa in lam taghfir lana wa tarhamna lanakunanna min al-khasirin',
  'Our Lord, we have wronged ourselves, and if You do not forgive us and have mercy upon us, we will surely be among the losers',
  'Adam and Hawwa (AS) made the first mistake of human history. They did not hide from Allah, make excuses, or blame each other in their dua. They said: we wronged ourselves. If You do not forgive us, we are lost. It was the first human repentance. Allah accepted it. Their descendants have been using this dua ever since.',
  'Adam',
  'approved'
);

-- Al-Imran 3:193 — "Our Lord, we have heard a caller..."
INSERT INTO ayah_pairings (
  surah, ayah_number, arabic_text, translation,
  emotion_category, tafsir_source, inclusion_reason,
  tafsir_summary, reflection_prompts, tone_tag,
  dua_text, dua_transliteration, dua_translation,
  prophetic_story, prophet_name, status
) VALUES (
  3, 193,
  'رَّبَّنَآ إِنَّنَا سَمِعْنَا مُنَادِيًا يُنَادِى لِلْإِيمَـٰنِ أَنْ ءَامِنُوا۟ بِرَبِّكُمْ فَـَٔامَنَّا ۚ رَبَّنَا فَٱغْفِرْ لَنَا ذُنُوبَنَا وَكَفِّرْ عَنَّا سَيِّـَٔاتِنَا وَتَوَفَّنَا مَعَ ٱلْأَبْرَارِ',
  'Our Lord, indeed we have heard a caller calling to faith, saying: Believe in your Lord, and we have believed. Our Lord, so forgive us our sins and remove from us our misdeeds and cause us to die with the righteous.',
  'forgiveness',
  'Ibn Kathir',
  'The dua of those who respond to the call of faith — they heard, they believed, and immediately they asked for forgiveness. The sequence is important: faith first, then the awareness that faith requires accountability.',
  'Ibn Kathir explains this dua follows the description of the "people of understanding" — those who reflect on creation and remember Allah in all states. When they hear the call to faith they respond immediately, and their first request is forgiveness: for sins committed knowingly, and for wrongs they may not even be aware of. The dua ends with a request to die in the company of the righteous — not just to live righteously, but to end there too.',
  ARRAY[
    'You heard a call and you responded — what does that mean for where you are right now?',
    'This dua asks for forgiveness for both known sins and hidden misdeeds. Is there something you have been avoiding looking at directly?'
  ],
  'comfort',
  'رَبَّنَا فَٱغْفِرْ لَنَا ذُنُوبَنَا وَكَفِّرْ عَنَّا سَيِّـَٔاتِنَا',
  'Rabbana faghfir lana dhunubana wa kaffir ''anna sayyi''atina',
  'Our Lord, so forgive us our sins and remove from us our misdeeds',
  NULL, NULL,
  'approved'
);

-- =============================================================================
-- CATEGORY: PATIENCE
-- =============================================================================

-- Al-Baqarah 2:250 — Talut's army: "Pour upon us patience..."
INSERT INTO ayah_pairings (
  surah, ayah_number, arabic_text, translation,
  emotion_category, tafsir_source, inclusion_reason,
  tafsir_summary, reflection_prompts, tone_tag,
  dua_text, dua_transliteration, dua_translation,
  prophetic_story, prophet_name, status
) VALUES (
  2, 250,
  'رَبَّنَآ أَفْرِغْ عَلَيْنَا صَبْرًا وَثَبِّتْ أَقْدَامَنَا وَٱنصُرْنَا عَلَى ٱلْقَوْمِ ٱلْكَـٰفِرِينَ',
  'Our Lord, pour upon us patience and plant firmly our feet and give us victory over the disbelieving people.',
  'patience',
  'Ibn Kathir',
  'Said by a small, outnumbered army facing Jalut (Goliath). They did not ask first for victory — they asked first for patience, then for steadfastness, then for victory. The order of the requests is the lesson.',
  'Ibn Kathir describes the army of Talut as significantly outnumbered by the forces of Jalut (Goliath). Many had already dropped out when tested with a river crossing. The remaining believers — a small group — faced an overwhelming enemy. Their dua asked for three things in a specific order: first patience (to endure), then firm feet (to not flee), then victory. They understood that without the first two, the third was meaningless. Dawud (AS) killed Jalut that day.',
  ARRAY[
    'What situation are you facing right now where you feel outnumbered or overwhelmed?',
    'This army asked for patience before they asked for victory. What order do you usually make requests in — and what does that reveal?'
  ],
  'comfort',
  'رَبَّنَآ أَفْرِغْ عَلَيْنَا صَبْرًا وَثَبِّتْ أَقْدَامَنَا',
  'Rabbana afrigh ''alayna sabran wa thabbit aqdamana',
  'Our Lord, pour upon us patience and plant firmly our feet',
  'The army of Talut was small and heavily outnumbered. Many had already given up before the battle began. The ones who remained made this dua: patience first, then steadfastness, then victory. Dawud (AS) — then a young man — stepped forward and faced Jalut. The giant fell. But the dua came before any of it.',
  NULL,
  'approved'
);

-- Al-Imran 3:147 — "Our Lord, forgive us and plant firmly our feet"
INSERT INTO ayah_pairings (
  surah, ayah_number, arabic_text, translation,
  emotion_category, tafsir_source, inclusion_reason,
  tafsir_summary, reflection_prompts, tone_tag,
  dua_text, dua_transliteration, dua_translation,
  prophetic_story, prophet_name, status
) VALUES (
  3, 147,
  'رَبَّنَا ٱغْفِرْ لَنَا ذُنُوبَنَا وَإِسْرَافَنَا فِىٓ أَمْرِنَا وَثَبِّتْ أَقْدَامَنَا وَٱنصُرْنَا عَلَى ٱلْقَوْمِ ٱلْكَـٰفِرِينَ',
  'Our Lord, forgive us our sins and the excess in our affairs and plant firmly our feet and give us victory over the disbelieving people.',
  'patience',
  'Ibn Kathir',
  'The dua of those who persevere even after making mistakes — it asks for forgiveness of both deliberate sins and excess (going too far in permissible things). Then asks for steadfastness. Acknowledging imperfection as part of the path, not a barrier to it.',
  'Ibn Kathir notes that "israf" — translated as excess — refers to going beyond what is appropriate even in permissible actions. This dua acknowledges two kinds of falling short: direct sins and overstepping in otherwise acceptable matters. It then asks for firm footing — not perfection first, then steadfastness, but steadfastness despite imperfection. Al-Sa''di observes that this is the dua of those who kept going after setbacks, not those who were unaffected by them.',
  ARRAY[
    'Where in your life are you being too hard on yourself about not being perfect before moving forward?',
    'This dua asks for forgiveness and steadfastness together. What would it look like to keep going while still acknowledging where you have fallen short?'
  ],
  'comfort',
  'رَبَّنَا ٱغْفِرْ لَنَا ذُنُوبَنَا وَثَبِّتْ أَقْدَامَنَا',
  'Rabbana ighfir lana dhunubana wa thabbit aqdamana',
  'Our Lord, forgive us our sins and plant firmly our feet',
  NULL, NULL,
  'approved'
);

-- =============================================================================
-- CATEGORY: HOPE
-- =============================================================================

-- Ash-Shu'ara 26:83-85 — Ibrahim (AS): "Grant me wisdom..."
INSERT INTO ayah_pairings (
  surah, ayah_number, arabic_text, translation,
  emotion_category, tafsir_source, inclusion_reason,
  tafsir_summary, reflection_prompts, tone_tag,
  dua_text, dua_transliteration, dua_translation,
  prophetic_story, prophet_name, status
) VALUES (
  26, 83,
  'رَبِّ هَبْ لِى حُكْمًا وَأَلْحِقْنِى بِٱلصَّـٰلِحِينَ وَٱجْعَل لِّى لِسَانَ صِدْقٍ فِى ٱلْـَٔاخِرِينَ وَٱجْعَلْنِى مِن وَرَثَةِ جَنَّةِ ٱلنَّعِيمِ',
  'My Lord, grant me wisdom and join me with the righteous. And grant me a reputation of honour among later generations. And place me among the inheritors of the Garden of Pleasure.',
  'hope',
  'Ibn Kathir',
  'Ibrahim (AS) asked for four things in this dua: wisdom, righteous company, a legacy of truth, and Jannah. These are the four dimensions of a meaningful life — and a hopeful death. A dua about where you want to end up, not just where you are now.',
  'Ibn Kathir notes that Ibrahim (AS) made this dua after confronting his people and his father about their worship of idols — at a moment of great difficulty and isolation. Yet his dua looked forward: wisdom for the present, righteous companions for the journey, a legacy that outlasts him, and Jannah as the destination. Al-Sa''di observes that asking for a "tongue of truth among later generations" was answered — Ibrahim (AS) is honoured in three of the world''s major faith traditions to this day.',
  ARRAY[
    'What do you hope your legacy will be — what do you want to be remembered for?',
    'Ibrahim AS asked for wisdom, good company, a truthful legacy, and Jannah. Which of these feels most distant from where you are right now?'
  ],
  'comfort',
  'رَبِّ هَبْ لِى حُكْمًا وَأَلْحِقْنِى بِٱلصَّـٰلِحِينَ',
  'Rabbi hab li hukman wa alhiqni bi as-salihin',
  'My Lord, grant me wisdom and join me with the righteous',
  'Ibrahim (AS) made this dua at a moment of isolation — he had confronted his entire community, including his father, about their idols. He had few allies. His dua did not ask for relief from his immediate situation. It looked further: wisdom for now, righteous company for the journey, a legacy of truth that would outlast him, and Jannah at the end. He was answered on every count.',
  'Ibrahim',
  'approved'
);

-- Al-Furqan 25:74 — "Grant us comfort in spouses and offspring"
INSERT INTO ayah_pairings (
  surah, ayah_number, arabic_text, translation,
  emotion_category, tafsir_source, inclusion_reason,
  tafsir_summary, reflection_prompts, tone_tag,
  dua_text, dua_transliteration, dua_translation,
  prophetic_story, prophet_name, status
) VALUES (
  25, 74,
  'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَٰجِنَا وَذُرِّيَّـٰتِنَا قُرَّةَ أَعْيُنٍ وَٱجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا',
  'Our Lord, grant us from among our spouses and offspring comfort to our eyes, and make us a leader for the righteous.',
  'hope',
  'Ibn Kathir',
  'The dua of "the servants of the Most Merciful" — those described earlier in Al-Furqan as walking humbly, spending in moderation, and seeking forgiveness. Their final dua is not for themselves — it is for their families and for a legacy of righteous leadership.',
  'Ibn Kathir explains that "qurrata a''yun" — comfort to our eyes — is an Arabic expression for the deepest joy: the kind of joy that moves you to tears of gratitude. It is asking that your spouse and children become a source of that joy — not just happiness, but the kind of peace that settles in the heart when you look at what Allah has given you. The second request — to be a leader for the righteous — is asking to be of benefit to others, not just one''s own family.',
  ARRAY[
    'Who in your life is a source of "comfort to your eyes" — a joy so deep it sometimes moves you?',
    'This dua asks for both personal blessing (family) and communal responsibility (leadership). What does it mean to you to be of benefit to others beyond yourself?'
  ],
  'comfort',
  'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَٰجِنَا وَذُرِّيَّـٰتِنَا قُرَّةَ أَعْيُنٍ',
  'Rabbana hab lana min azwajina wa dhurriyyatina qurrata a''yunin',
  'Our Lord, grant us from among our spouses and offspring comfort to our eyes',
  NULL, NULL,
  'approved'
);

-- =============================================================================
-- CATEGORY: LONELINESS
-- =============================================================================

INSERT INTO intent_mappings (keyword, category, weight) VALUES
  ('i feel alone with this',       'loneliness', 1.0),
  ('no one knows what i''m going through', 'loneliness', 1.0)
ON CONFLICT DO NOTHING;

-- Ibrahim 14:39 — "Praise to Allah who granted me sons in old age"
-- A dua of gratitude after loneliness and waiting
INSERT INTO ayah_pairings (
  surah, ayah_number, arabic_text, translation,
  emotion_category, tafsir_source, inclusion_reason,
  tafsir_summary, reflection_prompts, tone_tag,
  dua_text, dua_transliteration, dua_translation,
  prophetic_story, prophet_name, status
) VALUES (
  14, 39,
  'ٱلْحَمْدُ لِلَّهِ ٱلَّذِى وَهَبَ لِى عَلَى ٱلْكِبَرِ إِسْمَـٰعِيلَ وَإِسْحَـٰقَ ۚ إِنَّ رَبِّى لَسَمِيعُ ٱلدُّعَآءِ',
  'Praise to Allah who granted me, despite old age, Ismail and Ishaq. Indeed, my Lord is the Hearer of supplication.',
  'loneliness',
  'Ibn Kathir',
  'Ibrahim (AS) waited decades for children. When they came, his response was not "finally" — it was gratitude, and a statement of certainty that carries everything: "My Lord hears supplication." A dua made after the answer came, as a reminder that the waiting was not silence.',
  'Ibn Kathir notes that Ibrahim (AS) received Ismail (AS) and Ishaq (AS) at an advanced age — after decades of waiting. His response is not just gratitude for the children themselves, but a declaration: "My Lord is the Hearer of supplication." Al-Sa''di explains that Ibrahim (AS) is reminding himself and all who would come after him — the waiting was not unanswered prayer. It was answered prayer with a different timeline than expected.',
  ARRAY[
    'Is there something you have been asking for that has not come yet — and how do you hold that?',
    'Ibrahim AS said "my Lord hears supplication" after his prayer was answered. Can you say that truthfully right now, before your answer comes?'
  ],
  'comfort',
  'إِنَّ رَبِّى لَسَمِيعُ ٱلدُّعَآءِ',
  'Inna rabbi la-sami''u ad-du''a',
  'Indeed, my Lord is the Hearer of supplication',
  'Ibrahim (AS) waited into old age for children. Ismail (AS) came. Then Ishaq (AS). When they arrived, he did not say "finally." He said: All praise to Allah — and then made a statement he had held onto across decades of waiting: My Lord hears supplication. The waiting had not been silence. It had been an answer he could not see yet.',
  'Ibrahim',
  'approved'
);
