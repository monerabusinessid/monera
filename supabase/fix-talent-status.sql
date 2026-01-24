-- Script to verify and fix talent_profiles status
-- This script helps debug why status might still be DRAFT after submission

-- 1. First, check if status column exists and its type
SELECT 
    column_name, 
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'talent_profiles'
    AND column_name = 'status';

-- 2. Check all talent_profiles and their status
SELECT 
    id,
    user_id,
    status,
    submitted_at,
    headline,
    profile_completion,
    created_at,
    updated_at
FROM public.talent_profiles
ORDER BY updated_at DESC
LIMIT 10;

-- 3. If status column doesn't exist or is wrong type, fix it
DO $$ 
BEGIN
    -- Ensure status column exists as TEXT
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
        -- Check if it's TEXT type, if not we might need to alter it
        -- But for safety, we'll just ensure it exists
        RAISE NOTICE 'status column already exists in talent_profiles';
    END IF;
    
    -- Ensure submitted_at column exists
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
END $$;

-- 4. Find profiles that have data but status is still DRAFT
-- (These might need to be manually updated to SUBMITTED)
SELECT 
    tp.id,
    tp.user_id,
    tp.status,
    tp.submitted_at,
    tp.headline,
    tp.experience,
    tp.profile_completion,
    tp.updated_at,
    p.full_name,
    p.email
FROM public.talent_profiles tp
LEFT JOIN public.profiles p ON p.id = tp.user_id
WHERE tp.status = 'DRAFT'
    AND (
        tp.headline IS NOT NULL 
        OR tp.experience IS NOT NULL
        OR tp.profile_completion > 0
    )
ORDER BY tp.updated_at DESC;

-- 5. Optional: If you want to manually set status to SUBMITTED for profiles that have data
-- UNCOMMENT THE FOLLOWING LINES AND REPLACE 'USER_ID_HERE' with actual user_id
/*
UPDATE public.talent_profiles
SET 
    status = 'SUBMITTED',
    submitted_at = COALESCE(submitted_at, updated_at, NOW())
WHERE user_id = 'USER_ID_HERE'
    AND status = 'DRAFT'
    AND (
        headline IS NOT NULL 
        OR experience IS NOT NULL
        OR profile_completion > 0
    );
*/

-- 6. Verify the fix
SELECT 
    id,
    user_id,
    status,
    submitted_at,
    updated_at
FROM public.talent_profiles
WHERE status = 'SUBMITTED'
ORDER BY submitted_at DESC
LIMIT 5;
