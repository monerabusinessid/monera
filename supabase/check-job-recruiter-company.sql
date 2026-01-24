-- Check which jobs are missing recruiter or company data
-- This will help identify what needs to be filled in

-- 1. Check jobs with missing recruiter data
SELECT 
    j.id as job_id,
    j.title,
    j.recruiter_id,
    j.company_id,
    CASE 
        WHEN j.recruiter_id IS NULL THEN '❌ Missing recruiter_id'
        WHEN p.id IS NULL THEN '❌ recruiter_id tidak ada di profiles table'
        WHEN p.full_name IS NULL OR p.full_name = '' THEN '⚠️ profiles.full_name kosong'
        ELSE '✅ Recruiter OK: ' || p.full_name
    END as recruiter_status,
    CASE 
        WHEN j.company_id IS NULL THEN '❌ Missing company_id'
        WHEN c.id IS NULL THEN '❌ company_id tidak ada di companies table'
        WHEN c.name IS NULL OR c.name = '' THEN '⚠️ companies.name kosong'
        ELSE '✅ Company OK: ' || c.name
    END as company_status
FROM public.jobs j
LEFT JOIN public.profiles p ON CAST(p.id AS TEXT) = CAST(j.recruiter_id AS TEXT)
LEFT JOIN public.companies c ON CAST(c.id AS TEXT) = CAST(j.company_id AS TEXT)
WHERE j.status = 'PUBLISHED'
ORDER BY j.created_at DESC
LIMIT 20;

-- 2. Show example of a job with complete data
SELECT 
    j.id as job_id,
    j.title,
    j.recruiter_id,
    j.company_id,
    p.full_name as recruiter_name,
    au.email as recruiter_email,
    c.name as company_name
FROM public.jobs j
LEFT JOIN public.profiles p ON CAST(p.id AS TEXT) = CAST(j.recruiter_id AS TEXT)
LEFT JOIN auth.users au ON au.id::text = CAST(j.recruiter_id AS TEXT)
LEFT JOIN public.companies c ON CAST(c.id AS TEXT) = CAST(j.company_id AS TEXT)
WHERE j.status = 'PUBLISHED'
ORDER BY j.created_at DESC
LIMIT 5;

-- 3. Check what data exists in profiles table for recruiters
SELECT 
    p.id,
    au.email,
    p.full_name,
    COUNT(j.id) as job_count
FROM public.profiles p
LEFT JOIN auth.users au ON au.id = p.id
LEFT JOIN public.jobs j ON CAST(j.recruiter_id AS TEXT) = CAST(p.id AS TEXT)
WHERE CAST(p.id AS TEXT) IN (
    SELECT DISTINCT CAST(recruiter_id AS TEXT) 
    FROM public.jobs 
    WHERE recruiter_id IS NOT NULL
)
GROUP BY p.id, au.email, p.full_name
ORDER BY job_count DESC;

-- 4. Check what data exists in companies table
SELECT 
    c.id,
    c.name,
    COUNT(j.id) as job_count
FROM public.companies c
LEFT JOIN public.jobs j ON CAST(j.company_id AS TEXT) = CAST(c.id AS TEXT)
GROUP BY c.id, c.name
ORDER BY job_count DESC;
