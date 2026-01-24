-- Talent Onboarding Schema
-- Run this in Supabase SQL Editor

-- 1. Create ProfileStatus enum
DO $$ BEGIN
    CREATE TYPE "ProfileStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'NEED_REVISION', 'APPROVED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Add status and revision_notes to profiles table
DO $$ BEGIN
    -- Add status column if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN status TEXT DEFAULT 'DRAFT';
    END IF;

    -- Add revision_notes column if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'revision_notes'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN revision_notes TEXT;
    END IF;

    -- Add country column if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'country'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN country TEXT;
    END IF;

    -- Add timezone column if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'timezone'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN timezone TEXT;
    END IF;
END $$;

-- 3. Update talent_profiles table
DO $$ BEGIN
    -- Add submitted_at column if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'talent_profiles' 
        AND column_name = 'submitted_at'
    ) THEN
        ALTER TABLE public.talent_profiles 
        ADD COLUMN submitted_at TIMESTAMP(3);
    END IF;

    -- Add intro_video_url column if not exists (might already exist)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'talent_profiles' 
        AND column_name = 'intro_video_url'
    ) THEN
        ALTER TABLE public.talent_profiles 
        ADD COLUMN intro_video_url TEXT;
    END IF;

    -- Add portfolio_url column if not exists (might already exist)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'talent_profiles' 
        AND column_name = 'portfolio_url'
    ) THEN
        ALTER TABLE public.talent_profiles 
        ADD COLUMN portfolio_url TEXT;
    END IF;

    -- Add experience column if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'talent_profiles' 
        AND column_name = 'experience'
    ) THEN
        ALTER TABLE public.talent_profiles 
        ADD COLUMN experience TEXT;
    END IF;
END $$;

-- 4. Create index for status lookups
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_role_status ON public.profiles(role, status);

-- 5. Update default status for new talent profiles
-- This will be handled by application logic, but we ensure DRAFT is the default

-- 6. Create function to update submitted_at when status changes to SUBMITTED
CREATE OR REPLACE FUNCTION update_submitted_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'SUBMITTED' AND OLD.status != 'SUBMITTED' THEN
        UPDATE public.talent_profiles
        SET submitted_at = NOW()
        WHERE user_id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Create trigger for submitted_at
DROP TRIGGER IF EXISTS trigger_update_submitted_at ON public.profiles;
CREATE TRIGGER trigger_update_submitted_at
    AFTER UPDATE OF status ON public.profiles
    FOR EACH ROW
    WHEN (NEW.status = 'SUBMITTED' AND OLD.status != 'SUBMITTED')
    EXECUTE FUNCTION update_submitted_at();

-- 8. Verify changes
SELECT 
    column_name, 
    data_type, 
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'profiles'
    AND column_name IN ('status', 'revision_notes', 'country', 'timezone')
ORDER BY column_name;

SELECT 
    column_name, 
    data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'talent_profiles'
    AND column_name IN ('submitted_at', 'intro_video_url', 'portfolio_url')
ORDER BY column_name;
