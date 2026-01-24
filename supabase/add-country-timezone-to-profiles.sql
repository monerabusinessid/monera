-- Add country and timezone columns to profiles table if they don't exist
-- This is needed for talent onboarding

DO $$ 
BEGIN
    -- Add country column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'country'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN country TEXT;
        
        RAISE NOTICE 'Added country column to profiles';
    ELSE
        RAISE NOTICE 'country column already exists in profiles';
    END IF;
    
    -- Add timezone column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'timezone'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN timezone TEXT;
        
        RAISE NOTICE 'Added timezone column to profiles';
    ELSE
        RAISE NOTICE 'timezone column already exists in profiles';
    END IF;
END $$;

-- Verify columns exist
SELECT 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'profiles'
    AND column_name IN ('country', 'timezone')
ORDER BY column_name;
