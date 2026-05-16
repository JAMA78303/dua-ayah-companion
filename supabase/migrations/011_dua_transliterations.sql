-- Backfill missing dua_transliteration values (approved + pending pairings).
-- Verify after apply:
--   SELECT COUNT(*) FROM ayah_pairings
--   WHERE (dua_transliteration IS NULL OR TRIM(dua_transliteration) = '')
--     AND status IN ('approved', 'pending');
-- Expected: 0

-- Diagnostic (run manually in SQL editor if needed):
-- SELECT id, surah, ayah_number, dua_text, dua_transliteration, source_type
-- FROM ayah_pairings
-- WHERE (dua_transliteration IS NULL OR TRIM(dua_transliteration) = '')
--   AND status IN ('approved', 'pending')
-- ORDER BY surah, ayah_number;

-- Surah Al-Fatihah 1:6
UPDATE ayah_pairings
SET dua_transliteration =
  'Ihdina as-sirata al-mustaqeem, sirata alladhina an''amta ''alayhim, ghayri al-maghdoobi ''alayhim wa lad-daalleen'
WHERE surah = 1 AND ayah_number = 6
  AND (dua_transliteration IS NULL OR TRIM(dua_transliteration) = '');

-- Surah Al-Baqarah 2:127
UPDATE ayah_pairings
SET dua_transliteration =
  'Rabbana taqabbal minna innaka anta as-Samee'' al-''Aleem'
WHERE surah = 2 AND ayah_number = 127
  AND (dua_transliteration IS NULL OR TRIM(dua_transliteration) = '');

-- Surah Al-Baqarah 2:201
UPDATE ayah_pairings
SET dua_transliteration =
  'Rabbana aatina fid-dunya hasanatan wa fil-aakhirati hasanatan wa qina ''adhaban-naar'
WHERE surah = 2 AND ayah_number = 201
  AND (dua_transliteration IS NULL OR TRIM(dua_transliteration) = '');

-- Surah Al-Baqarah 2:250
UPDATE ayah_pairings
SET dua_transliteration =
  'Rabbana afrigh ''alayna sabran wa thabbit aqdaamana wansurna ''alal-qawmil-kaafireen'
WHERE surah = 2 AND ayah_number = 250
  AND (dua_transliteration IS NULL OR TRIM(dua_transliteration) = '');

-- Surah Al-Baqarah 2:285
UPDATE ayah_pairings
SET dua_transliteration =
  'Ghufraanaka rabbana wa ilaykal-maseer'
WHERE surah = 2 AND ayah_number = 285
  AND (dua_transliteration IS NULL OR TRIM(dua_transliteration) = '');

-- Surah Al-Baqarah 2:286
UPDATE ayah_pairings
SET dua_transliteration =
  'Rabbana laa tu-aakhidhna in naseena aw akhta''na, rabbana wa laa tahmil ''alayna isran kamaa hamaltahu ''alal-ladheena min qablina, rabbana wa laa tuhammilna maa laa taaqata lana bih, wa''fu ''anna waghfir lana warhamna, anta mawlaana fansurna ''alal-qawmil-kaafireen'
WHERE surah = 2 AND ayah_number = 286
  AND (dua_transliteration IS NULL OR TRIM(dua_transliteration) = '');

-- Surah Aal-Imran 3:8
UPDATE ayah_pairings
SET dua_transliteration =
  'Rabbana laa tuzigh quloobana ba''da idh hadaytana wa hab lana min ladunka rahmah, innaka antal-Wahhaab'
WHERE surah = 3 AND ayah_number = 8
  AND (dua_transliteration IS NULL OR TRIM(dua_transliteration) = '');

-- Surah Aal-Imran 3:147
UPDATE ayah_pairings
SET dua_transliteration =
  'Rabbana ighfir lana dhunoobana wa israafana fee amrina wa thabbit aqdaamana wansurna ''alal-qawmil-kaafireen'
WHERE surah = 3 AND ayah_number = 147
  AND (dua_transliteration IS NULL OR TRIM(dua_transliteration) = '');

-- Surah Aal-Imran 3:173
UPDATE ayah_pairings
SET dua_transliteration =
  'Hasbunallaahu wa ni''mal-wakeel'
WHERE surah = 3 AND ayah_number = 173
  AND (dua_transliteration IS NULL OR TRIM(dua_transliteration) = '');

-- Surah Aal-Imran 3:193
UPDATE ayah_pairings
SET dua_transliteration =
  'Rabbana innana sami''na munadiyan yunaadee lil-eemaan an aaminoo birabbikum fa-aamanna, rabbana faghfir lana dhunoobana wa kaffir ''anna sayyi-aatina wa tawaffana ma''al-abraar'
WHERE surah = 3 AND ayah_number = 193
  AND (dua_transliteration IS NULL OR TRIM(dua_transliteration) = '');

-- Surah Al-A'raf 7:23
UPDATE ayah_pairings
SET dua_transliteration =
  'Rabbana dhalamna anfusana wa in lam taghfir lana wa tarhamna lanakoonanna minal-khaasireen'
WHERE surah = 7 AND ayah_number = 23
  AND (dua_transliteration IS NULL OR TRIM(dua_transliteration) = '');

-- Surah Al-A'raf 7:126
UPDATE ayah_pairings
SET dua_transliteration =
  'Rabbana afrigh ''alayna sabran wa tawaffana muslimeen'
WHERE surah = 7 AND ayah_number = 126
  AND (dua_transliteration IS NULL OR TRIM(dua_transliteration) = '');

-- Surah Yunus 10 / Al-Anbiya 21:83 (Ayyub)
UPDATE ayah_pairings
SET dua_transliteration =
  'Anni massaniyad-durru wa anta arhamur-raahimeen'
WHERE surah = 21 AND ayah_number = 83
  AND (dua_transliteration IS NULL OR TRIM(dua_transliteration) = '');

-- Surah Al-Anbiya 21:87
UPDATE ayah_pairings
SET dua_transliteration =
  'Laa ilaaha illaa anta subhaanaka innee kuntu minadh-dhaalimeen'
WHERE surah = 21 AND ayah_number = 87
  AND (dua_transliteration IS NULL OR TRIM(dua_transliteration) = '');

-- Surah Al-Anbiya 21:89
UPDATE ayah_pairings
SET dua_transliteration =
  'Rabbi laa tadharni fardan wa anta khayrul-waaritheen'
WHERE surah = 21 AND ayah_number = 89
  AND (dua_transliteration IS NULL OR TRIM(dua_transliteration) = '');

-- Surah Al-Qasas 28:24
UPDATE ayah_pairings
SET dua_transliteration =
  'Rabbi innee limaa anzalta ilayya min khayrin faqeer'
WHERE surah = 28 AND ayah_number = 24
  AND (dua_transliteration IS NULL OR TRIM(dua_transliteration) = '');

-- Surah Ibrahim 14:40
UPDATE ayah_pairings
SET dua_transliteration =
  'Rabbij-''alni muqeemas-salaati wa min dhurriyyatee, rabbana wa taqabbal du''aa'''
WHERE surah = 14 AND ayah_number = 40
  AND (dua_transliteration IS NULL OR TRIM(dua_transliteration) = '');

-- Surah Ibrahim 14:41
UPDATE ayah_pairings
SET dua_transliteration =
  'Rabbanaghfir lee wa liwaalidayya wa lil-mu''mineena yawma yaqoomul-hisaab'
WHERE surah = 14 AND ayah_number = 41
  AND (dua_transliteration IS NULL OR TRIM(dua_transliteration) = '');

-- Surah Maryam 19:4
UPDATE ayah_pairings
SET dua_transliteration =
  'Rabbi innee wahanalad-dha''mu minnee washtaalar-ra''su shayban wa lam akum bidu''aa-ika rabbi shaqiyyaa'
WHERE surah = 19 AND ayah_number = 4
  AND (dua_transliteration IS NULL OR TRIM(dua_transliteration) = '');

-- Surah Ta-Ha 20:2
UPDATE ayah_pairings
SET dua_transliteration =
  'Allahumma laa taj''al maa razaqtana min ''ilmi kitaabika hujjatan ''alayna'
WHERE surah = 20 AND ayah_number = 2
  AND (dua_transliteration IS NULL OR TRIM(dua_transliteration) = '');

-- Surah Ta-Ha 20:25
UPDATE ayah_pairings
SET dua_transliteration =
  'Rabbish-rah lee sadree wa yassir lee amree wahlul ''uqdatan min lisaanee yafqahoo qawlee'
WHERE surah = 20 AND ayah_number = 25
  AND (dua_transliteration IS NULL OR TRIM(dua_transliteration) = '');

-- Surah Ta-Ha 20:45
UPDATE ayah_pairings
SET dua_transliteration =
  'Rabbana innanaa nakhaafu an yafruta ''alaynaa aw an yatghaa'
WHERE surah = 20 AND ayah_number = 45
  AND (dua_transliteration IS NULL OR TRIM(dua_transliteration) = '');

-- Surah Al-Furqan 25:74
UPDATE ayah_pairings
SET dua_transliteration =
  'Rabbana hab lana min azwaajina wa dhurriyyaatina qurrata a''yunin waj-''alna lil-muttaqeena imaama'
WHERE surah = 25 AND ayah_number = 74
  AND (dua_transliteration IS NULL OR TRIM(dua_transliteration) = '');

-- Surah Ash-Shu'ara 26:83
UPDATE ayah_pairings
SET dua_transliteration =
  'Rabbi hab lee hukman wa alhiqnee bis-saaliheen, waj-''al lee lisaana sidqin fil-aakhireen, waj-''alnee min warathati jannatin-na''eem'
WHERE surah = 26 AND ayah_number = 83
  AND (dua_transliteration IS NULL OR TRIM(dua_transliteration) = '');

-- Surah Al-Naml 27:19
UPDATE ayah_pairings
SET dua_transliteration =
  'Rabbi awzi''nee an ashkura ni''mataka allatee an''amta ''alayya wa ''alaa waalidayya wa an a''mala saalihan tardaahu wa adkhilnee birahmatika fee ''ibaadikash-shaaliheen'
WHERE surah = 27 AND ayah_number = 19
  AND (dua_transliteration IS NULL OR TRIM(dua_transliteration) = '');

-- Surah Al-Qamar 54:10
UPDATE ayah_pairings
SET dua_transliteration =
  'Rabbi annee maghloobun fantasir'
WHERE surah = 54 AND ayah_number = 10
  AND (dua_transliteration IS NULL OR TRIM(dua_transliteration) = '');

-- Surah Nuh 71:28
UPDATE ayah_pairings
SET dua_transliteration =
  'Rabbigh-fir lee wa liwaalidayya wa liman dakhala baytiya mu''minan wa lil-mu''mineena wal-mu''minaat'
WHERE surah = 71 AND ayah_number = 28
  AND (dua_transliteration IS NULL OR TRIM(dua_transliteration) = '');

-- Surah Al-Tahrim 66:11 (Asiya RA)
UPDATE ayah_pairings
SET dua_transliteration =
  'Rabbib-ni lee ''indaka baytan fil-jannati wa najjinee min fir''awna wa ''amalihee wa najjinee minal-qawmidh-dhaalimeen'
WHERE surah = 66 AND ayah_number = 11
  AND (dua_transliteration IS NULL OR TRIM(dua_transliteration) = '');

-- Surah Yusuf 12:101
UPDATE ayah_pairings
SET dua_transliteration =
  'Rabbi qad aataytanee minal-mulki wa ''allamtanee min ta''weelil-ahaadeeth, faatiras-samaawaati wal-ard, anta waliyyee fid-dunyaa wal-aakhirah, tawaffanee musliman wa alhiqnee bis-saaliheen'
WHERE surah = 12 AND ayah_number = 101
  AND (dua_transliteration IS NULL OR TRIM(dua_transliteration) = '');

-- Prophetic duas (hadith-sourced)
UPDATE ayah_pairings
SET dua_transliteration =
  'Allahumma innee a''oodhu bika minal-hammi wal-hazan, wal-''ajzi wal-kasal, wal-bukhli wal-jubn, wa dala''id-dayn, wa ghalabaatir-rijaal'
WHERE hadith_source LIKE '%Bukhari 6369%'
  AND (dua_transliteration IS NULL OR TRIM(dua_transliteration) = '');

UPDATE ayah_pairings
SET dua_transliteration =
  'Allahumma anta rabbee laa ilaaha illaa ant, khalaqtanee wa ana ''abduk, wa ana ''alaa ''ahdika wa wa''dika mastata''t, a''oodhu bika min sharri maa sana''t, aboo-u laka bini''matika ''alayy, wa aboo-u laka bidhanbee faghfir lee fa-innahu laa yaghfirudh-dhunooba illaa ant'
WHERE hadith_source LIKE '%Bukhari 6306%'
  AND (dua_transliteration IS NULL OR TRIM(dua_transliteration) = '');

UPDATE ayah_pairings
SET dua_transliteration =
  'Laa ilaaha illallaahul-''Adheemul-Haleem, laa ilaaha illallaahu rabbul-''arshil-''adheem, laa ilaaha illallaahu rabbus-samaawaati wa rabbul-ardi wa rabbul-''arshil-kareem'
WHERE hadith_source LIKE '%Bukhari 7426%'
  AND (dua_transliteration IS NULL OR TRIM(dua_transliteration) = '');

UPDATE ayah_pairings
SET dua_transliteration =
  'Allahumma rahmataka arjoo falaa takilnee ilaa nafsee tarfata ''ayn, wa aslih lee sha''nee kullahu laa ilaaha illaa ant'
WHERE hadith_source LIKE '%Dawud 5090%'
  AND (dua_transliteration IS NULL OR TRIM(dua_transliteration) = '');
