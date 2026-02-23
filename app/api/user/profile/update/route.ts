import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server-helper'
import { getAuthUser, successResponse, errorResponse } from '@/lib/api-utils'
import { z } from 'zod'
export const dynamic = 'force-dynamic'
export const runtime = 'edge'

const updateProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  fullName: z.string().min(1).optional(),
  bio: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  timezone: z.string().optional().nullable(),
  headline: z.string().optional().nullable(),
  skillIds: z.array(z.string()).optional(),
  experience: z.string().optional().nullable(),
  portfolioUrl: z.string().url().optional().nullable(),
  linkedInUrl: z.string().url().optional().nullable(),
  githubUrl: z.string().url().optional().nullable(),
  videoIntroUrl: z.string().optional().nullable(),
  hourlyRate: z.number().optional().nullable(),
  availability: z.string().optional().nullable(),
  email: z.string().email().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
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
    const fullName =
      validatedData.fullName ||
      (validatedData.firstName || validatedData.lastName
        ? `${validatedData.firstName || ''} ${validatedData.lastName || ''}`.trim()
        : undefined)

    const profileUpdate: any = { id: user.id, updated_at: new Date().toISOString() }
    if (fullName) profileUpdate.full_name = fullName
    if (validatedData.country !== undefined) profileUpdate.country = validatedData.country
    if (validatedData.timezone !== undefined) profileUpdate.timezone = validatedData.timezone
    if (validatedData.bio !== undefined) profileUpdate.bio = validatedData.bio
    if (validatedData.phone !== undefined) profileUpdate.phone = validatedData.phone
    if (validatedData.location !== undefined) profileUpdate.location = validatedData.location
    if (validatedData.linkedInUrl !== undefined) profileUpdate.linked_in_url = validatedData.linkedInUrl
    if (validatedData.githubUrl !== undefined) profileUpdate.github_url = validatedData.githubUrl
    if (validatedData.email) profileUpdate.email = validatedData.email

    if (Object.keys(profileUpdate).length > 1) {
      const { error: profileError } = await adminSupabase
        .from('profiles')
        .upsert(profileUpdate, { onConflict: 'id' })

      if (profileError) {
        console.error('Error updating profile:', profileError)
        return errorResponse('Failed to update profile', 500)
      }
    }

    // Get or create talent profile
    const { data: talentProfile } = await adminSupabase
      .from('talent_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!talentProfile) {
      const { data: createdProfile, error: createError } = await adminSupabase
        .from('talent_profiles')
        .insert({
          user_id: user.id,
          status: 'DRAFT',
          profile_completion: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select('id')
        .single()

      if (createError || !createdProfile) {
        console.error('Error creating talent profile:', createError)
        return errorResponse('Failed to create talent profile', 500)
      }
    }

    const { data: resolvedTalentProfile } = await adminSupabase
      .from('talent_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle()

    if (!resolvedTalentProfile) {
      return errorResponse('Talent profile not found', 404)
    }

    // Update talent profile if fields provided
    if (
      validatedData.experience !== undefined ||
      validatedData.portfolioUrl !== undefined ||
      validatedData.headline !== undefined ||
      validatedData.videoIntroUrl !== undefined ||
      validatedData.hourlyRate !== undefined ||
      validatedData.availability !== undefined ||
      validatedData.bio !== undefined
    ) {
      const updateData: any = { updated_at: new Date().toISOString() }
      if (validatedData.experience !== undefined) updateData.experience = validatedData.experience
      if (validatedData.portfolioUrl !== undefined) updateData.portfolio_url = validatedData.portfolioUrl
      if (validatedData.headline !== undefined) updateData.headline = validatedData.headline
      if (validatedData.videoIntroUrl !== undefined) updateData.intro_video_url = validatedData.videoIntroUrl
      if (validatedData.hourlyRate !== undefined) updateData.hourly_rate = validatedData.hourlyRate
      if (validatedData.availability !== undefined) updateData.availability = validatedData.availability
      if (validatedData.bio !== undefined) updateData.bio = validatedData.bio

      const { error: talentError } = await adminSupabase
        .from('talent_profiles')
        .update(updateData)
        .eq('id', resolvedTalentProfile.id)

      if (talentError) {
        console.error('Error updating talent profile:', talentError)
        return errorResponse('Failed to update talent profile', 500)
      }
    }

    // Update skills if provided
    if (validatedData.skillIds !== undefined) {
      // Delete existing skills
      await adminSupabase
        .from('_CandidateSkills')
        .delete()
        .eq('A', resolvedTalentProfile.id)

      // Insert new skills only if array is not empty
      if (validatedData.skillIds.length > 0) {
        const skillLinks = validatedData.skillIds.map((skillId) => ({
          A: resolvedTalentProfile.id,
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
    }

    // Calculate profile completion after update
    const { data: updatedProfile } = await adminSupabase
      .from('profiles')
      .select('full_name, country, timezone, bio, phone, location, linked_in_url, github_url')
      .eq('id', user.id)
      .single()

    const { data: updatedTalentProfile } = await adminSupabase
      .from('talent_profiles')
      .select('headline, experience, portfolio_url, intro_video_url')
      .eq('id', resolvedTalentProfile.id)
      .single()

    const { data: skillsData } = await adminSupabase
      .from('_CandidateSkills')
      .select('B')
      .eq('A', resolvedTalentProfile.id)

    const fields = [
      updatedProfile?.full_name,
      updatedProfile?.country,
      updatedProfile?.timezone,
      updatedProfile?.bio,
      updatedProfile?.phone,
      updatedProfile?.location,
      updatedProfile?.linked_in_url,
      updatedProfile?.github_url,
      updatedTalentProfile?.headline,
      updatedTalentProfile?.experience,
      updatedTalentProfile?.portfolio_url,
      updatedTalentProfile?.intro_video_url,
      skillsData && skillsData.length > 0,
    ]
    const completed = fields.filter(Boolean).length
    const profileCompletion = Math.round((completed / fields.length) * 100)

    // Update profile_completion in talent_profiles
    await adminSupabase
      .from('talent_profiles')
      .update({ profile_completion: profileCompletion, updated_at: new Date().toISOString() })
      .eq('id', resolvedTalentProfile.id)

    if (validatedData.email) {
      await adminSupabase.auth.admin.updateUserById(user.id, {
        email: validatedData.email,
      })
    }

    if (validatedData.newPassword) {
      if (!validatedData.currentPassword) {
        return errorResponse('Current password is required to set a new password', 400)
      }

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      if (supabaseUrl && supabaseAnonKey) {
        const { createClient } = await import('@supabase/supabase-js')
        const anonClient = createClient(supabaseUrl, supabaseAnonKey)
        const { error: signInError } = await anonClient.auth.signInWithPassword({
          email: validatedData.email || user.email || '',
          password: validatedData.currentPassword,
        })
        if (signInError) {
          return errorResponse('Current password is incorrect', 400)
        }
      }

      await adminSupabase.auth.admin.updateUserById(user.id, {
        password: validatedData.newPassword,
      })
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
