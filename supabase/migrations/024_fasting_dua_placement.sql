-- Hisn al-Muslim 186, "Innee sa'im" (Sahih al-Bukhari 1894), is for the one who is fasting: Hisn al-Muslim
-- files it under "What to say when you are fasting and someone is rude to you" (chapter 75), apart from
-- its duas for anger (chapter 82). 021 put it under anger. Give it its own situation and take it off the
-- anger feeling, so it no longer shows as a dua for anyone who is angry. Safe to re-run.

UPDATE public.sunnah_duas
SET situation = 'fasting',
    feelings = '{}',
    note = 'For when you''re fasting. The Prophet ﷺ said fasting is a shield: if someone fights or insults the one who is fasting, let him say this, twice.'
WHERE id = '186';
