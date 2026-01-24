-- Fix profiles.status column to support talent onboarding statuses
-- Run this in Supabase SQL Editor

-- Step 1: Check current column type
DO $$ 
DECLARE
    current_type TEXT;
    current_udt TEXT;
BEGIN
    SELECT data_type, udt_name INTO current_type, current_udt
    FROM information_schema.columns
    WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'status';
    
    RAISE NOTICE 'Current status column - data_type: %, udt_name: %', current_type, current_udt;
END $$;

-- Step 2: Handle status column based on its current type
DO $$ 
DECLARE
    status_udt TEXT;
    status_data_type TEXT;
    enum_exists BOOLEAN;
BEGIN
    -- Get current status column type
    SELECT udt_name, data_type INTO status_udt, status_data_type
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'status';
    
    -- Check if UserStatus enum exists
    SELECT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserStatus') INTO enum_exists;
    
    IF status_udt = 'UserStatus' THEN
        -- Status is enum UserStatus - create profile_status column for onboarding
        RAISE NOTICE 'Status column is enum UserStatus, creating profile_status column';
        
        -- Create enum if it doesn't exist (needed for UPDATE statement)
        IF NOT enum_exists THEN
            CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION');
            RAISE NOTICE 'Created UserStatus enum';
            enum_exists := TRUE; -- Update flag after creating
        END IF;
        
        IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'profiles' 
            AND column_name = 'profile_status'
        ) THEN
            ALTER TABLE public.profiles 
            ADD COLUMN profile_status TEXT DEFAULT 'DRAFT';
            
            -- Copy existing status values (convert enum to text)
            -- Use text comparison to avoid enum casting issues
            UPDATE public.profiles 
            SET profile_status = CASE 
                WHEN status::text = 'ACTIVE' THEN 'DRAFT'
                WHEN status::text = 'SUSPENDED' THEN 'DRAFT'
                WHEN status::text = 'PENDING_VERIFICATION' THEN 'DRAFT'
                ELSE 'DRAFT'
            END;
            
            RAISE NOTICE 'Created profile_status column and migrated data';
        END IF;
        
        -- Keep the original status column for user account status (ACTIVE/SUSPENDED)
        -- Only update NULL values to ACTIVE (if enum exists and was created)
        IF enum_exists THEN
            BEGIN
                UPDATE public.profiles 
                SET status = 'ACTIVE'::UserStatus
                WHERE status IS NULL;
                
                RAISE NOTICE 'Updated NULL status values to ACTIVE';
            EXCEPTION
                WHEN OTHERS THEN
                    RAISE NOTICE 'Could not update status (enum may not be compatible): %', SQLERRM;
            END;
        ELSE
            RAISE NOTICE 'UserStatus enum does not exist, skipping status update';
        END IF;
        
    ELSIF status_data_type = 'text' THEN
        -- Status is already TEXT, we can use it directly
        RAISE NOTICE 'Status column is already TEXT, can be used for profile status';
        
        -- Update existing records to have DRAFT if they have invalid values for talent
        UPDATE public.profiles 
        SET status = 'DRAFT'
        WHERE role = 'TALENT' 
        AND (status IS NULL OR status NOT IN ('DRAFT', 'SUBMITTED', 'NEED_REVISION', 'APPROVED', 'REJECTED', 'ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION'));
        
        RAISE NOTICE 'Updated TEXT status column for talent users';
    ELSE
        RAISE NOTICE 'Status column type: % (udt: %), no changes made', status_data_type, status_udt;
    END IF;
END $$;

-- Step 4: Ensure talent_profiles table has status column
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

-- Step 5: Create index on profile_status if it exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles' 
        AND column_name = 'profile_status'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_profiles_profile_status ON public.profiles(profile_status) 
        WHERE profile_status IS NOT NULL;
        RAISE NOTICE 'Created index on profile_status';
    END IF;
END $$;

-- Step 6: Verify the changes
SELECT 
    column_name, 
    data_type,
    udt_name,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'profiles'
    AND column_name IN ('status', 'profile_status')
ORDER BY column_name;

-- Also check talent_profiles
SELECT 
    column_name, 
    data_type,
    udt_name,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'talent_profiles'
    AND column_name IN ('status', 'submitted_at')
ORDER BY column_name;
