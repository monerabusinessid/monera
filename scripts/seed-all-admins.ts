import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

interface AdminUser {
  email: string
  password: string
  name: string
  role: 'SUPER_ADMIN' | 'QUALITY_ADMIN' | 'SUPPORT_ADMIN' | 'ANALYST'
}

const adminUsers: AdminUser[] = [
  {
    email: 'superadmin@monera.com',
    password: 'SuperAdmin123!',
    name: 'Super Admin',
    role: 'SUPER_ADMIN',
  },
  {
    email: 'quality@monera.com',
    password: 'Quality123!',
    name: 'Quality Admin',
    role: 'QUALITY_ADMIN',
  },
  {
    email: 'support@monera.com',
    password: 'Support123!',
    name: 'Support Admin',
    role: 'SUPPORT_ADMIN',
  },
  {
    email: 'analyst@monera.com',
    password: 'Analyst123!',
    name: 'Analyst',
    role: 'ANALYST',
  },
]

async function createAdminUser(admin: AdminUser) {
  try {
    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existingUser = existingUsers?.users.find((u) => u.email === admin.email)

    let userId: string

    if (existingUser) {
      console.log(`⚠️  User ${admin.email} already exists, updating profile...`)
      userId = existingUser.id

      // Update password
      await supabase.auth.admin.updateUserById(userId, {
        password: admin.password,
      })
    } else {
      // Create auth user
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: admin.email,
        password: admin.password,
        email_confirm: true,
      })

      if (authError) throw authError
      if (!authUser.user) throw new Error('Failed to create user')

      userId = authUser.user.id
      console.log(`✅ Created auth user: ${admin.email}`)
    }

    // Create/Update profile
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: userId,
      full_name: admin.name,
      role: admin.role,
      status: 'ACTIVE',
    })

    if (profileError) throw profileError

    console.log(`✅ Profile created/updated: ${admin.email} (${admin.role})`)
    return { success: true, email: admin.email, role: admin.role }
  } catch (error) {
    console.error(`❌ Error creating ${admin.email}:`, error)
    return { success: false, email: admin.email, error }
  }
}

async function main() {
  console.log('🌱 Seeding all admin users...\n')

  const results = await Promise.all(adminUsers.map(createAdminUser))

  console.log('\n📋 Summary:')
  console.log('='.repeat(50))

  results.forEach((result) => {
    if (result.success) {
      const admin = adminUsers.find((a) => a.email === result.email)!
      console.log(`✅ ${result.email}`)
      console.log(`   Role: ${result.role}`)
      console.log(`   Password: ${admin.password}`)
      console.log('')
    } else {
      console.log(`❌ ${result.email}: Failed`)
      console.log('')
    }
  })

  console.log('='.repeat(50))
  console.log('\n📝 Login credentials:')
  console.log('')
  adminUsers.forEach((admin) => {
    console.log(`${admin.role}:`)
    console.log(`  Email: ${admin.email}`)
    console.log(`  Password: ${admin.password}`)
    console.log('')
  })

  console.log('✅ Done! You can now test admin roles.')
}

main().catch((e) => {
  console.error('❌ Fatal error:', e)
  process.exit(1)
})
