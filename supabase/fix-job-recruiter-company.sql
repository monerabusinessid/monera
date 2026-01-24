-- ============================================
-- QUERY 1: Cek jobs yang kurang data recruiter/company
-- ============================================
SELECT 
    j.id as job_id,
    j.title,
    j.recruiter_id,
    j.company_id,
    CASE 
        WHEN j.recruiter_id IS NULL THEN 'Missing recruiter_id'
        WHEN p.id IS NULL THEN 'recruiter_id tidak ada di profiles'
        WHEN p.full_name IS NULL OR p.full_name = '' THEN 'profiles.full_name kosong'
        ELSE 'Recruiter OK: ' || p.full_name
    END as recruiter_status,
    CASE 
        WHEN j.company_id IS NULL THEN 'Missing company_id'
        WHEN c.id IS NULL THEN 'company_id tidak ada di companies'
        WHEN c.name IS NULL OR c.name = '' THEN 'companies.name kosong'
        ELSE 'Company OK: ' || c.name
    END as company_status
FROM public.jobs j
LEFT JOIN public.profiles p ON CAST(p.id AS TEXT) = CAST(j.recruiter_id AS TEXT)
LEFT JOIN public.companies c ON CAST(c.id AS TEXT) = CAST(j.company_id AS TEXT)
WHERE j.status = 'PUBLISHED'
ORDER BY j.created_at DESC
LIMIT 20;

-- ============================================
-- QUERY 2: Lihat data lengkap jobs terbaru
-- ============================================
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
LIMIT 10;

-- ============================================
-- QUERY 3: Cek recruiter yang full_name kosong
-- ============================================
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
HAVING p.full_name IS NULL OR p.full_name = ''
ORDER BY job_count DESC;

-- ============================================
-- QUERY 4: Update full_name dari company name (jika ada)
-- ============================================
-- UNCOMMENT query di bawah ini untuk update otomatis
/*
UPDATE public.profiles p
SET full_name = (
    SELECT c.name 
    FROM public.companies c
    INNER JOIN public.jobs j ON CAST(j.company_id AS TEXT) = CAST(c.id AS TEXT)
    WHERE CAST(j.recruiter_id AS TEXT) = CAST(p.id AS TEXT)
    LIMIT 1
)
WHERE (p.full_name IS NULL OR p.full_name = '')
  AND p.id IN (
      SELECT DISTINCT CAST(recruiter_id AS TEXT) 
      FROM public.jobs 
      WHERE recruiter_id IS NOT NULL
  );
*/

-- ============================================
-- QUERY 5: Update manual full_name untuk recruiter tertentu
-- ============================================
-- GANTI 'recruiter@example.com' dengan email recruiter yang benar
-- GANTI 'Nama Recruiter' dengan nama yang ingin diisi
/*
UPDATE public.profiles
SET full_name = 'Nama Recruiter'
WHERE email = 'recruiter@example.com'
  AND (full_name IS NULL OR full_name = '');
*/
