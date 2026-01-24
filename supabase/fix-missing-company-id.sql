-- ============================================
-- FIX MISSING company_id untuk jobs yang recruiter sudah OK
-- ============================================

-- QUERY 1: Cek jobs yang recruiter OK tapi company_id NULL
SELECT 
    j.id as job_id,
    j.title,
    j.recruiter_id,
    j.company_id,
    p.full_name as recruiter_name,
    rp.company_id as recruiter_profile_company_id,
    c.name as company_name_from_recruiter_profile
FROM public.jobs j
LEFT JOIN public.profiles p ON CAST(p.id AS TEXT) = CAST(j.recruiter_id AS TEXT)
LEFT JOIN public.recruiter_profiles rp ON CAST(rp.user_id AS TEXT) = CAST(j.recruiter_id AS TEXT)
LEFT JOIN public.companies c ON c.id = rp.company_id
WHERE j.status = 'PUBLISHED'
  AND j.company_id IS NULL
  AND p.full_name IS NOT NULL
  AND p.full_name != ''
ORDER BY j.created_at DESC;

-- ============================================
-- QUERY 2: Update company_id dari recruiter_profiles (jika ada)
-- ============================================
-- UNCOMMENT query di bawah ini untuk update otomatis
/*
UPDATE public.jobs j
SET company_id = (
    SELECT rp.company_id
    FROM public.recruiter_profiles rp
    WHERE CAST(rp.user_id AS TEXT) = CAST(j.recruiter_id AS TEXT)
      AND rp.company_id IS NOT NULL
    LIMIT 1
)
WHERE j.company_id IS NULL
  AND j.recruiter_id IN (
      SELECT CAST(user_id AS TEXT) 
      FROM public.recruiter_profiles 
      WHERE company_id IS NOT NULL
  );
*/

-- ============================================
-- QUERY 3: Update company_id manual untuk job tertentu
-- ============================================
-- GANTI 'job-id-di-sini' dengan job_id yang ingin diupdate
-- GANTI 'company-id-di-sini' dengan company_id yang ingin diisi
/*
UPDATE public.jobs
SET company_id = 'company-id-di-sini'::uuid
WHERE id = 'job-id-di-sini'::uuid
  AND company_id IS NULL;
*/

-- ============================================
-- QUERY 4: Cek apakah ada company dengan nama "asus" atau serupa
-- ============================================
SELECT 
    c.id,
    c.name,
    COUNT(j.id) as job_count
FROM public.companies c
LEFT JOIN public.jobs j ON CAST(j.company_id AS TEXT) = CAST(c.id AS TEXT)
WHERE LOWER(c.name) LIKE '%asus%'
   OR LOWER(c.name) LIKE '%samsung%'
GROUP BY c.id, c.name
ORDER BY job_count DESC;

-- ============================================
-- QUERY 5: Buat company baru untuk recruiter "asus" jika belum ada
-- ============================================
-- UNCOMMENT query di bawah ini untuk membuat company baru
/*
INSERT INTO public.companies (id, name, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'asus',
    NOW(),
    NOW()
)
ON CONFLICT DO NOTHING
RETURNING id, name;
*/

-- ============================================
-- QUERY 6: Update company_id untuk semua jobs recruiter "asus" dengan company baru
-- ============================================
-- UNCOMMENT query di bawah ini setelah membuat company di Query 5
-- GANTI 'company-id-dari-query-5' dengan id company yang baru dibuat
/*
UPDATE public.jobs j
SET company_id = 'company-id-dari-query-5'::uuid
FROM public.profiles p
WHERE CAST(j.recruiter_id AS TEXT) = CAST(p.id AS TEXT)
  AND LOWER(p.full_name) = 'asus'
  AND j.company_id IS NULL;
*/
