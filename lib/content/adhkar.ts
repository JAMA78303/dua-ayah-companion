/**
 * Morning and evening adhkar.
 *
 * - Qur'anic items: Quran.com Uthmani text and Saheeh International.
 * - All others: Hisn al-Muslim (Fortress of the Muslim, compiled by Sa'id ibn Wahf al-Qahtani), chapter
 *   "Words of remembrance for morning and evening", via hisnmuslim.com. Arabic is taken verbatim from that
 *   source. Corrections to its English: hisn-80 "angles" -> "angels"; hisn-86 "All-Seeing" ->
 *   "All-Hearing" (the Arabic is as-Samee'). Repeat counts fixed where the source's own text says
 *   otherwise (hisn-82: 3, hisn-83: 7). The printed book gives the hadith reference for each item.
 */

export type AdhkarTime = "morning" | "evening";

export interface Dhikr {
  id: string;
  kind: "quran" | "hadith";
  /** When it's said: morning only, evening only, or both. */
  time: AdhkarTime | "both";
  repeat: number;
  title?: string;
  /** Qur'anic items: the ayat recited, e.g. "112:1-4". */
  refs?: string[];
  arabic: string;
  translit?: string;
  english: string;
  /** Evening wording where it differs (from the source), or a note on what changes. */
  eveningArabic?: string;
  eveningTranslit?: string;
  eveningEnglish?: string;
  eveningNote?: string;
  note?: string;
}

export const ADHKAR: Dhikr[] = [
  {
    id: "ayat-al-kursi",
    kind: "quran",
    time: "both",
    repeat: 1,
    title: "Ayat al-Kursi",
    refs: ["2:255"],
    arabic: "ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ ۚ لَا تَأْخُذُهُۥ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُۥ مَا فِى ٱلسَّمَـٰوَٰتِ وَمَا فِى ٱلْأَرْضِ ۗ مَن ذَا ٱلَّذِى يَشْفَعُ عِندَهُۥٓ إِلَّا بِإِذْنِهِۦ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَىْءٍ مِّنْ عِلْمِهِۦٓ إِلَّا بِمَا شَآءَ ۚ وَسِعَ كُرْسِيُّهُ ٱلسَّمَـٰوَٰتِ وَٱلْأَرْضَ ۖ وَلَا يَـُٔودُهُۥ حِفْظُهُمَا ۚ وَهُوَ ٱلْعَلِىُّ ٱلْعَظِيمُ",
    english: "Allāh - there is no deity except Him, the Ever-Living, the Self-Sustaining. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth. Who is it that can intercede with Him except by His permission? He knows what is [presently] before them and what will be after them, and they encompass not a thing of His knowledge except for what He wills. His Kursī extends over the heavens and the earth, and their preservation tires Him not. And He is the Most High, the Most Great.",
    note: "Begin with: a'udhu billahi minash-shaytanir-rajim (I seek refuge in Allah from Satan, the expelled).",
  },
  {
    id: "surah-112",
    kind: "quran",
    time: "both",
    repeat: 3,
    title: "Surah Al-Ikhlas",
    refs: ["112:1-4"],
    arabic: "قُلْ هُوَ ٱللَّهُ أَحَدٌ ٱللَّهُ ٱلصَّمَدُ لَمْ يَلِدْ وَلَمْ يُولَدْ وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ",
    english: "Say, \"He is Allāh, [who is] One, Allāh, the Eternal Refuge. He neither begets nor is born, Nor is there to Him any equivalent.\"",
    note: "Recite with Bismillah, three times; the three surahs are recited together.",
  },
  {
    id: "surah-113",
    kind: "quran",
    time: "both",
    repeat: 3,
    title: "Surah Al-Falaq",
    refs: ["113:1-5"],
    arabic: "قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ مِن شَرِّ مَا خَلَقَ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ وَمِن شَرِّ ٱلنَّفَّـٰثَـٰتِ فِى ٱلْعُقَدِ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ",
    english: "Say, \"I seek refuge in the Lord of daybreak From the evil of that which He created And from the evil of darkness when it settles And from the evil of the blowers in knots And from the evil of an envier when he envies.\"",
    note: "Recite with Bismillah, three times; the three surahs are recited together.",
  },
  {
    id: "surah-114",
    kind: "quran",
    time: "both",
    repeat: 3,
    title: "Surah An-Nas",
    refs: ["114:1-6"],
    arabic: "قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ مَلِكِ ٱلنَّاسِ إِلَـٰهِ ٱلنَّاسِ مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ ٱلَّذِى يُوَسْوِسُ فِى صُدُورِ ٱلنَّاسِ مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ",
    english: "Say, \"I seek refuge in the Lord of mankind, The Sovereign of mankind, The God of mankind, From the evil of the retreating whisperer - Who whispers [evil] into the breasts of mankind - From among the jinn and mankind\".",
    note: "Recite with Bismillah, three times; the three surahs are recited together.",
  },
  {
    id: "hisn-77",
    kind: "hadith",
    time: "both",
    repeat: 1,
    arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا الْيَوْمِ وَخَيرَ مَا بَعْدَهُ ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي  هَذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ",
    english: "We have reached the morning and at this very time unto Allah, belongs all sovereignty, and all praise is for Allah. None has the right to be worshipped except Allah, alone, without any partner, to Him belong all sovereignty and praise and He is over all things omnipotent. My Lord, I ask You for the good of this day and the good of what follows it and I take refuge in You from the evil of this day and the evil of what follows it. My Lord, I take refuge in You from laziness and senility. My Lord, I take refuge in You from torment in the Fire and punishment in the grave.",
    eveningArabic: "أمسينا وأمسى الملك للَّه … رب أسألك خير ما في هذه الليلة، وخير ما بعدها، وأعوذ بك من شر ما في هذه الليلة، وشر ما بعدها",
  },
  {
    id: "hisn-78",
    kind: "hadith",
    time: "both",
    repeat: 1,
    arabic: "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا ، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ",
    translit: "Allahumma bika asbahna wabika amsayna, wabika nahya, wabika namootu wa-ilaykan-nushoor.",
    english: "O Allah, by your leave we have reached the morning and by Your leave we have reached the evening, by Your leave we live and die and unto You is our resurrection.",
    eveningArabic: "اللَّهم بك أمسينا، وبك أصبحنا، وبك نحيا، وبك نموت، وإليك المصير",
    eveningTranslit: "Allahumma bika amsayna, wabika asbahna, wabika nahya wabika namootu wa-ilaykal-maseer.",
    eveningEnglish: "O Allah, by Your leave we have reached the evening and by Your leave we have reached the morning, by Your leave we live and die and unto You is our return.",
  },
  {
    id: "hisn-79",
    kind: "hadith",
    time: "both",
    repeat: 1,
    arabic: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلاَّ أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لاَ يَغْفِرُ الذُّنوبَ إِلاَّ أَنْتَ",
    translit: "Allahumma anta rabbee la ilaha illa ant, khalaqtanee wa-ana 'abduk, wa-ana 'ala 'ahdika wawa'dika mas-tata't, a'oothu bika min sharri ma sana't, aboo-o laka bini'matika 'alay, wa-aboo-o bithanbee, faghfir lee fa-innahu la yaghfiruth-thunooba illa ant.",
    english: "O Allah, You are my Lord, none has the right to be worshipped except You, You created me and I am Your servant and I abide to Your covenant and promise as best I can, I take refuge in You from the evil of which I have committed. I acknowledge Your favour upon me and I acknowledge my sin, so forgive me, for verily none can forgive sin except You.",
  },
  {
    id: "hisn-80",
    kind: "hadith",
    time: "both",
    repeat: 4,
    arabic: "اللَّهُمَّ إِنِّي أَصْبَحْتُ أُشْهِدُكَ، وَأُشْهِدُ حَمَلَةَ عَرْشِكَ، وَمَلاَئِكَتِكَ، وَجَمِيعَ خَلْقِكَ، أَنَّكَ أَنْتَ اللَّهُ لَا إِلَهَ إِلاَّ أَنْتَ وَحْدَكَ لاَ شَرِيكَ لَكَ، وَأَنَّ مُحَمَّداً عَبْدُكَ وَرَسُولُكَ",
    translit: "Allahumma innee asbahtu oshhiduk, wa-oshhidu hamalata 'arshik, wamala-ikatak, wajamee'a khalqik, annaka antal-lahu la ilaha illa ant, wahdaka la shareeka lak, wa-anna Muhammadan 'abduka warasooluk.",
    english: "O Allah, verily I have reached the morning and call on You, the bearers of Your throne, Your angels, and all of Your creation to witness that You are Allah, none has the right to be worshipped except You, alone, without partner and that Muhammad is Your Servant and Messenger.",
    eveningNote: "In the evening, say amsaytu instead of asbahtu.",
  },
  {
    id: "hisn-81",
    kind: "hadith",
    time: "both",
    repeat: 1,
    arabic: "اللَّهُمَّ مَا أَصْبَحَ بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لاَ شَرِيكَ لَكَ، فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ",
    translit: "Allahumma ma asbaha bee min ni'matin, aw bi-ahadin min khalqik, faminka wahdaka la shareeka lak, falakal-hamdu walakash-shukr.",
    english: "O Allah, what blessing I or any of Your creation have risen upon, is from You alone, without partner, so for You is all praise and unto You all thanks.",
    eveningNote: "In the evening, say amsa instead of asbaha.",
    note: "Whoever says this in the morning has indeed offered his day’s thanks and whoever says this in the evening has indeed offered his night’s thanks.",
  },
  {
    id: "hisn-82",
    kind: "hadith",
    time: "both",
    repeat: 3,
    arabic: "اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لاَ إِلَهَ إِلاَّ أَنْتَ. اللَّهُمَّ  إِنِّي أَعُوذُ بِكَ مِنَ الْكُفْرِ، وَالفَقْرِ، وَأَعُوذُ بِكَ مِنْ عَذَابِ القَبْرِ، لاَ إِلَهَ إِلاَّ أَنْتَ",
    translit: "Allahumma 'afinee fee badanee, allahumma 'afinee fee sam'ee, allahumma 'afinee fee basaree, la ilaha illa ant. Allahumma innee a'oothu bika minal-kufr, walfaqr, wa-a'oothu bika min 'athabil-qabr, la ilaha illa ant.",
    english: "O Allah, grant my body health, O Allah, grant my hearing health, O Allah, grant my sight health. None has the right to be worshipped except You. O Allah, I take refuge with You from disbelief and poverty, and I take refuge with You from the punishment of the grave. None has the right to be worshipped except You.",
  },
  {
    id: "hisn-83",
    kind: "hadith",
    time: "both",
    repeat: 7,
    arabic: "حَسْبِيَ اللَّهُ لاَ إِلَهَ إِلاَّ هُوَ عَلَيهِ تَوَكَّلتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ",
    translit: "Hasbiyal-lahu la ilaha illa huwa, 'alayhi tawakkalt, wahuwa rabbul-'arshil-'atheem.",
    english: "Allah is Sufficient for me, none has the right to be worshipped except Him, upon Him I rely and He is Lord of the exalted throne.",
  },
  {
    id: "hisn-84",
    kind: "hadith",
    time: "both",
    repeat: 1,
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالآخِرَةِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ: فِي دِينِي وَدُنْيَايَ وَأَهْلِي، وَمَالِي، اللَّهُمَّ اسْتُرْ عَوْرَاتِي، وَآمِنْ رَوْعَاتِي، اللَّهُمَّ احْفَظْنِي مِنْ بَينِ يَدَيَّ، وَمِنْ خَلْفِي، وَعَنْ يَمِينِي، وَعَنْ شِمَالِي، وَمِنْ فَوْقِي، وَأَعُوذُ بِعَظَمَتِكَ أَنْ أُغْتَالَ مِنْ تَحْتِي",
    translit: "Allahumma innee as-alukal-'afwa wal'afiyah, fid-dunya wal-akhirah, allahumma innee as-alukal-'afwa wal'afiyah fee deenee, wadunyaya wa-ahlee, wamalee, allahummas-tur 'awratee, wa-amin raw'atee, allahummah-fathnee min bayni yaday, wamin khalfee, wa'an yameenee, wa'an shimalee, wamin fawqee, wa-a'oothu bi'athamatika an oghtala min tahtee.",
    english: "O Allah, I ask You for pardon and well-being in this life and the next. O Allah, I ask You for pardon and well-being in my religious and worldly affairs, and my family and my wealth. O Allah, veil my weaknesses and set at ease my dismay. O Allah, preserve me from the front and from behind and on my right and on my left and from above, and I take refuge with You lest I be swallowed up by the earth.",
  },
  {
    id: "hisn-85",
    kind: "hadith",
    time: "both",
    repeat: 1,
    arabic: "اللَّهُمَّ عَالِمَ الغَيْبِ وَالشَّهَادَةِ فَاطِرَ السَّمَوَاتِ وَالْأَرْضِ، رَبَّ كُلِّ شَيْءٍ وَمَلِيكَهُ، أَشْهَدُ أَنْ لاَ إِلَهَ إِلاَّ أَنْتَ، أَعُوذُ بِكَ مِنْ شَرِّ نَفْسِي، وَمِنْ شَرِّ الشَّيْطانِ وَشَرَكِهِ، وَأَنْ أَقْتَرِفَ عَلَى  نَفْسِي سُوءاً، أَوْ أَجُرَّهُ إِلَى مُسْلِمٍ",
    translit: "Allahumma 'alimal-ghaybi washshahadah, fatiras-samawati wal-ard, rabba kulli shayin wamaleekah, ashhadu an la ilaha illa ant, a'oothu bika min sharri nafsee wamin sharrish-shaytani washirkih, waan aqtarifa 'ala nafsee soo-an aw ajurrahu ila muslim.",
    english: "O Allah, Knower of the unseen and the seen, Creator of the heavens and the Earth, Lord and Sovereign of all things, I bear witness that none has the right to be worshipped except You. I take refuge in You from the evil of my soul and from the evil and shirk of the devil, and from committing wrong against my soul or bringing such upon another Muslim.",
  },
  {
    id: "hisn-86",
    kind: "hadith",
    time: "both",
    repeat: 3,
    arabic: "بِسْمِ اللَّهِ الَّذِي لاَ يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلاَ فِي السّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
    translit: "Bismil-lahil-lathee la yadurru ma'as-mihi shay-on fil-ardi wala fis-sama-i wahuwas-samee'ul-'aleem.",
    english: "In the name of Allah with whose name nothing is harmed on earth nor in the heavens and He is The All-Hearing, The All-Knowing.",
  },
  {
    id: "hisn-87",
    kind: "hadith",
    time: "both",
    repeat: 3,
    arabic: "رَضِيتُ بِاللَّهِ رَبَّاً، وَبِالْإِسْلاَمِ دِيناً، وَبِمُحَمَّدٍ صلى الله عليه وسلم نَبِيّاً",
    translit: "Radeetu billahi rabban wabil-islami deenan wabiMuhammadin nabiyya.",
    english: "I am pleased with Allah as a Lord, and Islam as a religion and Muhammad as a Prophet.",
  },
  {
    id: "hisn-88",
    kind: "hadith",
    time: "both",
    repeat: 1,
    arabic: "يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغيثُ أَصْلِحْ لِي شَأْنِيَ كُلَّهُ وَلاَ تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ",
    translit: "Ya hayyu ya qayyoom, birahmatika astagheeth, aslih lee sha'nee kullah, wala takilnee ila nafsee tarfata 'ayn.",
    english: "O Ever Living, O Self-Subsisting and Supporter of all, by Your mercy I seek assistance, rectify for me all of my affairs and do not leave me to myself, even for the blink of an eye.",
  },
  {
    id: "hisn-89",
    kind: "hadith",
    time: "both",
    repeat: 1,
    arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ رَبِّ الْعَالَمِينَ، اللَّهُـمَّ إِنِّي أَسْأَلُكَ خَيْرَ هَذَا الْيَوْمِ:فَتْحَهُ، وَنَصْرَهُ، وَنورَهُ، وَبَرَكَتَهُ، وَهُدَاهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِيهِ وَشَرِّ مَا بَعْدَهُ",
    translit: "Asbahna wa-asbahal-mulku lillahi rabbil-'alameen, allahumma innee as-aluka khayra hathal-yawm, fat-hahu, wanasrahu, wanoorahu, wabarakatahu, wahudahu, wa-a'oothu bika min sharri ma feehi, washarri ma ba'dah.",
    english: "We have reached the morning and at this very time all sovereignty belongs to Allah, Lord of the worlds. O Allah, I ask You for the good of this day, its triumphs and its victories, its light and its blessings and its guidance, and I take refuge in You from the evil of this day and the evil that follows it.",
    eveningArabic: "أمسينا وأمسى الملك للَّه ربّ العالمين اللَّهم إني أسألك خير هذه الليلة: فتحها، ونصرها، ونورها، وبركتها، وهداها، وأعوذ بك من شر ما فيها، وشر ما بعدها",
    eveningTranslit: "Amsayna wa-amsal-mulku lillahi rabbil-'alameen, allahumma innee as-aluka khayra hathihil-laylah, fat-haha, wanasraha, wanooraha, wabarakataha, wahudaha, wa-a'oothu bika min sharri ma feeha washarri ma ba'daha.",
    eveningEnglish: "We have reached the evening and at this very time all sovereignty belongs to Allah, Lord of the worlds. O Allah, I ask You for the good of tonight, its triumphs and its victories, its light and its blessings and its guidance, and I take refuge in You from the evil of tonight and the evil that follows it.",
  },
  {
    id: "hisn-90",
    kind: "hadith",
    time: "both",
    repeat: 1,
    arabic: "أَصْبَحْنا عَلَى فِطْرَةِ الْإِسْلاَمِ، وَعَلَى كَلِمَةِ الْإِخْلاَصِ، وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ صلى الله عليه وسلم، وَعَلَى مِلَّةِ أَبِينَا إِبْرَاهِيمَ، حَنِيفاً مُسْلِماً وَمَا كَانَ مِنَ الْمُشرِكِينَ",
    translit: "Asbahna 'ala fitratil-islam, wa'ala kalimatil-ikhlas, wa'ala deeni nabiyyina Muhammad wa'ala millati abeena Ibraheem, haneefan musliman wama kana minal-mushrikeen.",
    english: "We rise upon the fitrah of Islam, and the word of pure faith, and upon the religion of our Prophet Muhammad and the religion of our forefather Ibraheem, who was a Muslim and of true faith and was not of those who associate others with Allah.",
    eveningNote: "In the evening, say amsayna instead of asbahna.",
  },
  {
    id: "hisn-91",
    kind: "hadith",
    time: "both",
    repeat: 100,
    arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
    translit: "Subhanal-lahi wabihamdih.",
    english: "How perfect Allah is and I praise Him.",
  },
  {
    id: "hisn-92",
    kind: "hadith",
    time: "both",
    repeat: 10,
    arabic: "لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    translit: "La ilaha illal-lah, wahdahu la shareeka lah, lahul-mulku walahul-hamd, wahuwa 'ala kulli shay-in qadeer.",
    english: "None has the right to be worshipped except Allah, alone, without partner, to Him belongs all sovereignty and praise, and He is over all things omnipotent.",
    note: "Ten times, or once if feeling lazy.",
  },
  {
    id: "hisn-93",
    kind: "hadith",
    time: "morning",
    repeat: 100,
    arabic: "لاَ إِلَهَ إِلاَّ اللَّهُ، وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    translit: "La ilaha illal-lah, wahdahu la shareeka lah, lahul-mulku walahul-hamd, wahuwa 'ala kulli shay-in qadeer.",
    english: "None has the right to be worshipped except Allah, alone, without partner, to Him belongs all sovereignty and praise, and He is over all things omnipotent.",
  },
  {
    id: "hisn-94",
    kind: "hadith",
    time: "morning",
    repeat: 3,
    arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ: عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ",
    translit: "Subhanal-lahi wabihamdih, 'adada khalqihi warida nafsih, wazinata 'arshih, wamidada kalimatih.",
    english: "How perfect Allah is and I praise Him by the number of His creation and His pleasure, and by the weight of His throne, and the ink of His words.",
  },
  {
    id: "hisn-95",
    kind: "hadith",
    time: "morning",
    repeat: 1,
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْماً نَافِعاً، وَرِزْقاً طَيِّباً، وَعَمَلاً مُتَقَبَّلاً",
    translit: "Allahumma innee as-aluka 'ilman nafi'an, warizqan tayyiban, wa'amalan mutaqabbalan.",
    english: "O Allah, I ask You for knowledge which is beneficial and sustenance which is good, and deeds which are acceptable.",
  },
  {
    id: "hisn-96",
    kind: "hadith",
    time: "both",
    repeat: 100,
    arabic: "أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ",
    translit: "Astaghfirullaaha wa 'atoobu 'ilayhi.",
    english: "I seek Allah's forgiveness and I turn to Him in repentance.",
  },
  {
    id: "hisn-97",
    kind: "hadith",
    time: "evening",
    repeat: 3,
    arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
    translit: "A'oothu bikalimatil-lahit-tammati min sharri ma khalaq.",
    english: "I take refuge in Allah's perfect words from the evil He has created.",
  },
  {
    id: "hisn-98",
    kind: "hadith",
    time: "both",
    repeat: 10,
    arabic: "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبَيِّنَا مُحَمَّدٍ",
    translit: "Allahumma salli wa sallim 'alaa Nabiyyinaa Muhammadin.",
    english: "O Allah, send prayers and peace upon our Prophet Muhammad.",
  },
];

export function adhkarFor(time: AdhkarTime): Dhikr[] {
  return ADHKAR.filter((dhikr) => dhikr.time === "both" || dhikr.time === time);
}

/** Morning adhkar from dawn until midday, evening from mid-afternoon; otherwise none is "due". */
export function adhkarTimeNow(date: Date): AdhkarTime | null {
  const hour = date.getHours();
  if (hour >= 4 && hour < 12) return "morning";
  if (hour >= 15 && hour < 22) return "evening";
  return null;
}
