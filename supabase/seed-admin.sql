-- ============================================
-- SEED SUPER_ADMIN USER
-- ============================================
-- Run this AFTER creating a user via Supabase Auth
-- ============================================

-- Step 1: Create user via Supabase Auth Dashboard
-- Go to Authentication > Users > Add User
-- Email: admin@monera.com
-- Password: (set a strong password)
-- Auto Confirm User: Yes

-- Step 2: Get the user ID from auth.users
-- Then run this SQL (replace USER_ID with actual UUID):

-- INSERT INTO public.profiles (id, full_name, role, status)
-- VALUES (
--     'USER_ID_FROM_AUTH_USERS',  -- Replace with actual user ID
--     'Super Admin',
--     'SUPER_ADMIN',
--     'ACTIVE'
-- )
-- ON CONFLICT (id) DO UPDATE
-- SET role = 'SUPER_ADMIN',
--     status = 'ACTIVE';

-- ============================================
-- ALTERNATIVE: Create via Supabase Admin API
-- ============================================

-- Use Supabase Admin API to create user and profile
-- This requires SUPABASE_SERVICE_ROLE_KEY

-- Example Node.js script:
/*
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function createSuperAdmin() {
  // Create auth user
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: 'admin@monera.com',
    password: 'your-strong-password',
    email_confirm: true,
  })

  if (authError) throw authError

  // Create profile
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authUser.user.id,
      full_name: 'Super Admin',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
    })

  if (profileError) throw profileError

  console.log('✅ Super Admin created:', authUser.user.email)
}

createSuperAdmin()
*/
