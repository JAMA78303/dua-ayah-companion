-- Feedback may be anonymous, but a signed-in submission can only be attributed to the submitter.

DROP POLICY IF EXISTS "Anyone can submit feedback" ON resonance_feedback;

CREATE POLICY "Anyone can submit feedback"
  ON resonance_feedback FOR INSERT
  TO anon, authenticated
  WITH CHECK (user_id IS NULL OR user_id = (SELECT auth.uid()));
