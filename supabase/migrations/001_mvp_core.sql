-- Dua & Ayah Companion MVP core schema

CREATE TABLE IF NOT EXISTS intent_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword TEXT NOT NULL,
  category TEXT NOT NULL,
  weight FLOAT DEFAULT 1.0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_intent_mappings_category ON intent_mappings(category);
ALTER TABLE intent_mappings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read intent mappings"
  ON intent_mappings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  role TEXT DEFAULT 'reviewer'
);
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can read admin users"
  ON admin_users FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = id);

CREATE TABLE IF NOT EXISTS ayah_pairings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  surah INTEGER NOT NULL,
  ayah_number INTEGER NOT NULL,
  arabic_text TEXT NOT NULL,
  translation TEXT NOT NULL,
  emotion_category TEXT NOT NULL,
  tafsir_source TEXT NOT NULL,
  inclusion_reason TEXT,
  tafsir_summary TEXT NOT NULL,
  reflection_prompts TEXT[] NOT NULL,
  tone_tag TEXT CHECK (tone_tag IN ('comfort', 'warning', 'balance')),
  dua_text TEXT NOT NULL,
  dua_transliteration TEXT,
  dua_translation TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewer_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ayah_pairings_category
  ON ayah_pairings(emotion_category)
  WHERE status = 'approved';
ALTER TABLE ayah_pairings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read approved pairings"
  ON ayah_pairings FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');
CREATE POLICY "Admins can insert pairings"
  ON ayah_pairings FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) IN (SELECT id FROM admin_users));

CREATE TABLE IF NOT EXISTS saved_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pairing_id UUID NOT NULL REFERENCES ayah_pairings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, pairing_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_items_user ON saved_items(user_id);
ALTER TABLE saved_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own saves"
  ON saved_items FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users insert own saves"
  ON saved_items FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users delete own saves"
  ON saved_items FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pairing_id UUID NOT NULL REFERENCES ayah_pairings(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) <= 2000),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_journal_user ON journal_entries(user_id, created_at DESC);
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own their journal"
  ON journal_entries FOR ALL
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE TABLE IF NOT EXISTS resonance_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pairing_id UUID NOT NULL REFERENCES ayah_pairings(id),
  user_id UUID REFERENCES auth.users(id),
  response BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE resonance_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit feedback"
  ON resonance_feedback FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
