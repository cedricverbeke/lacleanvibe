/*
# Add Mental Health tables for the "Santé Mentale" section

1. New Tables
- `mental_check_ins` — Daily check-in entries with mood analysis, AI advice, and question
- `mental_challenges` — Weekly micro-challenges the user can accept and complete
- `mental_victories` — Journal of victories / proud moments

2. Security
- Enable RLS on all three tables.
- Owner-scoped CRUD: each authenticated user can only access rows they own.
- All owner columns default to auth.uid().
*/

CREATE TABLE IF NOT EXISTS mental_check_ins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_text text NOT NULL,
  mood_detected text NOT NULL DEFAULT 'moyen',
  advice text,
  question text,
  safety_alert boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE mental_check_ins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_mental_check_ins" ON mental_check_ins;
CREATE POLICY "select_own_mental_check_ins" ON mental_check_ins FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_mental_check_ins" ON mental_check_ins;
CREATE POLICY "insert_own_mental_check_ins" ON mental_check_ins FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_mental_check_ins" ON mental_check_ins;
CREATE POLICY "update_own_mental_check_ins" ON mental_check_ins FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_mental_check_ins" ON mental_check_ins;
CREATE POLICY "delete_own_mental_check_ins" ON mental_check_ins FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS mental_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_text text NOT NULL,
  status text NOT NULL DEFAULT 'proposed',
  week_key text NOT NULL,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE mental_challenges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_mental_challenges" ON mental_challenges;
CREATE POLICY "select_own_mental_challenges" ON mental_challenges FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_mental_challenges" ON mental_challenges;
CREATE POLICY "insert_own_mental_challenges" ON mental_challenges FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_mental_challenges" ON mental_challenges;
CREATE POLICY "update_own_mental_challenges" ON mental_challenges FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_mental_challenges" ON mental_challenges;
CREATE POLICY "delete_own_mental_challenges" ON mental_challenges FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS mental_victories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  victory_text text NOT NULL,
  trophy text NOT NULL DEFAULT '🌟',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE mental_victories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_mental_victories" ON mental_victories;
CREATE POLICY "select_own_mental_victories" ON mental_victories FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_mental_victories" ON mental_victories;
CREATE POLICY "insert_own_mental_victories" ON mental_victories FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_mental_victories" ON mental_victories;
CREATE POLICY "update_own_mental_victories" ON mental_victories FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_mental_victories" ON mental_victories;
CREATE POLICY "delete_own_mental_victories" ON mental_victories FOR DELETE
  TO authenticated USING (auth.uid() = user_id);