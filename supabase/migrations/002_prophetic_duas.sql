ALTER TABLE ayah_pairings
  ADD COLUMN IF NOT EXISTS prophetic_story TEXT,
  ADD COLUMN IF NOT EXISTS prophet_name TEXT;

CREATE INDEX IF NOT EXISTS idx_ayah_pairings_prophet
  ON ayah_pairings(prophet_name)
  WHERE prophet_name IS NOT NULL;

COMMENT ON COLUMN ayah_pairings.prophetic_story IS
  'User-facing narrative context for duas from prophetic accounts.
Must be reviewed for accuracy and tone. Keep to 4-6 sentences.
Never include unverified hadith claims without noting grade.';

COMMENT ON COLUMN ayah_pairings.prophet_name IS
  'Name of the Prophet this pairing is attributed to.
Used to filter the Prophetic Duas series view.
NULL for non-prophetic pairings.';

INSERT INTO intent_mappings (keyword, category, weight)
VALUES
  ('i feel guilty', 'guilt', 1.0),
  ('i havent been praying', 'guilt', 1.0),
  ('i feel like a bad muslim', 'guilt', 1.0),
  ('i feel distant from allah', 'guilt', 0.9),
  ('i dont deserve', 'guilt', 0.8),
  ('ive been neglecting', 'guilt', 0.9),
  ('i feel spiritually empty', 'guilt', 0.9),
  ('i feel like a hypocrite', 'guilt', 0.8),
  ('i havent read quran', 'guilt', 1.0),
  ('shame', 'guilt', 0.7);

INSERT INTO ayah_pairings (
  surah, ayah_number, arabic_text, translation, emotion_category, tafsir_source,
  inclusion_reason, tafsir_summary, reflection_prompts, tone_tag,
  dua_text, dua_transliteration, dua_translation, prophetic_story, prophet_name, status
)
VALUES
  (
    20,
    2,
    'مَا أَنزَلْنَا عَلَيْكَ ٱلْقُرْءَانَ لِتَشْقَىٰٓ',
    'We have not sent down the Qur''an to you to cause you distress',
    'guilt',
    'Ibn Kathir',
    'Revealed when Prophet Muhammad ﷺ exhausted himself in night prayer. This ayah frames the Quran as mercy, not burden.',
    'Ibn Kathir explains this ayah as reassurance: the Quran is guidance and mercy, not hardship. Al-Sa''di similarly emphasizes relief over burden for the believer.',
    ARRAY[
      'In what area of your spiritual life do you feel most burdened right now?',
      'What would it feel like to approach the Quran with relief rather than obligation?'
    ],
    'comfort',
    'اللَّهُمَّ لَا تَجْعَلْ مَا رَزَقْتَنَا مِنْ عِلْمِ كِتَابِكَ حُجَّةً عَلَيْنَا',
    'Allahumma la taj''al ma razaqtana min ''ilmi kitabika hujjatan ''alayna',
    'O Allah, do not make what You have given us of knowledge of Your Book a proof against us',
    NULL,
    NULL,
    'approved'
  ),
  (
    21,
    83,
    'وَأَيُّوبَ إِذْ نَادَىٰ رَبَّهُۥٓ أَنِّى مَسَّنِىَ ٱلضُّرُّ وَأَنتَ أَرْحَمُ ٱلرَّٰحِمِينَ',
    'And Ayyub, when he called to his Lord: Adversity has touched me, and You are the Most Merciful of the merciful',
    'grief',
    'Ibn Kathir',
    'Ayyub عليه السلام made this dua after prolonged illness and loss, combining hardship acknowledgement with trust in mercy.',
    'Ibn Kathir presents this dua as honest address to Allah without bargaining. The trust itself is the supplication.',
    ARRAY[
      'What adversity are you carrying right now that you have not yet fully acknowledged to Allah?',
      'What would it feel like to simply name what is hard, and trust?'
    ],
    'comfort',
    'رَبِّ أَنِّى مَسَّنِىَ ٱلضُّرُّ وَأَنتَ أَرْحَمُ ٱلرَّٰحِمِينَ',
    'Rabbi anni massaniya ad-durru wa anta arham ur-rahimeen',
    'My Lord, adversity has touched me, and You are the Most Merciful of the merciful',
    'Ayyub عليه السلام lost wealth, health, and family and still turned directly to Allah with truth and trust. Allah responded and restored him.',
    'Ayyub',
    'approved'
  ),
  (
    21,
    87,
    'لَّآ إِلَـٰهَ إِلَّآ أَنتَ سُبْحَـٰنَكَ إِنِّى كُنتُ مِنَ ٱلظَّـٰلِمِينَ',
    'There is no god except You; glory be to You. Indeed, I have been of the wrongdoers',
    'guilt',
    'Ibn Kathir',
    'Yunus عليه السلام made this dua in darkness after error, combining tawhid, tasbih, and accountability.',
    'This dua combines Allah''s oneness, glorification, and self-accountability. Content reviewer should verify hadith grade before publishing any extended attribution.',
    ARRAY[
      'Is there something you are carrying right now where you know you played a role?',
      'What would complete honesty with Allah look like right now?'
    ],
    'comfort',
    'لَّآ إِلَـٰهَ إِلَّآ أَنتَ سُبْحَـٰنَكَ إِنِّى كُنتُ مِنَ ٱلظَّـٰلِمِينَ',
    'La ilaha illa anta subhanaka inni kuntu min adh-dhalimeen',
    'There is no god except You; glory be to You. Indeed, I have been of the wrongdoers',
    'Yunus عليه السلام called on Allah from inside the whale, in darkness upon darkness, with full accountability and no excuses.',
    'Yunus',
    'approved'
  ),
  (
    21,
    89,
    'رَبِّ لَا تَذَرْنِى فَرْدًا وَأَنتَ خَيْرُ ٱلْوَٰرِثِينَ',
    'My Lord, do not leave me alone, and You are the best of inheritors',
    'sadness',
    'Ibn Kathir',
    'Zakariyya عليه السلام made this dua in old age with a barren wife, asking despite human impossibility.',
    'Ibn Kathir and al-Sa''di highlight this dua as vulnerable hope: acknowledging weakness while still asking Allah.',
    ARRAY[
      'What are you asking Allah for that feels impossible from where you are standing?',
      'What would honest vulnerability in your dua sound like?'
    ],
    'comfort',
    'رَبِّ لَا تَذَرْنِى فَرْدًا وَأَنتَ خَيْرُ ٱلْوَٰرِثِينَ',
    'Rabbi la tadharni fardan wa anta khayrul waritheen',
    'My Lord, do not leave me alone, and You are the best of inheritors',
    'Zakariyya عليه السلام asked quietly and sincerely in old age despite impossibility. Allah granted him Yahya عليه السلام.',
    'Zakariyya',
    'approved'
  );
