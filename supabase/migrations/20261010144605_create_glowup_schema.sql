/*
# GlowUp — Beauty & Wellness App for Teens

## Overview
Creates the full database schema for a teen-focused beauty/wellness app with:
- User profiles (pseudo, age, parental consent)
- Skincare, meal, and haircare questionnaire data
- AI-generated routines storage
- Menstrual cycle tracking with symptoms

## New Tables
1. `profiles` — extends auth.users with pseudo, birth year, parental consent
2. `skincare_profiles` — skincare questionnaire answers (JSONB)
3. `meal_profiles` — meal questionnaire answers (JSONB)
4. `haircare_profiles` — haircare questionnaire answers (JSONB)
5. `generated_routines` — AI-generated results for skincare/meals/haircare
6. `cycle_logs` — menstrual period start/end dates
7. `cycle_symptoms` — daily symptoms tracked during cycle

## Security
- RLS enabled on all tables
- All tables are owner-scoped to authenticated users via auth.uid()
- user_id columns default to auth.uid() for safe inserts
*/

-- ============================================
-- 1. PROFILES
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  pseudo text NOT NULL,
  birth_year int,
  parental_consent boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ============================================
-- 2. SKINCARE PROFILES
-- ============================================
CREATE TABLE IF NOT EXISTS skincare_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  answers jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE skincare_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_skincare" ON skincare_profiles;
CREATE POLICY "select_own_skincare" ON skincare_profiles FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_skincare" ON skincare_profiles;
CREATE POLICY "insert_own_skincare" ON skincare_profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_skincare" ON skincare_profiles;
CREATE POLICY "update_own_skincare" ON skincare_profiles FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_skincare" ON skincare_profiles;
CREATE POLICY "delete_own_skincare" ON skincare_profiles FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================
-- 3. MEAL PROFILES
-- ============================================
CREATE TABLE IF NOT EXISTS meal_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  answers jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE meal_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_meals" ON meal_profiles;
CREATE POLICY "select_own_meals" ON meal_profiles FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_meals" ON meal_profiles;
CREATE POLICY "insert_own_meals" ON meal_profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_meals" ON meal_profiles;
CREATE POLICY "update_own_meals" ON meal_profiles FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_meals" ON meal_profiles;
CREATE POLICY "delete_own_meals" ON meal_profiles FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================
-- 4. HAIRCARE PROFILES
-- ============================================
CREATE TABLE IF NOT EXISTS haircare_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  answers jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE haircare_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_haircare" ON haircare_profiles;
CREATE POLICY "select_own_haircare" ON haircare_profiles FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_haircare" ON haircare_profiles;
CREATE POLICY "insert_own_haircare" ON haircare_profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_haircare" ON haircare_profiles;
CREATE POLICY "update_own_haircare" ON haircare_profiles FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_haircare" ON haircare_profiles;
CREATE POLICY "delete_own_haircare" ON haircare_profiles FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================
-- 5. GENERATED ROUTINES (AI results)
-- ============================================
CREATE TABLE IF NOT EXISTS generated_routines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('skincare', 'meal', 'haircare')),
  content jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE generated_routines ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_routines" ON generated_routines;
CREATE POLICY "select_own_routines" ON generated_routines FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_routines" ON generated_routines;
CREATE POLICY "insert_own_routines" ON generated_routines FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_routines" ON generated_routines;
CREATE POLICY "delete_own_routines" ON generated_routines FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_routines_user_type ON generated_routines(user_id, type);

-- ============================================
-- 6. CYCLE LOGS (Menstrual tracker)
-- ============================================
CREATE TABLE IF NOT EXISTS cycle_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  end_date date,
  cycle_length int DEFAULT 28,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cycle_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_cycles" ON cycle_logs;
CREATE POLICY "select_own_cycles" ON cycle_logs FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_cycles" ON cycle_logs;
CREATE POLICY "insert_own_cycles" ON cycle_logs FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_cycles" ON cycle_logs;
CREATE POLICY "update_own_cycles" ON cycle_logs FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_cycles" ON cycle_logs;
CREATE POLICY "delete_own_cycles" ON cycle_logs FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_cycles_user_start ON cycle_logs(user_id, start_date DESC);

-- ============================================
-- 7. CYCLE SYMPTOMS
-- ============================================
CREATE TABLE IF NOT EXISTS cycle_symptoms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date date NOT NULL,
  mood text,
  energy text,
  cramps text,
  skin_condition text,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cycle_symptoms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_symptoms" ON cycle_symptoms;
CREATE POLICY "select_own_symptoms" ON cycle_symptoms FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_symptoms" ON cycle_symptoms;
CREATE POLICY "insert_own_symptoms" ON cycle_symptoms FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_symptoms" ON cycle_symptoms;
CREATE POLICY "update_own_symptoms" ON cycle_symptoms FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_symptoms" ON cycle_symptoms;
CREATE POLICY "delete_own_symptoms" ON cycle_symptoms FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_symptoms_user_date ON cycle_symptoms(user_id, log_date DESC);
