import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getAuthUser, successResponse, errorResponse } from '@/lib/api-utils'
export const dynamic = 'force-dynamic'

// GET - Fetch work history, education, languages, certifications
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return errorResponse('Unauthorized', 401)
    }

    const adminSupabase = await createAdminClient()
    
    // Get talent profile
    const { data: talentProfile } = await adminSupabase
      .from('talent_profiles')
      .select('id, work_history, education, languages, certifications')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!talentProfile) {
      return successResponse({
        workHistory: [],
        education: [],
        languages: [],
        certifications: []
      })
    }

    return successResponse({
      workHistory: talentProfile.work_history || [],
      education: talentProfile.education || [],
      languages: talentProfile.languages || [],
      certifications: talentProfile.certifications || []
    })
  } catch (error: any) {
    console.error('Error in GET /api/user/profile/experience:', error)
    return errorResponse(error.message || 'Internal server error', 500)
  }
}

// POST - Save work history, education, languages, certifications
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return errorResponse('Unauthorized', 401)
    }

    const body = await request.json()
    const { workHistory, education, languages, certifications } = body

    const adminSupabase = await createAdminClient()
    
    // Get or create talent profile
    const { data: existingProfile } = await adminSupabase
      .from('talent_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    const updateData: any = {}
    if (workHistory !== undefined) updateData.work_history = workHistory
    if (education !== undefined) updateData.education = education
    if (languages !== undefined) updateData.languages = languages
    if (certifications !== undefined) updateData.certifications = certifications

    if (existingProfile) {
      // Update existing profile
      const { error: updateError } = await adminSupabase
        .from('talent_profiles')
        .update(updateData)
        .eq('id', existingProfile.id)

      if (updateError) {
        console.error('Error updating talent profile:', updateError)
        return errorResponse(updateError.message || 'Failed to update profile', 500)
      }
    } else {
      // Create new profile
      const { error: createError } = await adminSupabase
        .from('talent_profiles')
        .insert({
          user_id: user.id,
          work_history: workHistory || [],
          education: education || [],
          languages: languages || [],
          certifications: certifications || [],
          status: 'DRAFT',
          profile_completion: 0,
        })

      if (createError) {
        console.error('Error creating talent profile:', createError)
        return errorResponse(createError.message || 'Failed to create profile', 500)
      }
    }

    return successResponse({
      workHistory: workHistory || [],
      education: education || [],
      languages: languages || [],
      certifications: certifications || []
    })
  } catch (error: any) {
    console.error('Error in POST /api/user/profile/experience:', error)
    return errorResponse(error.message || 'Internal server error', 500)
  }
}
