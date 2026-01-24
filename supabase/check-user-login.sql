-- Script to check and fix user login issues
-- This helps diagnose why login is failing with 401

-- Step 1: Check if user exists in Supabase Auth (auth.users)
-- Note: You may need to check this in Supabase Dashboard > Authentication > Users
-- This query checks the profiles table which should have a matching record

-- Step 2: Check if profile exists in profiles table
SELECT 
    p.id,
    p.full_name,
    p.role,
    p.status,
    p.created_at,
    -- Check if user exists in auth.users (if accessible)
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id::text = p.id::text
        ) THEN 'EXISTS'
        ELSE 'NOT_FOUND'
    END as auth_user_status
FROM public.profiles p
WHERE p.id IN (
    SELECT id FROM auth.users WHERE email = 'charlie@monera.com'
    UNION
    SELECT id::text FROM public.profiles WHERE id LIKE '%charlie%' OR full_name ILIKE '%charlie%'
)
LIMIT 10;

-- Step 3: Check all profiles and their auth status
SELECT 
    p.id,
    p.full_name,
    p.role,
    p.status,
    p.created_at
FROM public.profiles p
ORDER BY p.created_at DESC
LIMIT 20;

-- Step 4: If profile exists but user can't login, check:
-- - Is the email confirmed in Supabase Auth?
-- - Does the password match?
-- - Is the account suspended?

-- Step 5: Create a test profile if user exists in auth but not in profiles
-- UNCOMMENT AND MODIFY IF NEEDED:
/*
DO $$
DECLARE
    auth_user_id TEXT;
    auth_user_email TEXT;
BEGIN
    -- Get user from auth.users
    SELECT id::text, email INTO auth_user_id, auth_user_email
    FROM auth.users
    WHERE email = 'charlie@monera.com'
    LIMIT 1;
    
    IF auth_user_id IS NOT NULL THEN
        -- Check if profile exists
        IF NOT EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth_user_id
        ) THEN
            -- Create profile
            INSERT INTO public.profiles (id, full_name, role, status, created_at, updated_at)
            VALUES (
                auth_user_id,
                COALESCE((SELECT full_name FROM auth.users WHERE id::text = auth_user_id), 'User'),
                'TALENT',
                'ACTIVE',
                NOW(),
                NOW()
            );
            RAISE NOTICE 'Created profile for user: %', auth_user_email;
        ELSE
            RAISE NOTICE 'Profile already exists for user: %', auth_user_email;
        END IF;
    ELSE
        RAISE NOTICE 'User not found in auth.users: charlie@monera.com';
    END IF;
END $$;
*/
