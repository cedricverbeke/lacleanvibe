/*
# Add level to mental_challenges and category to mental_victories

1. Changes to `mental_challenges`
- Add `level` column (integer, default 1) — tracks the difficulty level of the challenge (1=Découverte, 2=Confiance, 3=Audace, 4=Légende)
- Add `difficulty_label` column (text, nullable) — human-readable label for the level

2. Changes to `mental_victories`
- Add `category` column (text, default 'autre') — category of the victory (social, scolaire, perso, courage, wellbeing, autre)

3. Security
- No RLS policy changes — existing policies already cover CRUD for authenticated users on these tables.

4. Notes
- Both columns have safe defaults so existing rows are not broken.
- Level defaults to 1 (Découverte) for all existing challenges.
- Category defaults to 'autre' for all existing victories.
*/

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mental_challenges' AND column_name = 'level') THEN
    ALTER TABLE mental_challenges ADD COLUMN level integer NOT NULL DEFAULT 1;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mental_challenges' AND column_name = 'difficulty_label') THEN
    ALTER TABLE mental_challenges ADD COLUMN difficulty_label text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mental_victories' AND column_name = 'category') THEN
    ALTER TABLE mental_victories ADD COLUMN category text NOT NULL DEFAULT 'autre';
  END IF;
END $$;