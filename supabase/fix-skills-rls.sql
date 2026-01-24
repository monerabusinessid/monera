-- Fix RLS (Row Level Security) untuk table skills
-- Script ini memastikan semua user bisa membaca skills

-- Disable RLS untuk table skills (untuk development/testing)
-- Atau buat policy yang mengizinkan semua user membaca skills

-- Option 1: Disable RLS (untuk development)
ALTER TABLE public.skills DISABLE ROW LEVEL SECURITY;

-- Option 2: Enable RLS dengan policy yang mengizinkan semua user membaca (untuk production)
-- ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
-- 
-- DROP POLICY IF EXISTS "Allow public read access to skills" ON public.skills;
-- CREATE POLICY "Allow public read access to skills"
--   ON public.skills
--   FOR SELECT
--   USING (true);

-- Verifikasi
SELECT 
  tablename, 
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'skills';
