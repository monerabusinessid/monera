import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabase/server'
import { getAuthUser, successResponse, errorResponse } from '@/lib/api-utils'
export const dynamic = 'force-dynamic'
export const runtime = 'edge'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function GET(request: NextRequest) {
  try {
    // Debug: log cookies and headers
    const cookies = request.cookies.getAll()
    const authHeader = request.headers.get('authorization')
    console.log('[API /auth/me] Request received:', {
      cookies: cookies.map(c => c.name),
      hasAuthHeader: !!authHeader,
    })
    
    const user = await getAuthUser(request)
    if (!user) {
      console.log('[API /auth/me] No user found from token - returning 401')
      return errorResponse('Unauthorized', 401)
    }

    console.log('[API /auth/me] User found from token:', { id: user.id, email: user.email, role: user.role })

    // getUserFromToken already returns all the data we need (id, email, role, name, status)
    // So we can return it directly without querying the database again
    // This avoids RLS issues and is more efficient
    
    // Get additional profile data based on role (optional, for extended profile info)
    let additionalData: any = {}
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('[API /auth/me] Supabase not configured, returning basic user data')
      // Return basic user data even if Supabase is not configured
      return successResponse({
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name || '',
        status: user.status || 'ACTIVE',
        ...additionalData,
      })
    }

    // Try to get additional profile data, but don't fail if it doesn't work
    try {
      // Use service role to avoid RLS blocking profile lookups
      const supabase = await createAdminClient()

      // Fetch full_name from profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle()

      if (profile?.full_name) {
        additionalData.fullName = profile.full_name
      }

      if (user.role === 'TALENT') {
        const { data: talentProfile } = await supabase
          .from('talent_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()
        additionalData.talentProfile = talentProfile
      } else if (user.role === 'CLIENT') {
        const { data: recruiterProfile } = await supabase
          .from('recruiter_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle()
        additionalData.recruiterProfile = recruiterProfile
      }
    } catch (error) {
      console.warn('[API /auth/me] Error fetching additional profile data (non-critical):', error)
      // Continue without additional data
    }

    // Return user data from token (which already includes profile info)
    return successResponse({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name || '',
      status: user.status || 'ACTIVE',
      ...additionalData,
    })
  } catch (error) {
    return errorResponse('Failed to fetch user data', 500)
  }
}
