-- Simple fix: Just ensure talent_profiles has status column
-- This is the safest approach - don't touch profiles.status if it's enum

-- Step 1: Ensure talent_profiles table has status column
DO $$ 
BEGIN
    -- Check if talent_profiles.status exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'talent_profiles' 
        AND column_name = 'status'
    ) THEN
        -- Add status column to talent_profiles
        ALTER TABLE public.talent_profiles 
        ADD COLUMN status TEXT DEFAULT 'PENDING';
        
        RAISE NOTICE 'Added status column to talent_profiles';
    ELSE
        RAISE NOTICE 'talent_profiles.status column already exists';
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
    END IF;
END $$;

-- Step 2: Verify talent_profiles columns
SELECT 
    column_name, 
    data_type,
    udt_name,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'talent_profiles'
    AND column_name IN ('status', 'submitted_at', 'user_id')
ORDER BY column_name;
