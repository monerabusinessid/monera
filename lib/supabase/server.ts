// This file is SERVER-ONLY and should never be imported by client components
// Use lib/supabase/client.ts for client-side Supabase operations
// IMPORTANT: Always use dynamic import or getSupabaseClient() helper to import this file
import { createServerClient } from '@supabase/ssr'

export async function createClient() {
  // Dynamic import to prevent bundling next/headers with client code
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env file'
    )
  }

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

// Admin client for privileged operations (bypasses RLS)
export async function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file'
    )
  }

  // Verify service role key is set (should start with 'eyJ' for JWT)
  if (!supabaseServiceKey.startsWith('eyJ')) {
    console.warn('Warning: SUPABASE_SERVICE_ROLE_KEY does not look like a valid JWT token')
  }

  // Use @supabase/supabase-js directly with service role key to bypass RLS
  // This is different from createServerClient which still respects RLS
  const { createClient } = await import('@supabase/supabase-js')
  
  const client = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  // Verify we're using service role (should bypass RLS)
  console.log('Admin client created with service role key (RLS bypass enabled)')
  
  return client
}
