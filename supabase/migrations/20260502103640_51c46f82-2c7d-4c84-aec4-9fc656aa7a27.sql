
CREATE OR REPLACE FUNCTION public.add_xp(p_xp INT)
RETURNS VOID LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
BEGIN
  UPDATE public.profiles
  SET total_xp = total_xp + p_xp,
      level = GREATEST(1, 1 + ((total_xp + p_xp) / 500))
  WHERE id = auth.uid();
END $$;

DROP FUNCTION IF EXISTS public.add_xp(UUID, INT);
REVOKE EXECUTE ON FUNCTION public.add_xp(INT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.add_xp(INT) TO authenticated;
