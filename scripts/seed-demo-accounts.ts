import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load .env file
dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  console.error('\n💡 Make sure you have a .env file with these variables set.')
  console.error('   See ENV_SETUP.md for instructions.\n')
  process.exit(1)
}

// Validate URL format
if (!supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
  console.error('❌ Invalid NEXT_PUBLIC_SUPABASE_URL format')
  console.error('   URL should start with http:// or https://')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

interface DemoUser {
  email: string
  password: string
  name: string
  role: 'SUPER_ADMIN' | 'QUALITY_ADMIN' | 'SUPPORT_ADMIN' | 'ANALYST' | 'RECRUITER' | 'TALENT'
}

const demoUsers: DemoUser[] = [
  // Admin Roles
  {
    email: 'admin@monera.com',
    password: 'demo123',
    name: 'Super Admin',
    role: 'SUPER_ADMIN',
  },
  {
    email: 'quality@monera.com',
    password: 'demo123',
    name: 'Quality Admin',
    role: 'QUALITY_ADMIN',
  },
  {
    email: 'support@monera.com',
    password: 'demo123',
    name: 'Support Admin',
    role: 'SUPPORT_ADMIN',
  },
  {
    email: 'analyst@monera.com',
    password: 'demo123',
    name: 'Analyst',
    role: 'ANALYST',
  },
  // Other Roles
  {
    email: 'recruiter@monera.com',
    password: 'demo123',
    name: 'John Recruiter',
    role: 'RECRUITER',
  },
  {
    email: 'candidate@monera.com',
    password: 'demo123',
    name: 'Jane Freelancer',
    role: 'TALENT',
  },
]

async function createDemoUser(user: DemoUser) {
  try {
    // Check if user already exists
    const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
      console.error(`❌ Error listing users: ${listError.message}`)
      throw listError
    }
    
    const existingUser = existingUsers?.users.find((u) => u.email === user.email)

    let userId: string

    if (existingUser) {
      console.log(`⚠️  User ${user.email} already exists, updating profile...`)
      userId = existingUser.id

      // Update password
      await supabase.auth.admin.updateUserById(userId, {
        password: user.password,
      })
    } else {
      // Create auth user
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
      })

      if (authError) throw authError
      if (!authUser.user) throw new Error('Failed to create user')

      userId = authUser.user.id
      console.log(`✅ Created auth user: ${user.email}`)
    }

    // Create/Update profile
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: userId,
      full_name: user.name,
      role: user.role,
      status: 'ACTIVE',
    }, {
      onConflict: 'id'
    })

    if (profileError) {
      console.error(`❌ Profile error for ${user.email}:`, profileError)
      throw profileError
    }

    console.log(`✅ Profile created/updated: ${user.email} (${user.role})`)

    // Create role-specific profiles
    if (user.role === 'RECRUITER') {
      // Create recruiter profile
      const { error: recruiterError } = await supabase.from('recruiter_profiles').upsert({
        user_id: userId,
        first_name: 'John',
        last_name: 'Recruiter',
        phone: '+1234567890',
      })
      if (recruiterError && recruiterError.code !== '23505') {
        // Ignore duplicate key error
        console.warn(`⚠️  Recruiter profile error: ${recruiterError.message}`)
      } else {
        console.log(`✅ Recruiter profile created: ${user.email}`)
      }
    } else if (user.role === 'TALENT') {
      // Create candidate/talent profile
      const { error: candidateError } = await supabase.from('candidate_profiles').upsert({
        user_id: userId,
        first_name: 'Jane',
        last_name: 'Freelancer',
        bio: 'Experienced full-stack developer with 5+ years of experience in web development.',
        location: 'Remote',
        phone: '+1234567891',
        portfolio_url: 'https://janefreelancer.com',
        linkedin_url: 'https://linkedin.com/in/janefreelancer',
        github_url: 'https://github.com/janefreelancer',
      })
      if (candidateError && candidateError.code !== '23505') {
        // Ignore duplicate key error
        console.warn(`⚠️  Candidate profile error: ${candidateError.message}`)
      } else {
        console.log(`✅ Candidate profile created: ${user.email}`)
      }
    }

    return { success: true, email: user.email, role: user.role }
  } catch (error) {
    console.error(`❌ Error creating ${user.email}:`, error)
    return { success: false, email: user.email, error }
  }
}

async function main() {
  console.log('🌱 Seeding demo accounts...\n')
  console.log(`📡 Connecting to: ${supabaseUrl.replace(/\/\/.*@/, '//***@')}\n`)

  // Test connection first
  try {
    const { data: testData, error: testError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 })
    if (testError) {
      console.error('❌ Cannot connect to Supabase:', testError.message)
      console.error('\n💡 Check your Supabase credentials in .env file')
      process.exit(1)
    }
    console.log('✅ Connected to Supabase successfully\n')
  } catch (error: any) {
    console.error('❌ Connection failed:', error.message)
    console.error('\n💡 Possible issues:')
    console.error('   1. Supabase URL or Service Role Key is incorrect')
    console.error('   2. Network connection issue')
    console.error('   3. Supabase project is paused or deleted\n')
    process.exit(1)
  }

  const results = await Promise.all(demoUsers.map(createDemoUser))

  console.log('\n📋 Summary:')
  console.log('='.repeat(50))

  results.forEach((result) => {
    if (result.success) {
      const user = demoUsers.find((u) => u.email === result.email)!
      console.log(`✅ ${result.email}`)
      console.log(`   Role: ${result.role}`)
      console.log(`   Password: ${user.password}`)
      console.log('')
    } else {
      console.log(`❌ ${result.email}: Failed`)
      console.log('')
    }
  })

  console.log('='.repeat(50))
  console.log('\n📝 Demo Accounts:')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('👤 Admin Roles:')
  console.log('   Super Admin: admin@monera.com / demo123')
  console.log('   Quality Admin: quality@monera.com / demo123')
  console.log('   Support Admin: support@monera.com / demo123')
  console.log('   Analyst: analyst@monera.com / demo123')
  console.log('\n💼 Recruiter/Client:')
  console.log('   Email: recruiter@monera.com')
  console.log('   Password: demo123')
  console.log('\n🎨 Candidate/Talent:')
  console.log('   Email: candidate@monera.com')
  console.log('   Password: demo123')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('\n✅ Done! Demo accounts are ready.')
}

main().catch((e) => {
  console.error('❌ Fatal error:', e)
  process.exit(1)
})
