// Helper function to get Supabase client using dynamic import
// This prevents Next.js from bundling server-only code with client code
// This file should only be imported in Server Components or Server Actions
import 'server-only'

export async function getSupabaseClient() {
  const { createClient } = await import('./server')
  return await createClient()
}

export async function createAdminClient() {
  const { createAdminClient } = await import('./server')
  return await createAdminClient()
}
