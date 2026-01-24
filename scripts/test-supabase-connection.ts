import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load .env file
dotenv.config()

async function testConnection() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  console.log('🔍 Testing Supabase Connection...\n')

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
  console.log('✅ All environment variables are set\n')

  // Validate URL format
  console.log('2. Validating URL format...')
  if (!supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
    console.error('❌ Invalid URL format. Should start with http:// or https://')
    process.exit(1)
  }
  console.log(`✅ URL format is valid: ${supabaseUrl.replace(/\/\/.*@/, '//***@')}\n`)

  // Test connection with anon key
  console.log('3. Testing connection with anon key...')
  try {
    const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
    
    // Try to get auth session (will fail if not logged in, but connection should work)
    const { error: anonError } = await anonClient.auth.getSession()
    
    if (anonError && anonError.message.includes('fetch')) {
      console.error('❌ Network error:', anonError.message)
      console.error('\n💡 Possible issues:')
      console.error('   - Check your internet connection')
      console.error('   - Check if Supabase URL is correct')
      console.error('   - Check if firewall is blocking the connection')
      process.exit(1)
    }
    
    console.log('✅ Anon key connection successful\n')
  } catch (error: any) {
    console.error('❌ Connection failed:', error.message)
    console.error('\n💡 Check your Supabase credentials')
    process.exit(1)
  }

  // Test connection with service role key
  console.log('4. Testing connection with service role key...')
  try {
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
    
    const { data: users, error: adminError } = await adminClient.auth.admin.listUsers({ page: 1, perPage: 1 })
    
    if (adminError) {
      console.error('❌ Service role key error:', adminError.message)
      console.error('\n💡 Check if SUPABASE_SERVICE_ROLE_KEY is correct')
      process.exit(1)
    }
    
    console.log('✅ Service role key connection successful')
    console.log(`   Found ${users?.users.length || 0} user(s) in database\n`)
  } catch (error: any) {
    console.error('❌ Admin connection failed:', error.message)
    console.error('\n💡 Check your SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  // Test database tables
  console.log('5. Testing database tables...')
  try {
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
    
    const { data: profiles, error: tableError } = await adminClient
      .from('profiles')
      .select('id')
      .limit(1)
    
    if (tableError) {
      console.error('❌ Table access error:', tableError.message)
      console.error('\n💡 Possible issues:')
      console.error('   - profiles table does not exist')
      console.error('   - RLS policies are blocking access')
      console.error('   - Run the SQL schema setup first')
      process.exit(1)
    }
    
    console.log('✅ Database tables are accessible\n')
  } catch (error: any) {
    console.error('❌ Database test failed:', error.message)
    process.exit(1)
  }

  console.log('🎉 All tests passed! Supabase is configured correctly.\n')
  console.log('You can now run: npm run seed:demo')
}

testConnection().catch((error) => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})
