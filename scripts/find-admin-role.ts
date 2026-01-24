/**
 * Script to find all data with "ADMIN" role
 * Run: npx tsx scripts/find-admin-role.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function findAdminRole() {
  console.log('🔍 Searching for data with "ADMIN" role...\n')

  try {
    // Check profiles table
    console.log('1. Checking profiles table...')
    const { data: profiles, error: profilesError } = await adminClient
      .from('profiles')
      .select('*')

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError.message)
    } else {
      console.log(`   Found ${profiles?.length || 0} profiles`)
      
      // Check for ADMIN role (as string, not enum)
      const adminProfiles = profiles?.filter((p: any) => {
        const roleStr = typeof p.role === 'string' ? p.role : String(p.role)
        return roleStr === 'ADMIN' || roleStr.includes('ADMIN')
      })
      
      if (adminProfiles && adminProfiles.length > 0) {
        console.log(`\n   ⚠️  Found ${adminProfiles.length} profiles with ADMIN role:`)
        adminProfiles.forEach((p: any) => {
          console.log(`   - ID: ${p.id}, Email: ${p.email || 'N/A'}, Role: ${p.role}`)
        })
      } else {
        console.log('   ✅ No profiles with ADMIN role found')
      }

      // Check all roles
      console.log('\n   All roles in profiles:')
      const roleCounts = new Map<string, number>()
      profiles?.forEach((p: any) => {
        const role = String(p.role || 'NULL')
        roleCounts.set(role, (roleCounts.get(role) || 0) + 1)
      })
      roleCounts.forEach((count, role) => {
        console.log(`   - ${role}: ${count}`)
      })
    }

    // Check auth users
    console.log('\n2. Checking auth users...')
    const { data: authData, error: authError } = await adminClient.auth.admin.listUsers()
    
    if (authError) {
      console.error('❌ Error listing users:', authError.message)
    } else {
      console.log(`   Found ${authData?.users?.length || 0} auth users`)
    }

    // Try to query with raw SQL to see what's in the database
    console.log('\n3. Checking enum values...')
    const { data: enumData, error: enumError } = await adminClient.rpc('get_user_role_enum_values', {})
    
    if (enumError) {
      console.log('   ⚠️  Could not check enum values (function might not exist)')
    } else {
      console.log('   Enum values:', enumData)
    }

  } catch (error: any) {
    console.error('\n❌ Fatal error:', error.message)
    process.exit(1)
  }
}

findAdminRole()
  .then(() => {
    console.log('\n✅ Search completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  })
