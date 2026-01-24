-- ============================================
-- SOLUSI: Buat company untuk recruiter yang belum punya company_id
-- ============================================

-- STEP 1: Cek apakah company "asus" dan "samsung" sudah ada
SELECT 
    id,
    name,
    created_at
FROM public.companies
WHERE LOWER(name) IN ('asus', 'samsung')
ORDER BY name;

-- ============================================
-- STEP 2: Buat company "asus" jika belum ada
-- ============================================
INSERT INTO public.companies (id, name, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    'asus',
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM public.companies WHERE LOWER(name) = 'asus'
)
RETURNING id, name;

-- ============================================
-- STEP 3: Buat company "samsung" jika belum ada
-- ============================================
INSERT INTO public.companies (id, name, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    'samsung',
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM public.companies WHERE LOWER(name) = 'samsung'
)
RETURNING id, name;

-- ============================================
-- STEP 4: Update jobs untuk recruiter "asus" dengan company "asus"
-- ============================================
UPDATE public.jobs j
SET company_id = (
    SELECT c.id 
    FROM public.companies c 
    WHERE LOWER(c.name) = 'asus'
    LIMIT 1
)
FROM public.profiles p
WHERE CAST(j.recruiter_id AS TEXT) = CAST(p.id AS TEXT)
  AND LOWER(p.full_name) = 'asus'
  AND j.company_id IS NULL
RETURNING j.id, j.title, j.company_id;

-- ============================================
-- STEP 5: Update jobs untuk recruiter "samsung" dengan company "samsung"
-- ============================================
UPDATE public.jobs j
SET company_id = (
    SELECT c.id 
    FROM public.companies c 
    WHERE LOWER(c.name) = 'samsung'
    LIMIT 1
)
FROM public.profiles p
WHERE CAST(j.recruiter_id AS TEXT) = CAST(p.id AS TEXT)
  AND LOWER(p.full_name) = 'samsung'
  AND j.company_id IS NULL
RETURNING j.id, j.title, j.company_id;

-- ============================================
-- STEP 6: Update recruiter_profiles untuk link ke company (optional)
-- ============================================
-- Update recruiter_profiles untuk "asus"
UPDATE public.recruiter_profiles rp
SET company_id = (
    SELECT c.id 
    FROM public.companies c 
    WHERE LOWER(c.name) = 'asus'
    LIMIT 1
)
FROM public.profiles p
WHERE CAST(rp.user_id AS TEXT) = CAST(p.id AS TEXT)
  AND LOWER(p.full_name) = 'asus'
  AND rp.company_id IS NULL;

-- Update recruiter_profiles untuk "samsung"
UPDATE public.recruiter_profiles rp
SET company_id = (
    SELECT c.id 
    FROM public.companies c 
    WHERE LOWER(c.name) = 'samsung'
    LIMIT 1
)
FROM public.profiles p
WHERE CAST(rp.user_id AS TEXT) = CAST(p.id AS TEXT)
  AND LOWER(p.full_name) = 'samsung'
  AND rp.company_id IS NULL;

-- ============================================
-- STEP 7: Verifikasi hasil update
-- ============================================
SELECT 
    j.id as job_id,
    j.title,
    j.recruiter_id,
    j.company_id,
    p.full_name as recruiter_name,
    c.name as company_name
FROM public.jobs j
LEFT JOIN public.profiles p ON CAST(p.id AS TEXT) = CAST(j.recruiter_id AS TEXT)
LEFT JOIN public.companies c ON CAST(c.id AS TEXT) = CAST(j.company_id AS TEXT)
WHERE j.status = 'PUBLISHED'
  AND LOWER(p.full_name) IN ('asus', 'samsung')
ORDER BY j.created_at DESC;
