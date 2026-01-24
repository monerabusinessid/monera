-- Script to debug profile completion issue
-- This script helps identify why profileCompletion is showing 0% instead of the correct value

-- Step 1: Check user and profile data for barbie@monera.com
SELECT 
    'Step 1: User and Profile Data' as step,
    au.id::text as auth_user_id,
    au.email,
    p.id as profile_id,
    p.full_name,
    tp.id as talent_profile_id,
    tp.user_id as talent_profile_user_id,
    tp.profile_completion,
    tp.status,
    CASE 
        WHEN CAST(p.id AS TEXT) = CAST(au.id AS TEXT) THEN 'MATCH'
        ELSE 'NO_MATCH'
    END as profile_user_match,
    CASE 
        WHEN CAST(tp.user_id AS TEXT) = CAST(au.id AS TEXT) THEN 'MATCH'
        ELSE 'NO_MATCH'
    END as talent_profile_user_match
FROM auth.users au
LEFT JOIN public.profiles p ON CAST(p.id AS TEXT) = CAST(au.id AS TEXT)
LEFT JOIN public.talent_profiles tp ON CAST(tp.user_id AS TEXT) = CAST(au.id AS TEXT)
WHERE au.email = 'barbie@monera.com';

-- Step 2: Check all talent_profiles and their user_ids
SELECT 
    'Step 2: All Talent Profiles' as step,
    tp.id,
    tp.user_id,
    tp.user_id::text as user_id_text,
    tp.profile_completion,
    tp.status,
    tp.headline,
    p.full_name,
    au.email
FROM public.talent_profiles tp
LEFT JOIN public.profiles p ON CAST(p.id AS TEXT) = CAST(tp.user_id AS TEXT)
LEFT JOIN auth.users au ON CAST(au.id AS TEXT) = CAST(tp.user_id AS TEXT)
ORDER BY tp.updated_at DESC
LIMIT 10;

-- Step 3: Check specific user_id types
SELECT 
    'Step 3: User ID Type Check' as step,
    au.id as auth_id,
    pg_typeof(au.id) as auth_id_type,
    p.id as profile_id,
    pg_typeof(p.id) as profile_id_type,
    tp.user_id as talent_user_id,
    pg_typeof(tp.user_id) as talent_user_id_type,
    CAST(au.id AS TEXT) as auth_id_text,
    CAST(tp.user_id AS TEXT) as talent_user_id_text,
    CASE 
        WHEN CAST(au.id AS TEXT) = CAST(tp.user_id AS TEXT) THEN 'MATCH'
        ELSE 'NO_MATCH'
    END as match_result
FROM auth.users au
LEFT JOIN public.profiles p ON CAST(p.id AS TEXT) = CAST(au.id AS TEXT)
LEFT JOIN public.talent_profiles tp ON CAST(tp.user_id AS TEXT) = CAST(au.id AS TEXT)
WHERE au.email = 'barbie@monera.com';

-- Step 4: Direct query to find talent_profile by user_id (simulating API query)
-- Replace 'USER_ID_HERE' with the actual user_id from Step 1
SELECT 
    'Step 4: Direct Query Test' as step,
    tp.*
FROM public.talent_profiles tp
WHERE CAST(tp.user_id AS TEXT) = (
    SELECT CAST(id AS TEXT) FROM auth.users WHERE email = 'barbie@monera.com'
);

-- Step 5: Check profile_completion values
SELECT 
    'Step 5: Profile Completion Values' as step,
    tp.id,
    tp.user_id,
    tp.profile_completion,
    pg_typeof(tp.profile_completion) as completion_type,
    CASE 
        WHEN tp.profile_completion IS NULL THEN 'NULL'
        WHEN tp.profile_completion = 0 THEN 'ZERO'
        WHEN tp.profile_completion > 0 THEN 'HAS_VALUE'
        ELSE 'OTHER'
    END as completion_status,
    au.email
FROM public.talent_profiles tp
LEFT JOIN auth.users au ON CAST(au.id AS TEXT) = CAST(tp.user_id AS TEXT)
WHERE au.email = 'barbie@monera.com';
