-- Script untuk mengecek kolom-kolom di table talent_profiles
-- Jalankan script ini di Supabase SQL Editor untuk melihat struktur table

-- 1. Cek semua kolom yang ada di talent_profiles
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'talent_profiles'
ORDER BY ordinal_position;

-- 2. Cek apakah kolom-kolom yang diperlukan sudah ada
SELECT 
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'talent_profiles' 
        AND column_name = 'avatar_url'
    ) THEN '✅ avatar_url EXISTS' ELSE '❌ avatar_url MISSING' END as avatar_url_check,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'talent_profiles' 
        AND column_name = 'work_history'
    ) THEN '✅ work_history EXISTS' ELSE '❌ work_history MISSING' END as work_history_check,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'talent_profiles' 
        AND column_name = 'education'
    ) THEN '✅ education EXISTS' ELSE '❌ education MISSING' END as education_check,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'talent_profiles' 
        AND column_name = 'languages'
    ) THEN '✅ languages EXISTS' ELSE '❌ languages MISSING' END as languages_check,
    
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'talent_profiles' 
        AND column_name = 'certifications'
    ) THEN '✅ certifications EXISTS' ELSE '❌ certifications MISSING' END as certifications_check;

-- 3. Cek tipe data kolom-kolom JSONB (jika ada)
SELECT 
    column_name,
    data_type,
    udt_name
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'talent_profiles'
    AND column_name IN ('work_history', 'education', 'languages', 'certifications');
