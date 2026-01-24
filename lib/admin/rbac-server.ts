// This file is SERVER-ONLY and should never be imported by client components
// For client components, use functions from lib/admin/rbac.ts (pure functions only)
// Using dynamic imports to prevent Next.js from bundling server-only code with client code
import type { AdminRole } from './rbac'
import { isAdmin } from './rbac'

// Get current user's role from Supabase
// NOTE: This function should only be used in Server Components
// For client components, use Supabase client from lib/supabase/client.ts
export async function getCurrentUserRole(): Promise<string | null> {
  try {
    // Dynamic import to prevent bundling server code with client
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    return profile?.role || null
  } catch (error) {
    console.error('Error getting user role:', error)
    return null
  }
}

// Require admin role (for server actions)
// NOTE: This function should only be used in Server Components or Server Actions
export async function requireAdmin(allowedRoles?: AdminRole[]) {
  // Dynamic import to prevent bundling server code with client
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    throw new Error('Profile not found')
  }

  const userRole = profile.role

  if (!isAdmin(userRole)) {
    throw new Error('Admin access required')
  }

  if (allowedRoles && !allowedRoles.includes(userRole as AdminRole)) {
    throw new Error('Insufficient permissions')
  }

  return {
    user,
    profile,
    role: userRole as AdminRole,
  }
}
