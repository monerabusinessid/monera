-- Complete Talent Onboarding Database Setup
-- Run this script in Supabase SQL Editor to setup everything at once

-- ============================================
-- 1. ADD COLUMNS TO profiles TABLE
-- ============================================
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

-- ============================================
-- 2. ADD COLUMNS TO talent_profiles TABLE
-- ============================================
DO $$ BEGIN
    -- experience
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'talent_profiles' AND column_name = 'experience'
    ) THEN
        ALTER TABLE public.talent_profiles ADD COLUMN experience TEXT;
    END IF;

    -- portfolio_url (might already exist)
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

-- ============================================
-- 3. CREATE INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_role_status ON public.profiles(role, status);
CREATE INDEX IF NOT EXISTS idx_talent_profiles_user_id ON public.talent_profiles(user_id);

-- ============================================
-- 4. CREATE TRIGGER FOR submitted_at
-- ============================================
CREATE OR REPLACE FUNCTION update_submitted_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'SUBMITTED' AND (OLD.status IS NULL OR OLD.status != 'SUBMITTED') THEN
        UPDATE public.talent_profiles
        SET submitted_at = NOW()
        WHERE user_id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_submitted_at ON public.profiles;
CREATE TRIGGER trigger_update_submitted_at
    AFTER UPDATE OF status ON public.profiles
    FOR EACH ROW
    WHEN (NEW.status = 'SUBMITTED' AND (OLD.status IS NULL OR OLD.status != 'SUBMITTED'))
    EXECUTE FUNCTION update_submitted_at();

-- ============================================
-- 5. SETUP STORAGE BUCKET
-- ============================================
-- Create bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'intro-videos',
    'intro-videos',
    false, -- Private bucket
    104857600, -- 100MB limit
    ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can upload their own intro videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own intro videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own intro videos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own intro videos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all intro videos" ON storage.objects;

-- Create RLS policies
CREATE POLICY "Users can upload their own intro videos"
ON storage.objects
FOR INSERT
WITH CHECK (
    bucket_id = 'intro-videos' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own intro videos"
ON storage.objects
FOR SELECT
USING (
    bucket_id = 'intro-videos' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own intro videos"
ON storage.objects
FOR UPDATE
USING (
    bucket_id = 'intro-videos' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own intro videos"
ON storage.objects
FOR DELETE
USING (
    bucket_id = 'intro-videos' AND
    auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all intro videos"
ON storage.objects
FOR SELECT
USING (
    bucket_id = 'intro-videos' AND
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()::text
        AND profiles.role IN ('SUPER_ADMIN', 'QUALITY_ADMIN', 'SUPPORT_ADMIN', 'ANALYST')
    )
);

-- ============================================
-- 6. VERIFICATION
-- ============================================
-- Check profiles columns
SELECT 
    'profiles' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'profiles'
    AND column_name IN ('status', 'revision_notes', 'country', 'timezone', 'full_name')
ORDER BY column_name;

-- Check talent_profiles columns
SELECT 
    'talent_profiles' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'talent_profiles'
    AND column_name IN ('user_id', 'experience', 'portfolio_url', 'intro_video_url', 'submitted_at')
ORDER BY column_name;

-- Check indexes
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public' 
    AND (indexname LIKE '%profiles%status%' OR indexname LIKE '%talent_profiles%user_id%');

-- Check bucket
SELECT id, name, public, file_size_limit
FROM storage.buckets
WHERE id = 'intro-videos';

-- Success message
DO $$ 
BEGIN
    RAISE NOTICE 'Talent onboarding database setup completed successfully!';
END $$;
