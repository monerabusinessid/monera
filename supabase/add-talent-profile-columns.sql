-- Add missing columns to talent_profiles table for onboarding
-- This script ensures all required columns exist

DO $$ 
BEGIN
    -- Add experience column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'talent_profiles' 
        AND column_name = 'experience'
    ) THEN
        ALTER TABLE public.talent_profiles 
        ADD COLUMN experience TEXT;
        
        RAISE NOTICE 'Added experience column to talent_profiles';
    ELSE
        RAISE NOTICE 'experience column already exists in talent_profiles';
    END IF;
    
    -- Add intro_video_url column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'talent_profiles' 
        AND column_name = 'intro_video_url'
    ) THEN
        ALTER TABLE public.talent_profiles 
        ADD COLUMN intro_video_url TEXT;
        
        RAISE NOTICE 'Added intro_video_url column to talent_profiles';
    ELSE
        RAISE NOTICE 'intro_video_url column already exists in talent_profiles';
    END IF;
    
    -- Add submitted_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'talent_profiles' 
        AND column_name = 'submitted_at'
    ) THEN
        ALTER TABLE public.talent_profiles 
        ADD COLUMN submitted_at TIMESTAMPTZ;
        
        RAISE NOTICE 'Added submitted_at column to talent_profiles';
    ELSE
        RAISE NOTICE 'submitted_at column already exists in talent_profiles';
    END IF;
    
    -- Add revision_notes column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'talent_profiles' 
        AND column_name = 'revision_notes'
    ) THEN
        ALTER TABLE public.talent_profiles 
        ADD COLUMN revision_notes TEXT;
        
        RAISE NOTICE 'Added revision_notes column to talent_profiles';
    ELSE
        RAISE NOTICE 'revision_notes column already exists in talent_profiles';
    END IF;
    
    -- Ensure headline column exists (for job title)
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'talent_profiles' 
        AND column_name = 'headline'
    ) THEN
        ALTER TABLE public.talent_profiles 
        ADD COLUMN headline TEXT;
        
        RAISE NOTICE 'Added headline column to talent_profiles';
    ELSE
        RAISE NOTICE 'headline column already exists in talent_profiles';
    END IF;
    
    -- Ensure portfolio_url column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'talent_profiles' 
        AND column_name = 'portfolio_url'
    ) THEN
        ALTER TABLE public.talent_profiles 
        ADD COLUMN portfolio_url TEXT;
        
        RAISE NOTICE 'Added portfolio_url column to talent_profiles';
    ELSE
        RAISE NOTICE 'portfolio_url column already exists in talent_profiles';
    END IF;
    
    -- Ensure status column exists and is TEXT (not enum)
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'talent_profiles' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE public.talent_profiles 
        ADD COLUMN status TEXT DEFAULT 'DRAFT';
        
        RAISE NOTICE 'Added status column to talent_profiles';
    ELSE
        -- Check if status is TEXT type, if not, we might need to alter it
        -- But for now, just ensure it exists
        RAISE NOTICE 'status column already exists in talent_profiles';
    END IF;
END $$;

-- Verify all columns exist
SELECT 
    column_name, 
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'talent_profiles'
    AND column_name IN (
        'experience', 
        'intro_video_url', 
        'submitted_at', 
        'revision_notes',
        'headline',
        'portfolio_url',
        'status',
        'user_id',
        'profile_completion'
    )
ORDER BY column_name;
