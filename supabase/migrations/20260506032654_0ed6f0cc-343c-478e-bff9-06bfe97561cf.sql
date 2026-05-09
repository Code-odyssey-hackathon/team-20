
REVOKE EXECUTE ON FUNCTION public.purchase_item(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.purchase_item(uuid) TO authenticated;
