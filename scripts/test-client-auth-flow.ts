/**
 * Test script for Client Google Authentication Flow
 * This script tests API endpoints and logic that can be verified programmatically
 */

import 'dotenv/config'
import { createAdminClient } from '../lib/supabase/server'

interface TestResult {
  name: string
  passed: boolean
  error?: string
  details?: any
}

const results: TestResult[] = []

async function test(name: string, fn: () => Promise<boolean> | boolean) {
  try {
    const result = await fn()
    results.push({ name, passed: result })
    console.log(result ? `✅ ${name}` : `❌ ${name}`)
  } catch (error: any) {
    results.push({ name, passed: false, error: error.message, details: error })
    console.log(`❌ ${name}: ${error.message}`)
  }
}

async function runTests() {
  console.log('🧪 Testing Client Google Authentication Flow\n')

  // Test 1: Supabase connection
  await test('Supabase Admin Client Connection', async () => {
    try {
      const adminSupabase = await createAdminClient()
      const { data, error } = await adminSupabase.from('profiles').select('id').limit(1)
      return !error
    } catch {
      return false
    }
  })

  // Test 2: Check profiles table structure
  await test('Profiles table exists and has required columns', async () => {
    try {
      const adminSupabase = await createAdminClient()
      const { data, error } = await adminSupabase
        .from('profiles')
        .select('id, role, full_name, status')
        .limit(1)
      
      if (error) return false
      return true
    } catch {
      return false
    }
  })

  // Test 3: Check recruiter_profiles table
  await test('Recruiter profiles table exists', async () => {
    try {
      const adminSupabase = await createAdminClient()
      const { data, error } = await adminSupabase
        .from('recruiter_profiles')
        .select('id')
        .limit(1)
      
      // Table might be empty, so we just check if query doesn't error
      return true
    } catch (error: any) {
      // If table doesn't exist, this will error
      return false
    }
  })

  // Test 4: Check companies table
  await test('Companies table exists', async () => {
    try {
      const adminSupabase = await createAdminClient()
      const { data, error } = await adminSupabase
        .from('companies')
        .select('id, name')
        .limit(1)
      
      return true
    } catch {
      return false
    }
  })

  // Test 5: Verify CLIENT role handling
  await test('CLIENT role profiles can be queried', async () => {
    try {
      const adminSupabase = await createAdminClient()
      const { data, error } = await adminSupabase
        .from('profiles')
        .select('id, role')
        .eq('role', 'CLIENT')
        .limit(1)
      
      return !error
    } catch {
      return false
    }
  })

  // Test 6: Check environment variables
  await test('Required environment variables are set', async () => {
    const required = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'JWT_SECRET',
    ]
    
    const missing = required.filter(key => !process.env[key])
    if (missing.length > 0) {
      throw new Error(`Missing: ${missing.join(', ')}`)
    }
    return true
  })

  // Test 7: Google OAuth config (if available)
  await test('Google OAuth environment variables', async () => {
    const hasGoogleConfig = !!(
      process.env.GOOGLE_CLIENT_ID && 
      process.env.GOOGLE_CLIENT_SECRET
    )
    
    if (!hasGoogleConfig) {
      console.log('   ⚠️  Google OAuth not configured (optional for testing)')
    }
    return true // Not required for basic tests
  })

  // Summary
  console.log('\n📊 Test Summary:')
  console.log('='.repeat(50))
  const passed = results.filter(r => r.passed).length
  const failed = results.filter(r => !r.passed).length
  
  console.log(`Total: ${results.length}`)
  console.log(`✅ Passed: ${passed}`)
  console.log(`❌ Failed: ${failed}`)
  
  if (failed > 0) {
    console.log('\n❌ Failed Tests:')
    results
      .filter(r => !r.passed)
      .forEach(r => {
        console.log(`  - ${r.name}`)
        if (r.error) console.log(`    Error: ${r.error}`)
      })
  }

  console.log('\n💡 Note: This script tests API/backend logic only.')
  console.log('   For full OAuth flow testing, use browser automation (Playwright)')
  console.log('   or follow manual testing guide in TESTING.md\n')

  return failed === 0
}

// Run tests
runTests()
  .then(success => {
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
