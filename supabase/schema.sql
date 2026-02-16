-- =============================================
-- CLASSBANDIT v2 — Simplified Schema
-- Paste into Supabase SQL Editor → Run
-- =============================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- === USERS ===
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL DEFAULT '',
    teacher_name TEXT DEFAULT '',
    avatar_url TEXT,
    grade_levels INTEGER[] DEFAULT '{}',
    onboarding_complete BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- === CLASSROOMS ===
CREATE TABLE public.classrooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    grade_level INTEGER DEFAULT 2,
    class_size INTEGER DEFAULT 23,
    display_code TEXT UNIQUE NOT NULL DEFAULT upper(substr(md5(random()::text), 1, 6)),
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- === PETS ===
CREATE TABLE public.pets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    classroom_id UUID UNIQUE NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'Bandit',
    pet_type TEXT NOT NULL DEFAULT 'pet1',
    mood TEXT DEFAULT 'neutral',
    total_points INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    level_points INTEGER DEFAULT 0,
    hearts INTEGER DEFAULT 5,
    streak_days INTEGER DEFAULT 0,
    last_fed_at TIMESTAMPTZ,
    last_watered_at TIMESTAMPTZ,
    last_cleaned_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- === GOALS ===
CREATE TABLE public.goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    classroom_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    casel_category TEXT DEFAULT 'Self-Management',
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- === CHECKINS (point additions) ===
CREATE TABLE public.checkins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    classroom_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
    goal_id UUID REFERENCES public.goals(id) ON DELETE SET NULL,
    points INTEGER DEFAULT 1,
    action_type TEXT DEFAULT 'goal',  -- 'goal', 'feed', 'water', 'clean', 'general'
    created_by UUID NOT NULL REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- === REFLECTIONS ===
CREATE TABLE public.reflections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    classroom_id UUID NOT NULL REFERENCES public.classrooms(id) ON DELETE CASCADE,
    category TEXT NOT NULL,  -- 'energy', 'midday', 'turnaround', 'celebration'
    emotion TEXT,
    follow_up_response TEXT,
    created_by UUID NOT NULL REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reflections ENABLE ROW LEVEL SECURITY;

-- Users: can read/update own profile
CREATE POLICY "Users read own" ON public.users FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users update own" ON public.users FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Users insert own" ON public.users FOR INSERT WITH CHECK (id = auth.uid());

-- Classrooms: teachers manage their own
CREATE POLICY "Teachers read own classrooms" ON public.classrooms FOR SELECT USING (teacher_id = auth.uid());
CREATE POLICY "Teachers insert classrooms" ON public.classrooms FOR INSERT WITH CHECK (teacher_id = auth.uid());
CREATE POLICY "Teachers update own classrooms" ON public.classrooms FOR UPDATE USING (teacher_id = auth.uid());
CREATE POLICY "Teachers delete own classrooms" ON public.classrooms FOR DELETE USING (teacher_id = auth.uid());

-- Pets: via classroom ownership
CREATE POLICY "Teachers read own pets" ON public.pets FOR SELECT USING (classroom_id IN (SELECT id FROM public.classrooms WHERE teacher_id = auth.uid()));
CREATE POLICY "Teachers insert pets" ON public.pets FOR INSERT WITH CHECK (classroom_id IN (SELECT id FROM public.classrooms WHERE teacher_id = auth.uid()));
CREATE POLICY "Teachers update own pets" ON public.pets FOR UPDATE USING (classroom_id IN (SELECT id FROM public.classrooms WHERE teacher_id = auth.uid()));

-- Goals: via classroom ownership
CREATE POLICY "Teachers manage goals" ON public.goals FOR ALL USING (classroom_id IN (SELECT id FROM public.classrooms WHERE teacher_id = auth.uid()));

-- Checkins: via classroom ownership
CREATE POLICY "Teachers read checkins" ON public.checkins FOR SELECT USING (classroom_id IN (SELECT id FROM public.classrooms WHERE teacher_id = auth.uid()));
CREATE POLICY "Teachers insert checkins" ON public.checkins FOR INSERT WITH CHECK (classroom_id IN (SELECT id FROM public.classrooms WHERE teacher_id = auth.uid()));

-- Reflections: via classroom ownership
CREATE POLICY "Teachers manage reflections" ON public.reflections FOR ALL USING (classroom_id IN (SELECT id FROM public.classrooms WHERE teacher_id = auth.uid()));

-- =============================================
-- REALTIME
-- =============================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.pets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.checkins;
ALTER PUBLICATION supabase_realtime ADD TABLE public.goals;

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_classrooms_teacher ON public.classrooms(teacher_id);
CREATE INDEX idx_pets_classroom ON public.pets(classroom_id);
CREATE INDEX idx_goals_classroom ON public.goals(classroom_id);
CREATE INDEX idx_checkins_classroom ON public.checkins(classroom_id);
CREATE INDEX idx_checkins_date ON public.checkins(created_at);

-- =============================================
-- AUTO-CREATE USER PROFILE ON SIGNUP
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- FUNCTION: Add points (updates pet + creates checkin)
-- =============================================
CREATE OR REPLACE FUNCTION public.add_points(
    p_classroom_id UUID,
    p_goal_id UUID DEFAULT NULL,
    p_action_type TEXT DEFAULT 'goal',
    p_points INTEGER DEFAULT 1
)
RETURNS public.pets AS $$
DECLARE
    v_pet public.pets;
    v_new_lp INTEGER;
    v_new_level INTEGER;
BEGIN
    -- Create checkin
    INSERT INTO public.checkins (classroom_id, goal_id, points, action_type, created_by)
    VALUES (p_classroom_id, p_goal_id, p_points, p_action_type, auth.uid());

    -- Get current pet
    SELECT * INTO v_pet FROM public.pets WHERE classroom_id = p_classroom_id;

    -- Calculate new level/points
    v_new_lp := v_pet.level_points + p_points;
    v_new_level := v_pet.level;
    IF v_new_lp >= 25 THEN
        v_new_level := v_new_level + 1;
        v_new_lp := v_new_lp - 25;
    END IF;

    -- Update pet
    UPDATE public.pets SET
        total_points = total_points + p_points,
        level = v_new_level,
        level_points = v_new_lp,
        mood = CASE WHEN v_new_level > v_pet.level THEN 'celebrating' ELSE 'happy' END,
        last_fed_at = CASE WHEN p_action_type = 'feed' THEN NOW() ELSE last_fed_at END,
        last_watered_at = CASE WHEN p_action_type = 'water' THEN NOW() ELSE last_watered_at END,
        last_cleaned_at = CASE WHEN p_action_type = 'clean' THEN NOW() ELSE last_cleaned_at END,
        updated_at = NOW()
    WHERE classroom_id = p_classroom_id
    RETURNING * INTO v_pet;

    RETURN v_pet;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
