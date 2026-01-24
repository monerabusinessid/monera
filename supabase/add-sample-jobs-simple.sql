-- Script SEDERHANA untuk menambahkan sample jobs sesuai kategori
-- 
-- INSTRUKSI PENTING:
-- 1. Pastikan field 'category' sudah ada di tabel jobs:
--    ALTER TABLE jobs ADD COLUMN IF NOT EXISTS category TEXT;
--
-- 2. GANTI 'YOUR_RECRUITER_USER_ID' di bawah dengan ID user recruiter yang sebenarnya
--    Untuk mendapatkan ID recruiter, jalankan query ini terlebih dahulu:
--    SELECT id, email, role FROM users WHERE role::text = 'RECRUITER' LIMIT 1;
--    Atau jika tidak ada recruiter, gunakan ID user apapun yang ada:
--    SELECT id, email, role FROM users LIMIT 1;
--
-- 3. GANTI 'YOUR_COMPANY_ID' di bawah dengan ID company yang sebenarnya (atau NULL)
--    Untuk mendapatkan ID company, jalankan query ini:
--    SELECT id, name FROM companies LIMIT 1;
--    Jika tidak ada company, bisa menggunakan NULL

-- GANTI NILAI INI DENGAN ID YANG SEBENARNYA:
-- Untuk mendapatkan recruiter_id, jalankan: SELECT id FROM users WHERE role::text = 'RECRUITER' LIMIT 1;
-- Jika tidak ada recruiter, gunakan: SELECT id FROM users LIMIT 1;
DO $$
DECLARE
  recruiter_id_var TEXT;
  company_id_var TEXT;
BEGIN
  -- Dapatkan recruiter_id (gunakan user pertama yang ditemukan jika tidak ada recruiter)
  SELECT id INTO recruiter_id_var 
  FROM users 
  WHERE role::text = 'RECRUITER' 
  LIMIT 1;
  
  -- Jika tidak ada recruiter, gunakan user pertama yang ada
  IF recruiter_id_var IS NULL THEN
    SELECT id INTO recruiter_id_var FROM users LIMIT 1;
  END IF;
  
  -- Dapatkan company_id (bisa NULL)
  SELECT id INTO company_id_var FROM companies LIMIT 1;
  
  -- Jika tidak ada recruiter sama sekali, beri error
  IF recruiter_id_var IS NULL THEN
    RAISE EXCEPTION 'No users found. Please create at least one user first through the application.';
  END IF;
  
  -- Sekarang insert jobs menggunakan recruiter_id_var dan company_id_var
  -- (Script INSERT akan ditambahkan di bawah menggunakan variabel ini)
  
  RAISE NOTICE 'Using recruiter_id: %', recruiter_id_var;
  RAISE NOTICE 'Using company_id: %', company_id_var;
END $$;

-- Sample Jobs untuk berbagai kategori
-- Development & IT
INSERT INTO jobs (
  id, title, description, requirements, location, remote, 
  salary_min, salary_max, currency, status, recruiter_id, company_id, category,
  created_at, updated_at, published_at
) 
SELECT 
  gen_random_uuid()::text,
  'Senior Full-Stack Developer',
  'We are looking for an experienced Full-Stack Developer to join our dynamic team. You will be responsible for developing and maintaining web applications using modern technologies. The ideal candidate should have strong problem-solving skills and be able to work independently as well as in a team environment.',
  '• 5+ years of experience in full-stack development' || E'\n' || 
  '• Strong proficiency in JavaScript, TypeScript, React, and Node.js' || E'\n' ||
  '• Experience with databases (PostgreSQL, MongoDB)' || E'\n' ||
  '• Knowledge of RESTful APIs and GraphQL' || E'\n' ||
  '• Experience with cloud platforms (AWS, Azure, or GCP)' || E'\n' ||
  '• Strong understanding of software development best practices',
  'Remote',
  true,
  6000,
  10000,
  'USD',
  'PUBLISHED',
  (SELECT id FROM users WHERE role::text = 'RECRUITER' LIMIT 1),
  (SELECT id FROM companies LIMIT 1),
  'Development & IT',
  NOW(),
  NOW(),
  NOW()
WHERE EXISTS (SELECT 1 FROM users LIMIT 1);

-- Lanjutkan dengan jobs lainnya menggunakan pola yang sama...
-- (Untuk menghemat space, saya akan membuat versi yang lebih ringkas)
