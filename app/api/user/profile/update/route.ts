import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient, createAdminClient } from '@/lib/supabase/server-helper'
import { getAuthUser, successResponse, errorResponse } from '@/lib/api-utils'
import { z } from 'zod'
export const dynamic = 'force-dynamic'

const updateProfileSchema = z.object({
  fullName: z.string().min(1).optional(),
  country: z.string().min(1).optional(),
  timezone: z.string().min(1).optional(),
  skillIds: z.array(z.string()).optional(),
  experience: z.string().min(1).optional(),
  portfolioUrl: z.string().url().optional().nullable(),
})

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return errorResponse('Unauthorized', 401)
    }

    const body = await request.json()
    const validatedData = updateProfileSchema.parse(body)

    const adminSupabase = await createAdminClient()

    // Update profile if fields provided
    if (validatedData.fullName || validatedData.country || validatedData.timezone) {
      const updateData: any = { updated_at: new Date().toISOString() }
      if (validatedData.fullName) updateData.full_name = validatedData.fullName
      if (validatedData.country) updateData.country = validatedData.country
      if (validatedData.timezone) updateData.timezone = validatedData.timezone

      const { error: profileError } = await adminSupabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)

      if (profileError) {
        console.error('Error updating profile:', profileError)
        return errorResponse('Failed to update profile', 500)
      }
    }

    // Get talent profile
    const { data: talentProfile } = await adminSupabase
      .from('talent_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!talentProfile) {
      return errorResponse('Talent profile not found', 404)
    }

    // Update talent profile if fields provided
    if (validatedData.experience || validatedData.portfolioUrl !== undefined) {
      const updateData: any = { updated_at: new Date().toISOString() }
      if (validatedData.experience) updateData.experience = validatedData.experience
      if (validatedData.portfolioUrl !== undefined) updateData.portfolio_url = validatedData.portfolioUrl

      const { error: talentError } = await adminSupabase
        .from('talent_profiles')
        .update(updateData)
        .eq('id', talentProfile.id)

      if (talentError) {
        console.error('Error updating talent profile:', talentError)
        return errorResponse('Failed to update talent profile', 500)
      }
    }

    // Update skills if provided
    if (validatedData.skillIds && validatedData.skillIds.length > 0) {
      // Delete existing skills
      await adminSupabase
        .from('_CandidateSkills')
        .delete()
        .eq('A', talentProfile.id)

      // Insert new skills
      const skillLinks = validatedData.skillIds.map((skillId) => ({
        A: talentProfile.id,
        B: skillId,
      }))

      const { error: skillsError } = await adminSupabase
        .from('_CandidateSkills')
        .insert(skillLinks)

      if (skillsError) {
        console.error('Error updating skills:', skillsError)
        // Don't fail the whole operation if skills fail
      }
    }

    return successResponse({ message: 'Profile updated successfully' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse('Validation error', 400)
    }
    console.error('Error in PUT /api/user/profile/update:', error)
    return errorResponse('Internal server error', 500)
  }
}
