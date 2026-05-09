-- 1. Profiles tier
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tier text NOT NULL DEFAULT 'free';

-- 2. Matches: game_type + room_id
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS game_type text NOT NULL DEFAULT 'mcq';
ALTER TABLE public.matches ADD COLUMN IF NOT EXISTS room_id uuid;

-- 3. Programming language topics
INSERT INTO public.topics (slug, name, category, icon, description) VALUES
  ('c', 'C', 'Languages', 'FileCode', 'Pointers, memory, and the OG of systems programming.'),
  ('cpp', 'C++', 'Languages', 'FileCode2', 'STL, OOP, templates, and modern C++ tricks.'),
  ('python', 'Python', 'Languages', 'Snake', 'Pythonic idioms, std lib, and gotchas.'),
  ('javascript', 'JavaScript', 'Languages', 'Braces', 'Closures, async, prototypes, the event loop.'),
  ('typescript', 'TypeScript', 'Languages', 'FileType', 'Generics, narrowing, utility types, inference.'),
  ('java', 'Java', 'Languages', 'Coffee', 'JVM internals, OOP, collections, concurrency.'),
  ('go', 'Go', 'Languages', 'Zap', 'Goroutines, channels, interfaces, idiomatic Go.'),
  ('rust', 'Rust', 'Languages', 'Cog', 'Ownership, borrowing, lifetimes, traits.'),
  ('sql', 'SQL', 'Languages', 'Database', 'Joins, indexes, window funcs, query plans.'),
  ('html-css', 'HTML / CSS', 'Web', 'Layout', 'Selectors, flex, grid, semantic markup.'),
  ('react', 'React', 'Web', 'Atom', 'Hooks, rendering, state, suspense.')
ON CONFLICT (slug) DO NOTHING;

-- 4. Rooms
CREATE TABLE public.rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  host_id uuid NOT NULL,
  topic_id uuid NOT NULL,
  game_type text NOT NULL,
  party_size int NOT NULL CHECK (party_size BETWEEN 1 AND 4),
  status text NOT NULL DEFAULT 'lobby',
  questions jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz
);
CREATE INDEX idx_rooms_code ON public.rooms(code);

ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Rooms readable by authenticated" ON public.rooms FOR SELECT TO authenticated USING (true);
CREATE POLICY "Host can create room" ON public.rooms FOR INSERT TO authenticated WITH CHECK (auth.uid() = host_id);
CREATE POLICY "Host can update room" ON public.rooms FOR UPDATE TO authenticated USING (auth.uid() = host_id);

-- 5. Room members
CREATE TABLE public.room_members (
  room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  joined_at timestamptz NOT NULL DEFAULT now(),
  score int NOT NULL DEFAULT 0,
  correct_count int NOT NULL DEFAULT 0,
  finished boolean NOT NULL DEFAULT false,
  finished_at timestamptz,
  PRIMARY KEY (room_id, user_id)
);
ALTER TABLE public.room_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members readable by authenticated" ON public.room_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "User joins themselves" ON public.room_members FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User updates own membership" ON public.room_members FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "User leaves own membership" ON public.room_members FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 6. Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.room_members;
ALTER TABLE public.rooms REPLICA IDENTITY FULL;
ALTER TABLE public.room_members REPLICA IDENTITY FULL;