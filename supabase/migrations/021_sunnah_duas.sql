-- Duas from the Sunnah for the app's feelings: from Hisn al-Muslim (Fortress of the Muslim), plus four
-- prophetic duas that Ibn al-Qayyim cites in al-Jawab al-Kafi ("Spiritual Disease and Its Cure").
--
-- Each dua's Arabic is taken word for word from the hadith it is cited to (the open hadith-api
-- dataset, sunnah.com's text), and every reference was checked on sunnah.com. Transliteration and
-- English follow Hisn al-Muslim, corrected where it differs from the hadith's wording; for the al-Jawab
-- al-Kafi duas they are our own (the book's English translation is not used). In "Ya Dhal-Jalali
-- wal-Ikram" the hadith's "bi-" prefix (part of the command "persist with") is left off. Gradings for
-- collections other than al-Bukhari and Muslim are al-Albani's, with any dissenting grading noted.
-- Three duas come from collections not in the dataset (Musnad Ahmad, Ibn Hibban, al-Hakim) and have no
-- sunnah.com link: Hisn al-Muslim no. 120 is cited to Musnad Ahmad 1/391 (as both books cite it); the
-- other two are left for the reviewer to confirm.
--
-- All rows are 'pending': nothing appears in the app until it is approved on the review screen.
-- Safe to re-run: existing rows are skipped.

CREATE TABLE IF NOT EXISTS public.sunnah_duas (
  id TEXT PRIMARY KEY CHECK (id ~ '^([0-9]{1,3}[a-z]?|jk[0-9]{1,2})$'),
  situation TEXT NOT NULL CHECK (situation ~ '^[a-z-]{1,40}$'),
  sort INTEGER NOT NULL DEFAULT 0,
  feelings TEXT[] NOT NULL DEFAULT '{}' CHECK (feelings <@ ARRAY['anxiety', 'sadness', 'gratitude', 'guidance', 'patience', 'guilt', 'grief', 'hope', 'forgiveness', 'loneliness', 'anger']::text[]),
  arabic TEXT NOT NULL,
  transliteration TEXT,
  translation TEXT NOT NULL,
  repeat INTEGER NOT NULL DEFAULT 1 CHECK (repeat BETWEEN 1 AND 100),
  note TEXT,
  source TEXT,
  source_url TEXT CHECK (source_url IS NULL OR source_url LIKE 'https://sunnah.com/%'),
  grade TEXT,
  book TEXT NOT NULL DEFAULT 'Hisn al-Muslim',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewer_notes TEXT,
  reviewed_by UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.sunnah_duas ENABLE ROW LEVEL SECURITY;

-- Everyone may read approved duas; admins may read all and review them. The Arabic is not editable.
REVOKE INSERT, UPDATE, DELETE ON public.sunnah_duas FROM anon, authenticated;
GRANT SELECT ON public.sunnah_duas TO anon, authenticated;
GRANT UPDATE (status, reviewer_notes, reviewed_by, reviewed_at, source, source_url, grade, transliteration, translation, note)
  ON public.sunnah_duas TO authenticated;

DROP POLICY IF EXISTS "Anyone reads approved sunnah duas" ON public.sunnah_duas;
CREATE POLICY "Anyone reads approved sunnah duas"
  ON public.sunnah_duas FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');

DROP POLICY IF EXISTS "Admins read all sunnah duas" ON public.sunnah_duas;
CREATE POLICY "Admins read all sunnah duas"
  ON public.sunnah_duas FOR SELECT
  TO authenticated
  USING ((SELECT public.is_admin()));

DROP POLICY IF EXISTS "Admins review sunnah duas" ON public.sunnah_duas;
CREATE POLICY "Admins review sunnah duas"
  ON public.sunnah_duas FOR UPDATE
  TO authenticated
  USING ((SELECT public.is_admin()))
  WITH CHECK ((SELECT public.is_admin()));

-- Saves can point at these duas too: 'sunnah:<id>' (see 019).
ALTER TABLE public.saved_items DROP CONSTRAINT IF EXISTS saved_items_content_key_format;
ALTER TABLE public.saved_items ADD CONSTRAINT saved_items_content_key_format CHECK (
  content_key ~ '^(pairing:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|ayah:[1-9][0-9]{0,2}:[1-9][0-9]{0,2}|adhkar:[a-z0-9-]{1,40}|name:[1-9][0-9]?|story:[a-z0-9-]{1,60}:[0-9]{1,2}|sunnah:([0-9]{1,3}[a-z]?|jk[0-9]{1,2}))$'
);

INSERT INTO public.sunnah_duas (
  id, situation, sort, feelings, arabic, transliteration, translation, repeat, note, source, source_url, grade, book
)
VALUES
  -- worry · Hisn al-Muslim 120 · Musnad Ahmad 1/391
  (
    '120',
    'worry',
    0,
    ARRAY['anxiety', 'sadness']::text[],
    'اللَّهُمَّ إِنِّي عَبْدُكَ، ابْنُ عَبْدِكَ، ابْنُ أَمَتِكَ، نَاصِيَتِي بِيَدِكَ، مَاضٍ فِيَّ حُكْمُكَ، عَدْلٌ فِيَّ قَضَاؤُكَ، أَسْأَلُكَ بِكُــــلِّ اسْمٍ هُوَ لَكَ، سَمَّيْتَ بِهِ نَفْسَكَ، أَوْ أَنْزَلْتَهُ فِي كِتَابِكَ، أَوْ عَلَّمْتَهُ أَحَداً مِنْ خَلْقِكَ، أَوِ اسْتَأْثَرْتَ بِهِ فِي عِلْمِ الغَيْبِ عِنْدَكَ، أَنْ تَجْعَلَ القُرْآنَ رَبِيعَ قَلْبِي، وَنُورَ صَدْرِي، وَجَلاَءَ حُزْنِي، وَذَهَابَ هَمِّي',
    'Allahumma innee ''abduk, ibnu ''abdik, ibnu amatik, nasiyatee biyadik, madin fiyya hukmuk, ''adlun fiyya qada''uk, as''aluka bikulli ismin huwa lak, sammayta bihi nafsak, aw anzaltahu fee kitabik, aw ''allamtahu ahadan min khalqik, awista''tharta bihi fee ''ilmil-ghaybi ''indak, an taj''alal-Qur''ana rabee''a qalbee, wanoora sadree, wajalaa''a huznee, wathahaba hammee.',
    'O Allah, I am Your servant, son of Your servant, son of Your maidservant. My forelock is in Your hand, Your command over me is forever executed and Your decree over me is just. I ask You by every name belonging to You which You named Yourself with, or revealed in Your Book, or taught to any of Your creation, or have kept in the knowledge of the unseen with You, that You make the Quran the life of my heart and the light of my breast, a departure for my sorrow and a release for my anxiety.',
    1,
    NULL,
    'Musnad Ahmad 1/391',
    NULL,
    NULL,
    'Hisn al-Muslim'
  ),
  -- worry · Hisn al-Muslim 121 · Sahih al-Bukhari 6363
  (
    '121',
    'worry',
    1,
    ARRAY['anxiety', 'sadness']::text[],
    'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ، وَغَلَبَةِ الرِّجَالِ',
    'Allahumma innee a''oothu bika minal-hammi walhuzn, wal''ajzi walkasali walbukhli waljubn, wadal''id-dayni waghalabatir-rijal.',
    'O Allah, I take refuge in You from anxiety and sorrow, weakness and laziness, miserliness and cowardice, the burden of debts and from being overpowered by men.',
    1,
    'The Prophet ﷺ was often heard saying this.',
    'Sahih al-Bukhari 6363',
    'https://sunnah.com/bukhari:6363',
    NULL,
    'Hisn al-Muslim'
  ),
  -- distress · Hisn al-Muslim 122 · Sahih al-Bukhari 6346
  (
    '122',
    'distress',
    100,
    ARRAY['anxiety', 'sadness']::text[],
    'لاَ إِلَهَ إِلاَّ اللَّهُ الْعَظِيمُ الْحَلِيمُ، لاَ إِلَهَ إِلاَّ اللَّهُ رَبُّ الْعَرْشِ الْعَظِيمِ، لاَ إِلَهَ إِلاَّ اللَّهُ رَبُّ السَّمَوَاتِ، وَرَبُّ الأَرْضِ، وَرَبُّ الْعَرْشِ الْكَرِيمِ',
    'La ilaha illal-lahul-''atheemul-haleem, la ilaha illal-lahu rabbul-''arshil-''atheem, la ilaha illal-lahu rabbus-samawati warabbul-ardi warabbul-''arshil-kareem.',
    'None has the right to be worshipped except Allah, the Magnificent, the Forbearing. None has the right to be worshipped except Allah, Lord of the magnificent throne. None has the right to be worshipped except Allah, Lord of the heavens, Lord of the earth and Lord of the noble throne.',
    1,
    'The Prophet ﷺ used to say this in times of distress.',
    'Sahih al-Bukhari 6346',
    'https://sunnah.com/bukhari:6346',
    NULL,
    'Hisn al-Muslim'
  ),
  -- distress · Hisn al-Muslim 123 · Sunan Abi Dawud 5090
  (
    '123',
    'distress',
    101,
    ARRAY['anxiety', 'loneliness', 'hope']::text[],
    'اللَّهُمَّ رَحْمَتَكَ أَرْجُو فَلاَ تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ وَأَصْلِحْ لِي شَأْنِي كُلَّهُ لاَ إِلَهَ إِلاَّ أَنْتَ',
    'Allahumma rahmataka arjoo fala takilnee ila nafsee tarfata ''ayn, wa-aslih lee sha''nee kullah, la ilaha illa ant.',
    'O Allah, it is Your mercy that I hope for, so do not leave me in charge of my affairs even for a blink of an eye and rectify for me all of my affairs. None has the right to be worshipped except You.',
    1,
    'Taught as the supplication of someone in distress.',
    'Sunan Abi Dawud 5090',
    'https://sunnah.com/abudawud:5090',
    'Hasan chain (al-Albani); weak according to Zubair Ali Zai',
    'Hisn al-Muslim'
  ),
  -- distress · Hisn al-Muslim 124 · Jami' at-Tirmidhi 3505
  (
    '124',
    'distress',
    102,
    ARRAY['sadness', 'guilt']::text[],
    'لاَ إِلَهَ إِلاَّ أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ',
    'La ilaha illa anta subhanaka innee kuntu minath-thalimeen.',
    'None has the right to be worshipped except You. How perfect You are, verily I was among the wrong-doers.',
    1,
    'The dua of Yunus in the belly of the whale. The Prophet ﷺ said Allah answers any Muslim who calls on Him with it.',
    'Jami'' at-Tirmidhi 3505',
    'https://sunnah.com/tirmidhi:3505',
    'Sahih (al-Albani)',
    'Hisn al-Muslim'
  ),
  -- distress · Hisn al-Muslim 125 · Sunan Abi Dawud 1525
  (
    '125',
    'distress',
    103,
    ARRAY['anxiety']::text[],
    'اللَّهُ اللَّهُ رَبِّي لاَ أُشْرِكُ بِهِ شَيْئًا',
    'Allahu Allahu rabbee la ushriku bihi shay''a.',
    'Allah, Allah is my Lord, I do not associate anything with Him.',
    1,
    'Taught to Asma'' bint Umays to say in times of distress.',
    'Sunan Abi Dawud 1525',
    'https://sunnah.com/abudawud:1525',
    'Sahih (al-Albani)',
    'Hisn al-Muslim'
  ),
  -- fear · Hisn al-Muslim 245 · Sahih al-Bukhari 3346
  (
    '245',
    'fear',
    200,
    ARRAY['anxiety']::text[],
    'لاَ إِلَهَ إِلاَّ اللَّهُ',
    'La ilaha illal-lah.',
    'None has the right to be worshipped except Allah.',
    1,
    'The Prophet ﷺ said this when he came in frightened.',
    'Sahih al-Bukhari 3346',
    'https://sunnah.com/bukhari:3346',
    NULL,
    'Hisn al-Muslim'
  ),
  -- fear · Hisn al-Muslim 113 · Jami' at-Tirmidhi 3528
  (
    '113',
    'fear',
    201,
    ARRAY['anxiety', 'loneliness']::text[],
    'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّةِ مِنْ غَضَبِهِ وَعِقَابِهِ وَشَرِّ عِبَادِهِ وَمِنْ هَمَزَاتِ الشَّيَاطِينِ وَأَنْ يَحْضُرُونِ',
    'A''oothu bikalimatil-lahit-tammati min ghadabihi wa''iqabih, washarri ''ibadih, wamin hamazatish-shayateeni wa-an yahduroon.',
    'I take refuge in the perfect words of Allah from His anger and His punishment, and from the evil of His servants, and from the incitements of the devils and lest they be present with me.',
    1,
    'For when you are frightened in your sleep.',
    'Jami'' at-Tirmidhi 3528',
    'https://sunnah.com/tirmidhi:3528',
    'Hasan (al-Albani); weak according to Zubair Ali Zai',
    'Hisn al-Muslim'
  ),
  -- fear · Hisn al-Muslim 132 · Sahih Muslim 3005
  (
    '132',
    'fear',
    202,
    ARRAY['anxiety']::text[],
    'اللَّهُمَّ اكْفِنِيهِمْ بِمَا شِئْتَ',
    'Allahummak-fineehim bima shi''ta.',
    'O Allah, protect me from them with what You choose.',
    1,
    'The dua of the believing young man in the story of the king, when he was taken away to be killed.',
    'Sahih Muslim 3005',
    'https://sunnah.com/muslim:3005',
    NULL,
    'Hisn al-Muslim'
  ),
  -- fear · Hisn al-Muslim 126 · Sunan Abi Dawud 1537
  (
    '126',
    'fear',
    203,
    ARRAY['anxiety']::text[],
    'اللَّهُمَّ إِنَّا نَجْعَلُكَ فِي نُحُورِهِمْ وَنَعُوذُ بِكَ مِنْ شُرُورِهِمْ',
    'Allahumma inna naj''aluka fee nuhoorihim wana''oothu bika min shuroorihim.',
    'O Allah, we place You before them and we take refuge in You from their evil.',
    1,
    'The Prophet ﷺ said this when he feared a group of people.',
    'Sunan Abi Dawud 1537',
    'https://sunnah.com/abudawud:1537',
    'Sahih (al-Albani); weak according to Zubair Ali Zai',
    'Hisn al-Muslim'
  ),
  -- fear · Hisn al-Muslim 128 · Sahih al-Bukhari 4563
  (
    '128',
    'fear',
    204,
    ARRAY['anxiety']::text[],
    'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ',
    'Hasbunal-lahu wani''mal-wakeel.',
    'Allah is sufficient for us, and how fine a trustee (He is).',
    1,
    'Said by Ibrahim when he was thrown into the fire, and by the Prophet ﷺ when told an army had gathered against him.',
    'Sahih al-Bukhari 4563',
    'https://sunnah.com/bukhari:4563',
    NULL,
    'Hisn al-Muslim'
  ),
  -- hardship · Hisn al-Muslim 139 · reference to confirm
  (
    '139',
    'hardship',
    300,
    ARRAY['patience', 'hope']::text[],
    'اللَّهُمَّ لاَ سَهْلَ إِلاَّ مَا جَعَلْتَهُ سَهْلاً، وَأَنْتَ تَجْعَلُ الْحَزْنَ إِذَا شِئْتَ سَهْلاً',
    'Allahumma la sahla illa ma ja''altahu sahla, wa-anta taj''alul-hazna in shi''ta sahla.',
    'O Allah, there is no ease except in that which You have made easy, and You make the difficulty, if You wish, easy.',
    1,
    NULL,
    NULL,
    NULL,
    NULL,
    'Hisn al-Muslim'
  ),
  -- hardship · Hisn al-Muslim 144 · Sahih Muslim 2664
  (
    '144',
    'hardship',
    301,
    ARRAY['patience', 'sadness']::text[],
    'قَدَرُ اللَّهِ وَمَا شَاءَ فَعَلَ',
    'Qadarullahi wa ma sha''a fa''al.',
    'It is the decree of Allah, and He does what He wills.',
    1,
    'Say this when something goes wrong, instead of ''if only I had…'': the hadith says ''if'' opens the door to the work of Satan.',
    'Sahih Muslim 2664',
    'https://sunnah.com/muslim:2664',
    NULL,
    'Hisn al-Muslim'
  ),
  -- hardship · Hisn al-Muslim 218 · Sunan Ibn Majah 3803
  (
    '218b',
    'hardship',
    302,
    ARRAY['patience']::text[],
    'الْحَمْدُ لِلَّهِ عَلَى كُلِّ حَالٍ',
    'Alhamdu lillahi ''ala kulli hal.',
    'Praise is to Allah in all circumstances.',
    1,
    'What the Prophet ﷺ said when he saw something he disliked.',
    'Sunan Ibn Majah 3803',
    'https://sunnah.com/ibnmajah:3803',
    'Hasan (al-Albani); weak according to Zubair Ali Zai',
    'Hisn al-Muslim'
  ),
  -- debt · Hisn al-Muslim 136 · Jami' at-Tirmidhi 3563
  (
    '136',
    'debt',
    400,
    ARRAY['anxiety']::text[],
    'اللَّهُمَّ اكْفِنِي بِحَلاَلِكَ عَنْ حَرَامِكَ وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ',
    'Allahummak-finee bihalalika ''an haramik, wa-aghninee bifadlika ''amman siwak.',
    'O Allah, make what is lawful enough for me, as opposed to what is unlawful, and spare me by Your grace, of need of others.',
    1,
    'Taught for someone struggling with debt.',
    'Jami'' at-Tirmidhi 3563',
    'https://sunnah.com/tirmidhi:3563',
    'Hasan (al-Albani)',
    'Hisn al-Muslim'
  ),
  -- illness · Hisn al-Muslim 243 · Sahih Muslim 2202
  (
    '243',
    'illness',
    500,
    ARRAY['patience']::text[],
    'أَعُوذُ بِاللَّهِ وَقُدْرَتِهِ مِنْ شَرِّ مَا أَجِدُ وَأُحَاذِرُ',
    'A''oothu billahi waqudratihi min sharri ma ajidu wa-uhathir.',
    'I take refuge in Allah and His power from the evil of what I feel and what I fear.',
    7,
    'Place your hand where it hurts, say bismillah three times, then say this seven times.',
    'Sahih Muslim 2202',
    'https://sunnah.com/muslim:2202',
    NULL,
    'Hisn al-Muslim'
  ),
  -- illness · Hisn al-Muslim 147 · Sahih al-Bukhari 5656
  (
    '147',
    'illness',
    501,
    ARRAY['patience', 'hope']::text[],
    'لاَ بَأْسَ طَهُورٌ إِنْ شَاءَ اللَّهُ',
    'La ba''sa, tahoorun in sha'' Allah.',
    'Never mind, may it (the sickness) be a purification, if Allah wills.',
    1,
    'What the Prophet ﷺ said when he visited someone who was ill.',
    'Sahih al-Bukhari 5656',
    'https://sunnah.com/bukhari:5656',
    NULL,
    'Hisn al-Muslim'
  ),
  -- illness · Hisn al-Muslim 148 · Sunan Abi Dawud 3106
  (
    '148',
    'illness',
    502,
    ARRAY['hope']::text[],
    'أَسْأَلُ اللَّهَ الْعَظِيمَ رَبَّ الْعَرْشِ الْعَظِيمِ أَنْ يَشْفِيَكَ',
    'As''alul-lahal-''Atheem, rabbal-''arshil-''atheem, an yashfiyak.',
    'I ask Allah the Magnificent, Lord of the magnificent throne, to cure you.',
    7,
    'Said seven times when visiting someone who is ill.',
    'Sunan Abi Dawud 3106',
    'https://sunnah.com/abudawud:3106',
    'Sahih (al-Albani)',
    'Hisn al-Muslim'
  ),
  -- loss · Hisn al-Muslim 154 · Sahih Muslim 918
  (
    '154',
    'loss',
    600,
    ARRAY['grief', 'sadness']::text[],
    'إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ اللَّهُمَّ أْجُرْنِي فِي مُصِيبَتِي وَأَخْلِفْ لِي خَيْرًا مِنْهَا',
    'Inna lillahi wa-inna ilayhi raji''oon. Allahumma''-jurnee fee museebatee, wakhluf lee khayran minha.',
    'To Allah we belong and to Him we will return. O Allah, reward me for my affliction and replace it for me with something better.',
    1,
    'The Prophet ﷺ said Allah gives something better to whoever says this when a calamity strikes.',
    'Sahih Muslim 918',
    'https://sunnah.com/muslim:918a',
    NULL,
    'Hisn al-Muslim'
  ),
  -- loss · Hisn al-Muslim 162 · Sahih al-Bukhari 1284
  (
    '162',
    'loss',
    601,
    ARRAY['grief']::text[],
    'إِنَّ لِلَّهِ مَا أَخَذَ وَلَهُ مَا أَعْطَى وَكُلٌّ عِنْدَهُ بِأَجَلٍ مُسَمًّى، فَلْتَصْبِرْ وَلْتَحْتَسِبْ',
    'Inna lillahi ma akhath, walahu ma a''ta, wakullun ''indahu bi-ajalin musamma, faltasbir waltahtasib.',
    'To Allah belongs what He took, and to Him belongs what He gave, and everything has an appointed term with Him; so let her be patient and hope for Allah''s reward.',
    1,
    'The Prophet ﷺ sent these words to his daughter when her child was dying. Say them to comfort someone who is bereaved; the last words change to suit who you''re speaking to.',
    'Sahih al-Bukhari 1284',
    'https://sunnah.com/bukhari:1284',
    NULL,
    'Hisn al-Muslim'
  ),
  -- deceased · Hisn al-Muslim 156 · Sahih Muslim 963
  (
    '156',
    'deceased',
    700,
    ARRAY['grief']::text[],
    'اللَّهُمَّ اغْفِرْ لَهُ وَارْحَمْهُ وَعَافِهِ وَاعْفُ عَنْهُ وَأَكْرِمْ نُزُلَهُ وَوَسِّعْ مُدْخَلَهُ وَاغْسِلْهُ بِالْمَاءِ وَالثَّلْجِ وَالْبَرَدِ وَنَقِّهِ مِنَ الْخَطَايَا كَمَا نَقَّيْتَ الثَّوْبَ الأَبْيَضَ مِنَ الدَّنَسِ وَأَبْدِلْهُ دَارًا خَيْرًا مِنْ دَارِهِ وَأَهْلاً خَيْرًا مِنْ أَهْلِهِ وَزَوْجًا خَيْرًا مِنْ زَوْجِهِ وَأَدْخِلْهُ الْجَنَّةَ وَأَعِذْهُ مِنْ عَذَابِ الْقَبْرِ',
    'Allahummagh-fir lahu warhamh, wa''afihi, wa''fu ''anh, wa-akrim nuzulah, wawassi'' mudkhalah, waghsilhu bilma''i waththalji walbarad, wanaqqihi minal-khataya kama naqqaytath-thawbal-abyada minad-danas, wa-abdilhu daran khayran min darih, wa-ahlan khayran min ahlih, wazawjan khayran min zawjih, wa-adkhilhul-jannah, wa-a''ithhu min ''athabil-qabr.',
    'O Allah, forgive him and have mercy on him, keep him safe and pardon him, honour his reception and widen his entry. Wash him with water, snow and hail, and cleanse him of sins as a white garment is cleansed of dirt. Give him a home better than his home, a family better than his family and a spouse better than his spouse. Admit him into the Garden and protect him from the punishment of the grave.',
    1,
    'From the funeral prayer. For a woman, the Arabic pronouns change to -ha.',
    'Sahih Muslim 963',
    'https://sunnah.com/muslim:963a',
    NULL,
    'Hisn al-Muslim'
  ),
  -- deceased · Hisn al-Muslim 157 · Sunan Ibn Majah 1498
  (
    '157',
    'deceased',
    701,
    ARRAY['grief']::text[],
    'اللَّهُمَّ اغْفِرْ لِحَيِّنَا وَمَيِّتِنَا وَشَاهِدِنَا وَغَائِبِنَا وَصَغِيرِنَا وَكَبِيرِنَا وَذَكَرِنَا وَأُنْثَانَا اللَّهُمَّ مَنْ أَحْيَيْتَهُ مِنَّا فَأَحْيِهِ عَلَى الإِسْلاَمِ وَمَنْ تَوَفَّيْتَهُ مِنَّا فَتَوَفَّهُ عَلَى الإِيمَانِ اللَّهُمَّ لاَ تَحْرِمْنَا أَجْرَهُ وَلاَ تُضِلَّنَا بَعْدَهُ',
    'Allahummagh-fir lihayyina wamayyitina washahidina, wagha-ibina, wasagheerina wakabeerina, wathakarina wa-onthana. Allahumma man ahyaytahu minna fa-ahyihi ''alal-islam, waman tawaffaytahu minna fatawaffahu ''alal-eeman, allahumma la tahrimna ajrah, wala tudillana ba''dah.',
    'O Allah, forgive our living and our dead, those present and those absent, our young and our old, our males and our females. O Allah, whom amongst us You keep alive, then let such a life be upon Islam, and whom amongst us You take unto Yourself, then let such a death be upon faith. O Allah, do not deprive us of his reward and do not let us stray after him.',
    1,
    'From the funeral prayer.',
    'Sunan Ibn Majah 1498',
    'https://sunnah.com/ibnmajah:1498',
    'Sahih (al-Albani)',
    'Hisn al-Muslim'
  ),
  -- deceased · Hisn al-Muslim 159 · reference to confirm
  (
    '159',
    'deceased',
    702,
    ARRAY['grief']::text[],
    'اللَّهُمَّ عَبْدُكَ وَابْنُ أَمَتِكَ احْتَاجَ إِلَى رَحْمَتِكَ، وَأَنْتَ غَنِيٌّ عَنْ عَذَابِهِ، إِنْ كَانَ مُحْسِناً فَزِدْ فِي حَسَنَاتِهِ، وَإِنْ كَانَ مُسِيئاً فَتَجَاوَزْ عَنْهُ',
    'Allahumma ''abduka wabnu amatik, ihtaja ila rahmatik, wa-anta ghaniyyun ''an ''athabih, in kana muhsinan fazid fee hasanatih, wa-in kana museean fatajawaz ''anh.',
    'O Allah, Your servant and the son of Your maidservant is in need of Your mercy and You are without need of his punishment. If he was righteous then increase his reward and if he was wicked then look over his sins.',
    1,
    'From the funeral prayer.',
    NULL,
    NULL,
    NULL,
    'Hisn al-Muslim'
  ),
  -- forgiveness · Hisn al-Muslim 250 · Jami' at-Tirmidhi 3577
  (
    '250',
    'forgiveness',
    800,
    ARRAY['guilt', 'forgiveness']::text[],
    'أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لاَ إِلَهَ إِلاَّ هُوَ الْحَىَّ الْقَيُّومَ وَأَتُوبُ إِلَيْهِ',
    'Astaghfirul-lahal-''Atheemal-lathee la ilaha illa huwal-Hayyal-Qayyooma wa-atoobu ilayh.',
    'I seek the forgiveness of Allah the Magnificent, besides whom none has the right to be worshipped, the Ever-Living, the Self-Sustaining, and I turn to Him in repentance.',
    1,
    'The Prophet ﷺ said whoever says this is forgiven, even if they had fled from the battlefield.',
    'Jami'' at-Tirmidhi 3577',
    'https://sunnah.com/tirmidhi:3577',
    'Sahih (al-Albani)',
    'Hisn al-Muslim'
  ),
  -- decision · Hisn al-Muslim 74 · Sahih al-Bukhari 1166
  (
    '74',
    'decision',
    900,
    ARRAY['guidance']::text[],
    'اللَّهُمَّ إِنِّي أَسْتَخِيرُكَ بِعِلْمِكَ وَأَسْتَقْدِرُكَ بِقُدْرَتِكَ، وَأَسْأَلُكَ مِنْ فَضْلِكَ الْعَظِيمِ، فَإِنَّكَ تَقْدِرُ وَلاَ أَقْدِرُ وَتَعْلَمُ وَلاَ أَعْلَمُ وَأَنْتَ عَلاَّمُ الْغُيُوبِ، اللَّهُمَّ إِنْ كُنْتَ تَعْلَمُ أَنَّ هَذَا الأَمْرَ خَيْرٌ لِي فِي دِينِي وَمَعَاشِي وَعَاقِبَةِ أَمْرِي أَوْ قَالَ عَاجِلِ أَمْرِي وَآجِلِهِ فَاقْدُرْهُ لِي وَيَسِّرْهُ لِي ثُمَّ بَارِكْ لِي فِيهِ، وَإِنْ كُنْتَ تَعْلَمُ أَنَّ هَذَا الأَمْرَ شَرٌّ لِي فِي دِينِي وَمَعَاشِي وَعَاقِبَةِ أَمْرِي أَوْ قَالَ فِي عَاجِلِ أَمْرِي وَآجِلِهِ فَاصْرِفْهُ عَنِّي وَاصْرِفْنِي عَنْهُ، وَاقْدُرْ لِي الْخَيْرَ حَيْثُ كَانَ ثُمَّ أَرْضِنِي بِهِ',
    'Allahumma innee astakheeruka bi''ilmik, wa-astaqdiruka biqudratik, wa-as''aluka min fadlikal-''atheem, fa-innaka taqdiru wala aqdir, wata''lamu wala a''lam, wa-anta ''allamul-ghuyoob. Allahumma in kunta ta''lamu anna hathal-amra khayrun lee fee deenee wama''ashee wa''aqibati amree (aw qala: ''ajili amree wa-ajilih), faqdurhu lee wayassirhu lee thumma barik lee feeh. Wa-in kunta ta''lamu anna hathal-amra sharrun lee fee deenee wama''ashee wa''aqibati amree (aw qala: fee ''ajili amree wa-ajilih), fasrifhu ''annee wasrifnee ''anh, waqdur liyal-khayra haythu kan, thumma ardinee bih.',
    'O Allah, I seek Your counsel by Your knowledge, and by Your power I seek strength, and I ask You from Your immense favour, for You are able while I am not, and You know while I do not, and You are the Knower of the unseen. O Allah, if You know this matter to be good for me in my religion, my life and my end (or he said: in my affairs now and later), then decree it for me, make it easy for me and bless me in it. And if You know this matter to be bad for me in my religion, my life and my end (or he said: in my affairs now and later), then turn it away from me and turn me away from it, and decree for me what is good wherever it may be, and make me pleased with it.',
    1,
    'Pray two voluntary rak''ahs, then make this dua, naming your matter where it says ''this matter''.',
    'Sahih al-Bukhari 1166',
    'https://sunnah.com/bukhari:1166',
    NULL,
    'Hisn al-Muslim'
  ),
  -- doubt · Hisn al-Muslim 134 · Sahih Muslim 134
  (
    '134',
    'doubt',
    1000,
    ARRAY['guidance']::text[],
    'آمَنْتُ بِاللَّهِ',
    'Amantu billah.',
    'I believe in Allah.',
    1,
    'When whispers come asking ''who created Allah?'', the Prophet ﷺ said to say this.',
    'Sahih Muslim 134',
    'https://sunnah.com/muslim:134a',
    NULL,
    'Hisn al-Muslim'
  ),
  -- anger · Hisn al-Muslim 193 · Sahih al-Bukhari 6115
  (
    '193',
    'anger',
    1100,
    ARRAY['anger']::text[],
    'أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ',
    'A''oothu billahi minash-shaytanir-rajeem.',
    'I seek refuge in Allah from Satan, the accursed.',
    1,
    'Two men were arguing and one grew red with anger. The Prophet ﷺ said that if he said this, his anger would leave him.',
    'Sahih al-Bukhari 6115',
    'https://sunnah.com/bukhari:6115',
    NULL,
    'Hisn al-Muslim'
  ),
  -- anger · Hisn al-Muslim 186 · Sahih al-Bukhari 1894
  (
    '186',
    'anger',
    1101,
    ARRAY['anger']::text[],
    'إِنِّي صَائِمٌ',
    'Innee sa''im.',
    'I am fasting.',
    2,
    'If someone insults you or picks a fight while you are fasting, say this twice.',
    'Sahih al-Bukhari 1894',
    'https://sunnah.com/bukhari:1894',
    NULL,
    'Hisn al-Muslim'
  ),
  -- anger · Hisn al-Muslim 230 · Sahih al-Bukhari 6361
  (
    '230',
    'anger',
    1102,
    ARRAY['anger', 'guilt']::text[],
    'اللَّهُمَّ فَأَيُّمَا مُؤْمِنٍ سَبَبْتُهُ فَاجْعَلْ ذَلِكَ لَهُ قُرْبَةً إِلَيْكَ يَوْمَ الْقِيَامَةِ',
    'Allahumma fa-ayyuma mu''minin sababtuhu, faj''al thalika lahu qurbatan ilayka yawmal-qiyamah.',
    'O Allah, to any believer whom I have insulted, let that be cause to draw him near to You on the Day of Resurrection.',
    1,
    'The Prophet ﷺ made this dua for anyone he had spoken harshly to.',
    'Sahih al-Bukhari 6361',
    'https://sunnah.com/bukhari:6361',
    NULL,
    'Hisn al-Muslim'
  ),
  -- gratitude · Hisn al-Muslim 218 · Sunan Ibn Majah 3803
  (
    '218a',
    'gratitude',
    1200,
    ARRAY['gratitude']::text[],
    'الْحَمْدُ لِلَّهِ الَّذِي بِنِعْمَتِهِ تَتِمُّ الصَّالِحَاتُ',
    'Alhamdu lillahil-lathee bini''matihi tatimmus-salihat.',
    'Praise is to Allah, by whose favour good things are completed.',
    1,
    'What the Prophet ﷺ said when he saw something that pleased him.',
    'Sunan Ibn Majah 3803',
    'https://sunnah.com/ibnmajah:3803',
    'Hasan (al-Albani); weak according to Zubair Ali Zai',
    'Hisn al-Muslim'
  ),
  -- gratitude · Hisn al-Muslim 194 · Jami' at-Tirmidhi 3432
  (
    '194',
    'gratitude',
    1201,
    ARRAY['gratitude']::text[],
    'الْحَمْدُ لِلَّهِ الَّذِي عَافَانِي مِمَّا ابْتَلاَكَ بِهِ وَفَضَّلَنِي عَلَى كَثِيرٍ مِمَّنْ خَلَقَ تَفْضِيلاً',
    'Alhamdu lillahil-lathee ''afanee mimmab-talaka bih, wafaddalanee ''ala katheerin mimman khalaqa tafdeela.',
    'All praise is for Allah Who saved me from that which He tested you with and Who most certainly favoured me over much of His creation.',
    1,
    'Said when you see someone going through a hardship. Scholars advise saying it quietly, so as not to hurt them.',
    'Jami'' at-Tirmidhi 3432',
    'https://sunnah.com/tirmidhi:3432',
    'Sahih (al-Albani); weak according to Zubair Ali Zai',
    'Hisn al-Muslim'
  ),
  -- gratitude · Hisn al-Muslim 198 · Jami' at-Tirmidhi 2035
  (
    '198',
    'gratitude',
    1202,
    ARRAY['gratitude']::text[],
    'جَزَاكَ اللَّهُ خَيْرًا',
    'Jazakal-lahu khayran.',
    'May Allah reward you with goodness.',
    1,
    'The Prophet ﷺ said that whoever says this to someone who has done them a favour has praised them fully.',
    'Jami'' at-Tirmidhi 2035',
    'https://sunnah.com/tirmidhi:2035',
    'Sahih (al-Albani); weak according to Zubair Ali Zai',
    'Hisn al-Muslim'
  ),
  -- distress · al-Jawab al-Kafi · Jami' at-Tirmidhi 3524
  (
    'jk1',
    'distress',
    104,
    ARRAY['anxiety', 'hope']::text[],
    'يَا حَىُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ',
    'Ya Hayyu ya Qayyum, bi rahmatika astagheeth.',
    'O Ever-Living, O Sustainer of all, by Your mercy I seek help.',
    1,
    'What the Prophet ﷺ said when something distressed him.',
    'Jami'' at-Tirmidhi 3524',
    'https://sunnah.com/tirmidhi:3524',
    'Hasan (al-Albani)',
    'al-Jawab al-Kafi'
  ),
  -- asking · al-Jawab al-Kafi · Jami' at-Tirmidhi 3475
  (
    'jk2',
    'asking',
    1,
    ARRAY['hope']::text[],
    'اللَّهُمَّ إِنِّي أَسْأَلُكَ بِأَنِّي أَشْهَدُ أَنَّكَ أَنْتَ اللَّهُ لاَ إِلَهَ إِلاَّ أَنْتَ الأَحَدُ الصَّمَدُ الَّذِي لَمْ يَلِدْ وَلَمْ يُولَدْ وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ',
    'Allahumma innee as''aluka bi-annee ashhadu annaka antal-lahu la ilaha illa ant, al-Ahadus-Samad, alladhee lam yalid wa lam yoolad, wa lam yakun lahu kufuwan ahad.',
    'O Allah, I ask You, as I bear witness that You are Allah, there is no god but You, the One, the Self-Sufficient, who does not beget and was not begotten, and to whom no one is equal.',
    1,
    'The Prophet ﷺ heard a man ask with these words and said he had asked Allah by His greatest name, by which, when He is asked, He gives.',
    'Jami'' at-Tirmidhi 3475',
    'https://sunnah.com/tirmidhi:3475',
    'Sahih (al-Albani)',
    'al-Jawab al-Kafi'
  ),
  -- asking · al-Jawab al-Kafi · Jami' at-Tirmidhi 3525
  (
    'jk3',
    'asking',
    2,
    ARRAY['hope']::text[],
    'يَا ذَا الْجَلاَلِ وَالإِكْرَامِ',
    'Ya Dhal-Jalali wal-Ikram.',
    'O Possessor of Majesty and Honour.',
    1,
    'The Prophet ﷺ told us to persist in calling on Allah with these words.',
    'Jami'' at-Tirmidhi 3525',
    'https://sunnah.com/tirmidhi:3525',
    'Sahih (al-Albani)',
    'al-Jawab al-Kafi'
  ),
  -- doubt · al-Jawab al-Kafi · Jami' at-Tirmidhi 3522
  (
    'jk4',
    'doubt',
    1001,
    ARRAY['guidance']::text[],
    'يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ',
    'Ya Muqallibal-quloob, thabbit qalbee ''ala deenik.',
    'O Turner of hearts, keep my heart firm upon Your religion.',
    1,
    'Umm Salamah said this was the dua the Prophet ﷺ made most often.',
    'Jami'' at-Tirmidhi 3522',
    'https://sunnah.com/tirmidhi:3522',
    'Sahih (al-Albani)',
    'al-Jawab al-Kafi'
  )
ON CONFLICT (id) DO NOTHING;
