-- Script untuk menambahkan kolom-kolom yang diperlukan untuk fitur experience
-- (work_history, education, languages, certifications) di table talent_profiles
-- Jalankan script ini di Supabase SQL Editor

DO $$ 
BEGIN
    -- 1. Tambahkan kolom avatar_url (TEXT)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'talent_profiles' 
        AND column_name = 'avatar_url'
    ) THEN
        ALTER TABLE public.talent_profiles 
        ADD COLUMN avatar_url TEXT;
        RAISE NOTICE '✅ Added avatar_url column to talent_profiles';
    ELSE
        RAISE NOTICE 'ℹ️ avatar_url column already exists in talent_profiles';
    END IF;

    -- 2. Tambahkan kolom work_history (JSONB)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'talent_profiles' 
        AND column_name = 'work_history'
    ) THEN
        ALTER TABLE public.talent_profiles 
        ADD COLUMN work_history JSONB DEFAULT '[]'::jsonb;
        RAISE NOTICE '✅ Added work_history column to talent_profiles';
    ELSE
        RAISE NOTICE 'ℹ️ work_history column already exists in talent_profiles';
    END IF;

    -- 3. Tambahkan kolom education (JSONB)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'talent_profiles' 
        AND column_name = 'education'
    ) THEN
        ALTER TABLE public.talent_profiles 
        ADD COLUMN education JSONB DEFAULT '[]'::jsonb;
        RAISE NOTICE '✅ Added education column to talent_profiles';
    ELSE
        RAISE NOTICE 'ℹ️ education column already exists in talent_profiles';
    END IF;

    -- 4. Tambahkan kolom languages (JSONB)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'talent_profiles' 
        AND column_name = 'languages'
    ) THEN
        ALTER TABLE public.talent_profiles 
        ADD COLUMN languages JSONB DEFAULT '[]'::jsonb;
        RAISE NOTICE '✅ Added languages column to talent_profiles';
    ELSE
        RAISE NOTICE 'ℹ️ languages column already exists in talent_profiles';
    END IF;

    -- 5. Tambahkan kolom certifications (JSONB)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'talent_profiles' 
        AND column_name = 'certifications'
    ) THEN
        ALTER TABLE public.talent_profiles 
        ADD COLUMN certifications JSONB DEFAULT '[]'::jsonb;
        RAISE NOTICE '✅ Added certifications column to talent_profiles';
    ELSE
        RAISE NOTICE 'ℹ️ certifications column already exists in talent_profiles';
    END IF;

END $$;

-- Verifikasi kolom-kolom yang baru ditambahkan
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'talent_profiles'
    AND column_name IN ('avatar_url', 'work_history', 'education', 'languages', 'certifications')
ORDER BY column_name;
