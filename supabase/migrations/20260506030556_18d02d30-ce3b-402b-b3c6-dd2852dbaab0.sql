
CREATE TABLE public.story_progress (
  user_id UUID NOT NULL PRIMARY KEY,
  max_level INTEGER NOT NULL DEFAULT 1,
  total_solved INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.story_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Story progress readable by authenticated"
ON public.story_progress FOR SELECT TO authenticated USING (true);

CREATE POLICY "User inserts own story progress"
ON public.story_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "User updates own story progress"
ON public.story_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER story_progress_updated_at
BEFORE UPDATE ON public.story_progress
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
