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

async function deleteUsers() {
  console.log('🗑️  Deleting users from database...\n')

  try {
    // First, list all users to see what we have
    const { data: users, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .limit(100)

    if (fetchError) {
      console.error('❌ Error fetching users:', fetchError)
      return
    }

    if (!users || users.length === 0) {
      console.log('ℹ️  No users found in database')
      return
    }

    console.log(`📋 Found ${users.length} users:`)
    users.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.email} (${user.role}) - ID: ${user.id}`)
    })

    console.log('\n⚠️  WARNING: This will delete ALL users from the users table!')
    console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...\n')

    // Wait 5 seconds
    await new Promise(resolve => setTimeout(resolve, 5000))

    // Delete all users
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .neq('id', '') // Delete all (this condition is always true)

    if (deleteError) {
      console.error('❌ Error deleting users:', deleteError)
      return
    }

    console.log('✅ Successfully deleted all users from users table')
    console.log(`   Deleted ${users.length} users`)

    // Also try to delete from profiles table if it exists
    const { data: profiles, error: profilesFetchError } = await supabase
      .from('profiles')
      .select('*')
      .limit(100)

    if (!profilesFetchError && profiles && profiles.length > 0) {
      console.log(`\n📋 Found ${profiles.length} profiles:`)
      profiles.forEach((profile, index) => {
        console.log(`  ${index + 1}. ${profile.email || profile.full_name || 'N/A'} (${profile.role}) - ID: ${profile.id}`)
      })

      console.log('\n⚠️  WARNING: This will delete ALL profiles from the profiles table!')
      console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...\n')

      await new Promise(resolve => setTimeout(resolve, 5000))

      const { error: profilesDeleteError } = await supabase
        .from('profiles')
        .delete()
        .neq('id', '')

      if (profilesDeleteError) {
        console.error('❌ Error deleting profiles:', profilesDeleteError)
      } else {
        console.log('✅ Successfully deleted all profiles from profiles table')
        console.log(`   Deleted ${profiles.length} profiles`)
      }
    }

    console.log('\n✅ Done! All users and profiles have been deleted.')
    console.log('💡 You can now run: npm run seed:all-admins to create admin users')

  } catch (error) {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  }
}

deleteUsers()
