/*
# Add style_lookups table for Style & Make-up tool

## Overview
Stores AI-generated make-up and outfit advice based on user photo events.

## New Tables
1. `style_lookups` — event type, AI advice (make-up steps + outfit feedback), stored as JSONB

## Security
- RLS enabled, owner-scoped to authenticated users
*/

CREATE TABLE IF NOT EXISTS style_lookups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  event_details text,
  advice jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE style_lookups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_styles" ON style_lookups;
CREATE POLICY "select_own_styles" ON style_lookups FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_styles" ON style_lookups;
CREATE POLICY "insert_own_styles" ON style_lookups FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_styles" ON style_lookups;
CREATE POLICY "delete_own_styles" ON style_lookups FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_styles_user ON style_lookups(user_id, created_at DESC);
