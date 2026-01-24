-- Script to create missing profiles for users that exist in Supabase Auth
-- This fixes the issue where users can't login because profile doesn't exist in profiles table

-- Step 1: Check which users exist in auth.users but don't have profiles
SELECT 
    au.id::text as user_id,
    au.email,
    au.created_at as auth_created_at,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = au.id::text
        ) THEN 'HAS_PROFILE'
        ELSE 'MISSING_PROFILE'
    END as profile_status,
    (SELECT role FROM public.profiles WHERE id = au.id::text LIMIT 1) as profile_role,
    (SELECT status FROM public.profiles WHERE id = au.id::text LIMIT 1) as profile_status_value
FROM auth.users au
ORDER BY au.created_at DESC;

-- Step 2: Create missing profiles for all users in auth.users
DO $$
DECLARE
    auth_user RECORD;
    profile_count INTEGER;
BEGIN
    FOR auth_user IN 
        SELECT 
            id::text as user_id,
            email,
            raw_user_meta_data->>'role' as meta_role,
            created_at
        FROM auth.users
        WHERE NOT EXISTS (
            SELECT 1 FROM public.profiles WHERE id = auth.users.id::text
        )
    LOOP
        -- Determine role from metadata or default to TALENT
        DECLARE
            user_role TEXT := COALESCE(
                auth_user.meta_role,
                'TALENT'
            );
        BEGIN
            -- Create profile
            INSERT INTO public.profiles (
                id,
                full_name,
                role,
                status,
                created_at,
                updated_at
            )
            VALUES (
                auth_user.user_id,
                COALESCE(
                    (auth_user.meta_role->>'full_name')::text,
                    SPLIT_PART(auth_user.email, '@', 1)
                ),
                user_role,
                'ACTIVE',
                auth_user.created_at,
                NOW()
            )
            ON CONFLICT (id) DO NOTHING;
            
            RAISE NOTICE 'Created profile for user: % (role: %)', auth_user.email, user_role;
        END;
    END LOOP;
    
    -- Count created profiles
    SELECT COUNT(*) INTO profile_count
    FROM public.profiles
    WHERE id IN (SELECT auth.users.id::text FROM auth.users);
    
    RAISE NOTICE 'Total profiles: %', profile_count;
END $$;

-- Step 3: Verify all users now have profiles
SELECT 
    au.id::text as user_id,
    au.email,
    (SELECT role FROM public.profiles WHERE id = au.id::text LIMIT 1) as role,
    (SELECT status FROM public.profiles WHERE id = au.id::text LIMIT 1) as status,
    (SELECT full_name FROM public.profiles WHERE id = au.id::text LIMIT 1) as full_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = au.id::text
        ) THEN 'OK'
        ELSE 'MISSING'
    END as profile_status
FROM auth.users au
ORDER BY au.email;

-- Step 4: Specifically check charlie@monera.com
SELECT 
    au.id::text as user_id,
    au.email,
    au.email_confirmed_at,
    (SELECT id FROM public.profiles WHERE id = au.id::text LIMIT 1) as profile_id,
    (SELECT full_name FROM public.profiles WHERE id = au.id::text LIMIT 1) as full_name,
    (SELECT role FROM public.profiles WHERE id = au.id::text LIMIT 1) as role,
    (SELECT status FROM public.profiles WHERE id = au.id::text LIMIT 1) as status
FROM auth.users au
WHERE au.email = 'charlie@monera.com';
