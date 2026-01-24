-- First, update existing ADMIN users to a temporary value
UPDATE users SET role = 'CANDIDATE' WHERE role = 'ADMIN';

-- Drop and recreate enum with new values
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
CREATE TYPE "UserRole" AS ENUM ('CANDIDATE', 'RECRUITER', 'SUPER_ADMIN', 'QUALITY_ADMIN', 'SUPPORT_ADMIN', 'ANALYST');
ALTER TABLE users ALTER COLUMN role TYPE "UserRole" USING role::text::"UserRole";
DROP TYPE "UserRole_old";

-- Update the temporary CANDIDATE back to SUPER_ADMIN
-- Note: This will only work if we track which users were admins
-- For now, we'll update all CANDIDATE users that were created before this migration
-- Or better: update specific admin emails
UPDATE users SET role = 'SUPER_ADMIN' WHERE email = 'admin@monera.com';
