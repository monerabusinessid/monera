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

async function createSuperAdmin() {
  console.log('🌱 Creating SUPER_ADMIN user...')

  const email = process.env.ADMIN_EMAIL || 'admin@monera.com'
  const password = process.env.ADMIN_PASSWORD || 'ChangeMe123!'
  const fullName = process.env.ADMIN_NAME || 'Super Admin'

  try {
    // Create auth user
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('⚠️  User already exists, updating profile...')
        const { data: existingUser } = await supabase.auth.admin.listUsers()
        const user = existingUser?.users.find((u) => u.email === email)
        if (!user) {
          throw new Error('User exists but could not be found')
        }

        // Update profile
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            full_name: fullName,
            role: 'SUPER_ADMIN',
            status: 'ACTIVE',
          })

        if (profileError) throw profileError
        console.log('✅ Profile updated for existing user:', email)
        return
      }
      throw authError
    }

    if (!authUser.user) {
      throw new Error('Failed to create user')
    }

    // Create profile
    const { error: profileError } = await supabase.from('profiles').insert({
      id: authUser.user.id,
      full_name: fullName,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
    })

    if (profileError) throw profileError

    console.log('✅ SUPER_ADMIN created successfully!')
    console.log('📧 Email:', email)
    console.log('🔑 Password:', password)
    console.log('⚠️  Please change the password after first login!')
  } catch (error) {
    console.error('❌ Error creating SUPER_ADMIN:', error)
    process.exit(1)
  }
}

createSuperAdmin()
