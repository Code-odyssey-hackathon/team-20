
-- Recreate leaderboard with security_invoker
DROP VIEW IF EXISTS public.leaderboard;
CREATE VIEW public.leaderboard
WITH (security_invoker = true) AS
SELECT p.id, p.username, p.display_name, p.avatar_url, p.total_xp, p.level,
  COUNT(m.id) AS matches_played,
  COALESCE(SUM(m.correct_count), 0) AS total_correct
FROM public.profiles p
LEFT JOIN public.matches m ON m.user_id = p.id
GROUP BY p.id;

-- Lock down add_xp
REVOKE EXECUTE ON FUNCTION public.add_xp(UUID, INT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.add_xp(UUID, INT) TO authenticated;

-- handle_new_user is invoked by trigger; revoke direct exec
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- set_updated_at search path
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;
