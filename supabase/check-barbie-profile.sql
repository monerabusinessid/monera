-- Script to check and verify profile data for barbie@monera.com

-- Step 1: Check if user exists in auth.users
SELECT 
    id::text as user_id,
    email,
    email_confirmed_at,
    created_at
FROM auth.users
WHERE email = 'barbie@monera.com';

-- Step 2: Check if profile exists in profiles table
SELECT 
    p.id,
    p.full_name,
    p.country,
    p.timezone,
    p.bio,
    p.phone,
    p.location,
    p.linked_in_url,
    p.github_url,
    p.created_at
FROM public.profiles p
WHERE CAST(p.id AS TEXT) IN (
    SELECT id::text FROM auth.users WHERE email = 'barbie@monera.com'
);

-- Step 3: Check if talent_profile exists
SELECT 
    tp.id,
    tp.user_id,
    tp.headline,
    tp.experience,
    tp.portfolio_url,
    tp.intro_video_url,
    tp.status,
    tp.profile_completion,
    tp.submitted_at,
    tp.created_at,
    tp.updated_at
FROM public.talent_profiles tp
WHERE CAST(tp.user_id AS TEXT) IN (
    SELECT id::text FROM auth.users WHERE email = 'barbie@monera.com'
);

-- Step 4: Check skills for this user
SELECT 
    s.id,
    s.name,
    cs."A" as talent_profile_id
FROM public.skills s
INNER JOIN public."_CandidateSkills" cs ON cs."B" = s.id
WHERE CAST(cs."A" AS TEXT) IN (
    SELECT CAST(tp.id AS TEXT)
    FROM public.talent_profiles tp
    WHERE CAST(tp.user_id AS TEXT) IN (
        SELECT id::text FROM auth.users WHERE email = 'barbie@monera.com'
    )
);

-- Step 5: Summary - Check all data together
SELECT 
    au.id::text as user_id,
    au.email,
    CASE WHEN p.id IS NOT NULL THEN 'YES' ELSE 'NO' END as has_profile,
    CASE WHEN tp.id IS NOT NULL THEN 'YES' ELSE 'NO' END as has_talent_profile,
    p.full_name,
    tp.headline,
    tp.status,
    tp.profile_completion,
    (SELECT COUNT(*) FROM public."_CandidateSkills" cs WHERE CAST(cs."A" AS TEXT) = CAST(tp.id AS TEXT)) as skills_count
FROM auth.users au
LEFT JOIN public.profiles p ON CAST(p.id AS TEXT) = CAST(au.id AS TEXT)
LEFT JOIN public.talent_profiles tp ON CAST(tp.user_id AS TEXT) = CAST(au.id AS TEXT)
WHERE au.email = 'barbie@monera.com';
