
-- Coins on profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS coins integer NOT NULL DEFAULT 0;

-- Track preferred language per user for story
ALTER TABLE public.story_progress ADD COLUMN IF NOT EXISTS language text NOT NULL DEFAULT 'Python';

-- Shop items
CREATE TABLE IF NOT EXISTS public.shop_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL DEFAULT '🎁',
  price integer NOT NULL,
  kind text NOT NULL, -- consumable | cosmetic | booster
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.shop_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Shop items public read" ON public.shop_items FOR SELECT USING (true);

-- User inventory
CREATE TABLE IF NOT EXISTS public.user_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  item_id uuid NOT NULL REFERENCES public.shop_items(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  active boolean NOT NULL DEFAULT false,
  acquired_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.user_inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own inventory" ON public.user_inventory FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own inventory" ON public.user_inventory FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own inventory" ON public.user_inventory FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Add coins function
CREATE OR REPLACE FUNCTION public.add_coins(p_coins integer)
RETURNS void
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles SET coins = coins + p_coins WHERE id = auth.uid();
END $$;

-- Purchase item (atomic)
CREATE OR REPLACE FUNCTION public.purchase_item(p_item_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_price integer;
  v_balance integer;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not authenticated');
  END IF;
  SELECT price INTO v_price FROM public.shop_items WHERE id = p_item_id;
  IF v_price IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'item not found');
  END IF;
  SELECT coins INTO v_balance FROM public.profiles WHERE id = v_uid FOR UPDATE;
  IF v_balance < v_price THEN
    RETURN jsonb_build_object('ok', false, 'error', 'insufficient coins');
  END IF;
  UPDATE public.profiles SET coins = coins - v_price WHERE id = v_uid;
  INSERT INTO public.user_inventory (user_id, item_id, quantity)
  VALUES (v_uid, p_item_id, 1)
  ON CONFLICT DO NOTHING;
  RETURN jsonb_build_object('ok', true, 'balance', v_balance - v_price);
END $$;

-- Seed shop items
INSERT INTO public.shop_items (slug, name, description, icon, price, kind, payload) VALUES
  ('hint_pack_3',     'Hint Pack (×3)',       'Reveal 3 extra hints in Story Time levels.',     '💡', 25,  'consumable', '{"hints":3}'),
  ('skip_token',      'Skip Token',           'Skip a level you are stuck on (still earns coins).', '⏭️', 60,  'consumable', '{"skips":1}'),
  ('xp_booster_2x',   '2× XP Booster',        'Doubles XP from your next 5 levels.',            '⚡', 80,  'booster',    '{"multiplier":2,"uses":5}'),
  ('coin_booster_2x', '2× Coin Booster',      'Doubles coins from your next 5 levels.',         '🪙', 100, 'booster',    '{"multiplier":2,"uses":5}'),
  ('theme_neon',      'Neon Code Theme',      'Unlock a vivid neon editor theme.',              '🎨', 150, 'cosmetic',   '{"theme":"neon"}'),
  ('avatar_legend',   'Legendary Avatar Frame','Show off a glowing frame on your profile.',     '👑', 250, 'cosmetic',   '{"frame":"legend"}')
ON CONFLICT (slug) DO NOTHING;
