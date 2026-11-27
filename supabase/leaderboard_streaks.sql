-- ==============================================================================
-- BUG AUTOPSY LAB: Global Leaderboard & Daily Streaks Migration
-- ==============================================================================

-- 1. Create profiles table linked to auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT 'Developer',
  points INTEGER NOT NULL DEFAULT 0,
  weekly_points INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  mastered_count INTEGER NOT NULL DEFAULT 0,
  last_active_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for leaderboard performance
CREATE INDEX IF NOT EXISTS idx_profiles_points ON public.profiles (points DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_weekly_points ON public.profiles (weekly_points DESC);

-- 2. Grant permissions to Supabase roles
GRANT ALL ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- Allow anyone authenticated or anonymous to read all leaderboard profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- Allow users to update their own profile (points, streaks, etc.)
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow users to insert their own profile (fallback if signup trigger hasn't fired)
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 5. Function & Trigger for new user auto-creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    display_name,
    points,
    weekly_points,
    current_streak,
    longest_streak,
    mastered_count,
    last_active_date
  ) VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1),
      'Developer'
    ),
    0,
    0,
    0,
    0,
    0,
    NULL
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Backfill existing auth.users into public.profiles
INSERT INTO public.profiles (id, display_name, points, weekly_points, current_streak, longest_streak, mastered_count)
SELECT 
  id,
  COALESCE(
    raw_user_meta_data->>'full_name',
    raw_user_meta_data->>'name',
    split_part(email, '@', 1),
    'Developer'
  ) AS display_name,
  0,
  0,
  0,
  0,
  0
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 7. Backfill points & mastered_count from existing bug_autopsies if present
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bug_autopsies') THEN
    UPDATE public.profiles p
    SET 
      mastered_count = sub.mastered_cnt,
      points = p.points + (sub.total_cnt * 10) + (sub.mastered_cnt * 25),
      weekly_points = p.weekly_points + (sub.total_cnt * 10) + (sub.mastered_cnt * 25)
    FROM (
      SELECT 
        user_id,
        COUNT(*) AS total_cnt,
        COUNT(*) FILTER (WHERE status = 'Mastered') AS mastered_cnt
      FROM public.bug_autopsies
      GROUP BY user_id
    ) sub
    WHERE p.id = sub.user_id AND p.points = 0;
  END IF;
END $$;
