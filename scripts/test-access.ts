/**
 * Script to test if the application can access Supabase
 * Run: npx tsx scripts/test-access.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔍 Testing Supabase Access...\n')

// Check environment variables
console.log('1. Checking environment variables...')
if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL is missing')
  process.exit(1)
}
if (!supabaseAnonKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is missing')
  process.exit(1)
}
if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is missing')
  process.exit(1)
}
console.log('✅ All environment variables are set')
console.log('   Supabase URL:', supabaseUrl)
console.log('   Anon Key:', supabaseAnonKey.substring(0, 20) + '...')
console.log('   Service Key:', supabaseServiceKey.substring(0, 20) + '...\n')

async function runTests() {
  // Test with anon key
  console.log('2. Testing connection with anon key...')
  const anonClient = createClient(supabaseUrl!, supabaseAnonKey!)
  const { data: anonData, error: anonError } = await anonClient
    .from('profiles')
    .select('count')
    .limit(1)

  if (anonError) {
    console.error('❌ Error with anon key:', anonError.message)
  } else {
    console.log('✅ Anon key connection successful\n')
  }

  // Test with service key
  console.log('3. Testing connection with service key...')
  const adminClient = createClient(supabaseUrl!, supabaseServiceKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
  const { data: adminData, error: adminError } = await adminClient
    .from('profiles')
    .select('count')
    .limit(1)

  if (adminError) {
    console.error('❌ Error with service key:', adminError.message)
  } else {
    console.log('✅ Service key connection successful\n')
  }

  // Test authentication
  console.log('4. Testing authentication...')
  const { data: authData, error: authError } = await adminClient.auth.admin.listUsers()

  if (authError) {
    console.error('❌ Error listing users:', authError.message)
  } else {
    console.log(`✅ Authentication successful (${authData?.users?.length || 0} users found)\n`)
    
    // Check for admin user
    const adminUser = authData?.users?.find((u: any) => u.email === 'admin@monera.com')
    if (adminUser) {
      console.log('✅ Admin user found:', adminUser.email)
      console.log('   ID:', adminUser.id)
      console.log('   Email confirmed:', adminUser.email_confirmed_at ? 'Yes' : 'No')
    } else {
      console.log('⚠️  Admin user not found in Auth')
    }
  }

  // Test profile table
  console.log('\n5. Testing profiles table...')
  const { data: profiles, error: profilesError } = await adminClient
    .from('profiles')
    .select('*')
    .limit(5)

  if (profilesError) {
    console.error('❌ Error fetching profiles:', profilesError.message)
  } else {
    console.log(`✅ Profiles table accessible (${profiles?.length || 0} profiles found)`)
    if (profiles && profiles.length > 0) {
      console.log('\n   Sample profiles:')
      profiles.forEach((p: any) => {
        console.log(`   - ${p.full_name || 'N/A'} (${p.role || 'N/A'}) - ${p.id}`)
      })
    }
  }

  console.log('\n✅ All tests completed!')
}

runTests().catch((error) => {
  console.error('\n❌ Fatal error:', error)
  process.exit(1)
})
