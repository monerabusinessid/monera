/**
 * Script untuk membersihkan orphaned users (user yang ada di Supabase Auth
 * tapi tidak ada di profiles table)
 * 
 * Usage: npx tsx scripts/cleanup-orphaned-users.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌')
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌')
  process.exit(1)
}

async function cleanupOrphanedUsers() {
  console.log('🔍 Starting orphaned users cleanup...\n')

  const adminSupabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  try {
    // Get all users from Auth
    const { data: usersData, error: listError } = await adminSupabase.auth.admin.listUsers()
    
    if (listError) {
      console.error('❌ Error listing users:', listError)
      process.exit(1)
    }

    if (!usersData?.users || usersData.users.length === 0) {
      console.log('✅ No users found in Auth')
      return
    }

    console.log(`📊 Found ${usersData.users.length} users in Auth\n`)

    // Get all profile IDs
    const { data: profiles, error: profilesError } = await adminSupabase
      .from('profiles')
      .select('id')

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError)
      process.exit(1)
    }

    const profileIds = new Set(profiles?.map(p => p.id) || [])
    console.log(`📊 Found ${profileIds.size} profiles in database\n`)

    // Find orphaned users (in Auth but not in profiles)
    const orphanedUsers = usersData.users.filter(
      (user) => !profileIds.has(user.id)
    )

    if (orphanedUsers.length === 0) {
      console.log('✅ No orphaned users found. All users have profiles.')
      return
    }

    console.log(`⚠️  Found ${orphanedUsers.length} orphaned user(s):\n`)
    orphanedUsers.forEach((user) => {
      console.log(`   - ${user.email} (ID: ${user.id})`)
    })

    console.log('\n🗑️  Deleting orphaned users from Auth...\n')

    // Delete orphaned users
    let deletedCount = 0
    let errorCount = 0

    for (const user of orphanedUsers) {
      try {
        const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(user.id)
        if (deleteError) {
          console.error(`   ❌ Failed to delete ${user.email}:`, deleteError.message)
          errorCount++
        } else {
          console.log(`   ✅ Deleted ${user.email}`)
          deletedCount++
        }
      } catch (error: any) {
        console.error(`   ❌ Error deleting ${user.email}:`, error.message)
        errorCount++
      }
    }

    console.log('\n📊 Summary:')
    console.log(`   ✅ Deleted: ${deletedCount}`)
    if (errorCount > 0) {
      console.log(`   ❌ Errors: ${errorCount}`)
    }
    console.log('\n✅ Cleanup completed!')
  } catch (error: any) {
    console.error('❌ Unexpected error:', error)
    process.exit(1)
  }
}

cleanupOrphanedUsers()
