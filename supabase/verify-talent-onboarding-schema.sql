-- Verify and Fix Talent Onboarding Schema
-- Run this in Supabase SQL Editor to ensure all columns exist

-- 1. Verify profiles table columns
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'profiles'
    AND column_name IN ('status', 'revision_notes', 'country', 'timezone', 'full_name')
ORDER BY column_name;

-- 2. Verify talent_profiles table columns
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'talent_profiles'
    AND column_name IN ('user_id', 'experience', 'portfolio_url', 'intro_video_url', 'submitted_at')
ORDER BY column_name;

-- 3. Add missing columns to profiles if needed
DO $$ BEGIN
    -- status
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'status'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN status TEXT DEFAULT 'DRAFT';
    END IF;

    -- revision_notes
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'revision_notes'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN revision_notes TEXT;
    END IF;

    -- country
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'country'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN country TEXT;
    END IF;

    -- timezone
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'timezone'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN timezone TEXT;
    END IF;
END $$;

-- 4. Add missing columns to talent_profiles if needed
DO $$ BEGIN
    -- experience
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'talent_profiles' AND column_name = 'experience'
    ) THEN
        ALTER TABLE public.talent_profiles ADD COLUMN experience TEXT;
    END IF;

    -- portfolio_url
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'talent_profiles' AND column_name = 'portfolio_url'
    ) THEN
        ALTER TABLE public.talent_profiles ADD COLUMN portfolio_url TEXT;
    END IF;

    -- intro_video_url
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'talent_profiles' AND column_name = 'intro_video_url'
    ) THEN
        ALTER TABLE public.talent_profiles ADD COLUMN intro_video_url TEXT;
    END IF;

    -- submitted_at
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'talent_profiles' AND column_name = 'submitted_at'
    ) THEN
        ALTER TABLE public.talent_profiles ADD COLUMN submitted_at TIMESTAMPTZ;
    END IF;
END $$;

-- 5. Verify indexes
SELECT 
    indexname, 
    indexdef
FROM pg_indexes
WHERE schemaname = 'public' 
    AND (indexname LIKE '%profiles%status%' OR indexname LIKE '%talent_profiles%user_id%');

-- 6. Create indexes if missing
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_role_status ON public.profiles(role, status);
CREATE INDEX IF NOT EXISTS idx_talent_profiles_user_id ON public.talent_profiles(user_id);

-- 7. Verify junction table exists
SELECT 
    column_name, 
    data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = '_CandidateSkills'
ORDER BY column_name;

-- 8. Summary
SELECT 
    'profiles' as table_name,
    COUNT(*) as total_columns,
    COUNT(CASE WHEN column_name IN ('status', 'revision_notes', 'country', 'timezone', 'full_name') THEN 1 END) as required_columns
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles'
UNION ALL
SELECT 
    'talent_profiles' as table_name,
    COUNT(*) as total_columns,
    COUNT(CASE WHEN column_name IN ('user_id', 'experience', 'portfolio_url', 'intro_video_url', 'submitted_at') THEN 1 END) as required_columns
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'talent_profiles';
