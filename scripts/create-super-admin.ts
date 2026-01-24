/**
 * Script to create the first SUPER_ADMIN user
 * Run: npx tsx scripts/create-super-admin.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

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
  console.log('🚀 Creating SUPER_ADMIN user...\n')

  const email = 'admin@monera.com'
  const password = 'admin123' // Change this to a secure password
  const fullName = 'Super Admin'

  try {
    // 1. Create user in Supabase Auth
    console.log('1. Creating user in Supabase Auth...')
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (authError) {
      if (authError.message.includes('already registered') || authError.message.includes('already been registered') || authError.code === 'email_exists') {
        console.log('⚠️  User already exists in Auth, fetching existing user...')
        const { data: existingUsers } = await supabase.auth.admin.listUsers()
        const existingUser = existingUsers?.users.find((u) => u.email === email)
        if (!existingUser) {
          throw new Error('User exists but could not be found')
        }
        console.log('✅ Using existing auth user:', existingUser.id)
        
        // Check if profile exists
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', existingUser.id)
          .single()

        if (existingProfile) {
          console.log('✅ Profile already exists')
          console.log('\n📋 User Details:')
          console.log('   Email:', email)
          console.log('   Password:', password)
          console.log('   Role:', existingProfile.role)
          console.log('   ID:', existingUser.id)
          return
        }

        // Create profile for existing auth user
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: existingUser.id,
            full_name: fullName,
            role: 'SUPER_ADMIN',
            status: 'ACTIVE',
          })

        if (profileError) {
          throw profileError
        }

        console.log('✅ Profile created for existing auth user')
        console.log('\n📋 User Details:')
        console.log('   Email:', email)
        console.log('   Password:', password)
        console.log('   Role: SUPER_ADMIN')
        console.log('   ID:', existingUser.id)
        return
      }
      throw authError
    }

    if (!authUser.user) {
      throw new Error('Failed to create auth user')
    }

    console.log('✅ Auth user created:', authUser.user.id)

    // 2. Create profile
    console.log('2. Creating profile...')
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authUser.user.id,
        full_name: fullName,
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
      })

    if (profileError) {
      // Rollback: delete auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authUser.user.id)
      throw profileError
    }

    console.log('✅ Profile created successfully')

    console.log('\n✅ SUPER_ADMIN user created successfully!')
    console.log('\n📋 Login Details:')
    console.log('   Email:', email)
    console.log('   Password:', password)
    console.log('   URL: http://localhost:3001/login')
    console.log('\n⚠️  Remember to change the password after first login!')
  } catch (error: any) {
    console.error('\n❌ Error creating SUPER_ADMIN:', error.message)
    console.error('Details:', error)
    process.exit(1)
  }
}

createSuperAdmin()
  .then(() => {
    console.log('\n✅ Script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  })
