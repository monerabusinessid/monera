-- Add additional profile fields to profiles table if they don't exist
-- This includes: bio, phone, location, linked_in_url, github_url
-- These fields are used in the enhanced onboarding process

DO $$ 
BEGIN
    -- Add bio column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'bio'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN bio TEXT;
        
        RAISE NOTICE 'Added bio column to profiles';
    ELSE
        RAISE NOTICE 'bio column already exists in profiles';
    END IF;
    
    -- Add phone column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'phone'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN phone TEXT;
        
        RAISE NOTICE 'Added phone column to profiles';
    ELSE
        RAISE NOTICE 'phone column already exists in profiles';
    END IF;
    
    -- Add location column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'location'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN location TEXT;
        
        RAISE NOTICE 'Added location column to profiles';
    ELSE
        RAISE NOTICE 'location column already exists in profiles';
    END IF;
    
    -- Add linked_in_url column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'linked_in_url'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN linked_in_url TEXT;
        
        RAISE NOTICE 'Added linked_in_url column to profiles';
    ELSE
        RAISE NOTICE 'linked_in_url column already exists in profiles';
    END IF;
    
    -- Add github_url column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'github_url'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN github_url TEXT;
        
        RAISE NOTICE 'Added github_url column to profiles';
    ELSE
        RAISE NOTICE 'github_url column already exists in profiles';
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
    AND column_name IN ('bio', 'phone', 'location', 'linked_in_url', 'github_url')
ORDER BY column_name;
