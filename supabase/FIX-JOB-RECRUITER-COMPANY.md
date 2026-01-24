# Cara Memperbaiki "No company" di Job Listings

## Masalah
Job listings menampilkan "No company" padahal di admin sudah muncul nama recruiter/company (misalnya "asus" atau "OpenAI").

## Data yang Perlu Diisi

### 1. Tabel `jobs`
Setiap job harus memiliki:
- **`recruiter_id`** → ID dari `profiles` table (user yang membuat job)
- **`company_id`** → ID dari `companies` table (optional, tapi lebih baik diisi)

### 2. Tabel `profiles` (untuk recruiter)
Setiap recruiter harus memiliki:
- **`full_name`** → Nama lengkap recruiter (misalnya "asus", "OpenAI", dll)
- **`email`** → Email recruiter

### 3. Tabel `companies` (optional tapi recommended)
Setiap company harus memiliki:
- **`name`** → Nama perusahaan (misalnya "Samsung", "OpenAI", dll)

## Cara Cek Data yang Kurang

Jalankan query SQL berikut di Supabase SQL Editor:

```sql
-- Cek jobs yang missing recruiter atau company data
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
ORDER BY j.created_at DESC;
```

## Cara Memperbaiki

### Opsi 1: Update `profiles.full_name` untuk recruiter yang sudah ada

```sql
-- Update full_name untuk recruiter yang sudah punya job tapi full_name kosong
UPDATE public.profiles p
SET full_name = (
    SELECT c.name 
    FROM public.companies c
    INNER JOIN public.jobs j ON CAST(j.company_id AS TEXT) = CAST(c.id AS TEXT)
    WHERE CAST(j.recruiter_id AS TEXT) = CAST(p.id AS TEXT)
    LIMIT 1
)
WHERE p.full_name IS NULL 
  AND p.id IN (SELECT DISTINCT CAST(recruiter_id AS TEXT) FROM public.jobs WHERE recruiter_id IS NOT NULL);
```

### Opsi 2: Update `jobs.company_id` dari recruiter profile

```sql
-- Update company_id di jobs dari recruiter_profiles jika ada
UPDATE public.jobs j
SET company_id = (
    SELECT rp.company_id
    FROM public.recruiter_profiles rp
    WHERE CAST(rp.user_id AS TEXT) = CAST(j.recruiter_id AS TEXT)
    LIMIT 1
)
WHERE j.company_id IS NULL
  AND j.recruiter_id IN (
      SELECT CAST(user_id AS TEXT) 
      FROM public.recruiter_profiles 
      WHERE company_id IS NOT NULL
  );
```

### Opsi 3: Update `profiles.full_name` manual untuk recruiter tertentu

```sql
-- Contoh: Update full_name untuk recruiter dengan email tertentu
UPDATE public.profiles
SET full_name = 'asus'  -- atau 'OpenAI', 'Samsung', dll
WHERE email = 'recruiter@example.com'
  AND (full_name IS NULL OR full_name = '');
```

## Prioritas Data yang Ditampilkan

Frontend akan menampilkan nama dengan urutan prioritas:
1. `company.name` (jika ada)
2. `recruiter.name` (dari `profiles.full_name`)
3. `recruiter.email` (jika name tidak ada)
4. "No company" (jika semua kosong)

Jadi pastikan minimal salah satu dari ini terisi:
- `companies.name` untuk job tersebut, ATAU
- `profiles.full_name` untuk recruiter yang membuat job tersebut
