/*
# The Clean Vibe — Schema additions

## Overview
Adds tables for routine evolution tracking, weekly meal plans, and health/sleep/sport logging.

## New Tables
1. `routine_evaluations` — user feedback after using skincare/haircare routines, enabling adaptive re-generation
2. `weekly_meal_plans` — stored weekly meal plans so next week generates different meals
3. `health_logs` — daily sleep and sport activity tracking with energy/mood

## Security
- RLS enabled on all new tables
- All owner-scoped to authenticated users via auth.uid()
- user_id defaults to auth.uid() for safe inserts
*/

-- ============================================
-- 1. ROUTINE EVALUATIONS (evolution tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS routine_evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  routine_type text NOT NULL CHECK (routine_type IN ('skincare', 'haircare')),
  feeling text NOT NULL,
  improvements text,
  skin_changes text,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE routine_evaluations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_evaluations" ON routine_evaluations;
CREATE POLICY "select_own_evaluations" ON routine_evaluations FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_evaluations" ON routine_evaluations;
CREATE POLICY "insert_own_evaluations" ON routine_evaluations FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_evaluations" ON routine_evaluations;
CREATE POLICY "delete_own_evaluations" ON routine_evaluations FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_evaluations_user_type ON routine_evaluations(user_id, routine_type);

-- ============================================
-- 2. WEEKLY MEAL PLANS
-- ============================================
CREATE TABLE IF NOT EXISTS weekly_meal_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start date NOT NULL,
  content jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE weekly_meal_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_weekly_meals" ON weekly_meal_plans;
CREATE POLICY "select_own_weekly_meals" ON weekly_meal_plans FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_weekly_meals" ON weekly_meal_plans;
CREATE POLICY "insert_own_weekly_meals" ON weekly_meal_plans FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_weekly_meals" ON weekly_meal_plans;
CREATE POLICY "delete_own_weekly_meals" ON weekly_meal_plans FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_weekly_meals_user ON weekly_meal_plans(user_id, week_start DESC);

-- ============================================
-- 3. HEALTH LOGS (sleep + sport)
-- ============================================
CREATE TABLE IF NOT EXISTS health_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date date NOT NULL,
  sleep_hours numeric(3,1),
  sleep_quality text,
  sport_activity text,
  sport_duration int,
  energy_level text,
  mood text,
  water_glasses int,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE health_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_health" ON health_logs;
CREATE POLICY "select_own_health" ON health_logs FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_health" ON health_logs;
CREATE POLICY "insert_own_health" ON health_logs FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_health" ON health_logs;
CREATE POLICY "update_own_health" ON health_logs FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_health" ON health_logs;
CREATE POLICY "delete_own_health" ON health_logs FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_health_user_date ON health_logs(user_id, log_date DESC);
