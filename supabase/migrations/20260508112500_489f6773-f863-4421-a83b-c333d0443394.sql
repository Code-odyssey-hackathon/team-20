
-- Skill-track tables for the new dual-track Story Time (Pythoria + Project Yantra)
DO $$ BEGIN
  CREATE TYPE public.track_kind AS ENUM ('python', 'cpp');
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  track public.track_kind NOT NULL,
  level INT NOT NULL DEFAULT 1,
  xp INT NOT NULL DEFAULT 0,
  streak INT NOT NULL DEFAULT 0,
  last_active_at TIMESTAMPTZ,
  current_center TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, track)
);
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own progress all" ON public.user_progress;
CREATE POLICY "own progress all" ON public.user_progress FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.topic_mastery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  track public.track_kind NOT NULL,
  topic TEXT NOT NULL,
  mastery_score INT NOT NULL DEFAULT 0,
  attempts INT NOT NULL DEFAULT 0,
  correct INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, track, topic)
);
ALTER TABLE public.topic_mastery ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own mastery all" ON public.topic_mastery;
CREATE POLICY "own mastery all" ON public.topic_mastery FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.question_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  track public.track_kind NOT NULL,
  level INT NOT NULL,
  topics TEXT[] NOT NULL DEFAULT '{}',
  prompt JSONB NOT NULL,
  user_code TEXT,
  verdict TEXT,
  feedback JSONB,
  xp_awarded INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  submitted_at TIMESTAMPTZ
);
ALTER TABLE public.question_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own history all" ON public.question_history;
CREATE POLICY "own history all" ON public.question_history FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_question_history_user_track_created ON public.question_history (user_id, track, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_topic_mastery_user_track ON public.topic_mastery (user_id, track);
