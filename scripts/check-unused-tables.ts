import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Tables that are definitely used
const USED_TABLES = [
  'users', // Authentication and user management
  'profiles', // User profiles (admin panel)
  'candidate_profiles', // Talent profiles (talent review)
  'recruiter_profiles', // Recruiter profiles (jobs)
  'jobs', // Job postings (jobs menu)
  'applications', // Job applications (applications menu)
  'skills', // Skills management (skills menu)
  'talent_requests', // Talent requests (talent requests menu)
  'companies', // Companies (used in jobs)
  '_CandidateSkills', // Junction table for candidate skills
  '_JobSkills', // Junction table for job skills
  'work_history', // Part of candidate profile
  'education', // Part of candidate profile
  'languages', // Part of candidate profile
  'certifications', // Part of candidate profile
  'conversations', // Messaging feature
  'messages', // Messaging feature
]

async function checkTables() {
  console.log('🔍 Checking table usage...\n')

  // Try to fetch from each table to see if it exists and has data
  const tables = [
    'users',
    'profiles',
    'candidate_profiles',
    'recruiter_profiles',
    'jobs',
    'applications',
    'skills',
    'talent_requests',
    'companies',
    '_CandidateSkills',
    '_JobSkills',
    'work_history',
    'education',
    'languages',
    'certifications',
    'conversations',
    'messages',
  ]

  const results: Array<{ table: string; exists: boolean; rowCount: number; used: boolean }> = []

  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })

      if (error) {
        results.push({
          table,
          exists: false,
          rowCount: 0,
          used: USED_TABLES.includes(table),
        })
      } else {
        results.push({
          table,
          exists: true,
          rowCount: count || 0,
          used: USED_TABLES.includes(table),
        })
      }
    } catch (error: any) {
      results.push({
        table,
        exists: false,
        rowCount: 0,
        used: USED_TABLES.includes(table),
      })
    }
  }

  console.log('📊 Table Status:\n')
  console.log('='.repeat(80))
  console.log(`${'Table Name'.padEnd(25)} | ${'Exists'.padEnd(8)} | ${'Rows'.padEnd(8)} | ${'Used'.padEnd(8)}`)
  console.log('='.repeat(80))

  results.forEach((result) => {
    const exists = result.exists ? '✅ Yes' : '❌ No'
    const used = result.used ? '✅ Yes' : '⚠️  No'
    console.log(
      `${result.table.padEnd(25)} | ${exists.padEnd(8)} | ${result.rowCount.toString().padEnd(8)} | ${used.padEnd(8)}`
    )
  })

  console.log('='.repeat(80))

  // Check for unused tables
  const unusedTables = results.filter((r) => r.exists && !r.used && r.rowCount === 0)
  if (unusedTables.length > 0) {
    console.log('\n⚠️  Potentially unused tables (exist but have 0 rows and not in used list):')
    unusedTables.forEach((t) => console.log(`   - ${t.table}`))
    console.log('\n💡 These tables can be safely deleted if not needed.')
  } else {
    console.log('\n✅ All existing tables are being used or have data.')
  }

  // Check for tables that don't exist but are expected
  const missingTables = results.filter((r) => !r.exists && r.used)
  if (missingTables.length > 0) {
    console.log('\n⚠️  Expected tables that don\'t exist:')
    missingTables.forEach((t) => console.log(`   - ${t.table}`))
  }
}

checkTables().catch((error) => {
  console.error('❌ Error:', error)
  process.exit(1)
})
