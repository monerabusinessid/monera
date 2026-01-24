import { NextRequest } from 'next/server'
import { getAuthUser, successResponse, errorResponse } from '@/lib/api-utils'
import { createAdminClient } from '@/lib/supabase/server-helper'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return errorResponse('Unauthorized', 401)
    }

    const adminSupabase = await createAdminClient()
    const userIdString = String(user.id)

    // Get all talent profiles to see what's in the database
    const { data: allTalentProfiles, error: allError } = await adminSupabase
      .from('talent_profiles')
      .select('id, user_id, headline, status, profile_completion')
      .limit(100)

    // Get user's profile
    const { data: profile } = await adminSupabase
      .from('profiles')
      .select('id, full_name, email')
      .eq('id', userIdString)
      .single()

    // Try to find talent profile with different methods
    const query1 = await adminSupabase
      .from('talent_profiles')
      .select('*')
      .eq('user_id', userIdString)
      .maybeSingle()

    const query2 = await adminSupabase
      .from('talent_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    // Manual filter
    let manualMatch = null
    if (allTalentProfiles) {
      manualMatch = allTalentProfiles.find((tp: any) => {
        return String(tp.user_id) === userIdString || String(tp.user_id) === String(user.id)
      })
    }

    return successResponse({
      user: {
        id: user.id,
        idType: typeof user.id,
        idString: userIdString,
        email: user.email
      },
      profile: profile || null,
      query1: {
        found: !!query1.data,
        error: query1.error?.message || null,
        data: query1.data || null
      },
      query2: {
        found: !!query2.data,
        error: query2.error?.message || null,
        data: query2.data || null
      },
      manualMatch: manualMatch || null,
      allTalentProfiles: allTalentProfiles?.slice(0, 5) || [], // First 5 for debugging
      allTalentProfilesError: allError?.message || null
    })
  } catch (error: any) {
    console.error('Debug endpoint error:', error)
    return errorResponse(error.message || 'Internal server error', 500)
  }
}
