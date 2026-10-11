/*
# Add Mental Health tables for the "Santé Mentale" section

1. New Tables
- `mental_check_ins` — Daily check-in entries with mood analysis, AI advice, and question
  - `id` (uuid, primary key)
  - `user_id` (uuid, owner, defaults to auth.uid())
  - `entry_text` (text, what the user wrote)
  - `mood_detected` (text: 'super' | 'moyen' | 'down')
  - `advice` (text, AI-generated advice bullets)
  - `question` (text, AI-generated open question)
  - `safety_alert` (boolean, whether crisis keywords were detected)
  - `created_at` (timestamptz)
- `mental_challenges` — Weekly micro-challenges the user can accept and complete
  - `id` (uuid, primary key)
  - `user_id` (uuid, owner, defaults to auth.uid())
  - `challenge_text` (text, the challenge description)
  - `status` (text: 'proposed' | 'accepted' | 'completed')
  - `week_key` (text, ISO week identifier e.g. "2026-W41")
  - `completed_at` (timestamptz, null)
  - `created_at` (timestamptz)
- `mental_victories` — Journal of victories / proud moments
  - `id` (uuid, primary key)
  - `user_id` (uuid, owner, defaults to auth.uid())
  - `victory_text` (text, what the user is proud of)
  - `trophy` (text, trophy emoji/identifier)
  - `created_at` (timestamptz)

2. Security
- Enable RLS on all three tables.
- Owner-scoped CRUD: each authenticated user can only access rows they own.
- All owner columns default to auth.uid() so inserts succeed even when the client omits user_id.
*/