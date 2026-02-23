import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseClient, createAdminClient } from '@/lib/supabase/server-helper'
import { getAuthUser, successResponse, errorResponse } from '@/lib/api-utils'
import { z } from 'zod'
import { db } from '@/lib/db'
export const dynamic = 'force-dynamic'
export const runtime = 'edge'

const submitProfileSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  jobTitle: z.string().min(1), // Professional job title/headline (required)
  country: z.string().min(1),
  timezone: z.string().min(1),
  bio: z.string().min(1),
  phone: z.string().min(1),
  location: z.string().min(1),
  hourlyRate: z.number().positive().optional(),
  availability: z.enum(['Open', 'Busy']).optional(),
  linkedInUrl: z.string().url().optional().or(z.literal('')),
  githubUrl: z.string().url().optional().or(z.literal('')),
  skillIds: z.array(z.string()).min(1, 'At least one skill is required'),
  experience: z.string().min(1),
  portfolioUrl: z.string().url().optional().or(z.literal('')),
  introVideoUrl: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return errorResponse('Unauthorized', 401)
    }

    const body = await request.json()
    console.log('Received submit request:', { userId: user.id, body: { ...body, introVideoUrl: body.introVideoUrl ? 'present' : 'missing' } })
    
    const validatedData = submitProfileSchema.parse(body)
    console.log('Validated data:', { ...validatedData, introVideoUrl: validatedData.introVideoUrl ? 'present' : 'missing' })

    const supabase = await getSupabaseClient()
    const adminSupabase = await createAdminClient()
    const fullName = `${validatedData.firstName} ${validatedData.lastName}`.trim()

    // Update profile - don't update status here if it's enum UserStatus
    // Status for onboarding will be stored in talent_profiles table
    const updateData: any = {
      full_name: fullName,
      first_name: validatedData.firstName,
      last_name: validatedData.lastName,
      updated_at: new Date().toISOString(),
    }
    
    // Add country and timezone if provided (they might not exist in table)
    if (validatedData.country) {
      updateData.country = validatedData.country
    }
    if (validatedData.timezone) {
      updateData.timezone = validatedData.timezone
    }
    
    // Add optional fields if provided
    updateData.bio = validatedData.bio
    updateData.phone = validatedData.phone
    updateData.location = validatedData.location
    const normalizedLinkedInUrl = validatedData.linkedInUrl?.trim() || null
    const normalizedGithubUrl = validatedData.githubUrl?.trim() || null
    updateData.linked_in_url = normalizedLinkedInUrl
    updateData.github_url = normalizedGithubUrl
    
    console.log('Updating profile with data:', { userId: user.id, updateData })
    
    const { data: updatedProfile, error: profileError } = await adminSupabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single()

    if (profileError) {
      console.error('Error updating profile:', profileError)
      console.error('Error details:', {
        message: profileError.message,
        code: profileError.code,
        details: profileError.details,
        hint: profileError.hint,
      })
      
      // If error is about missing column (country or timezone), try without them
      const isColumnError = profileError.code === '42703' || 
                           (profileError.message?.includes('column') && 
                            (profileError.message?.includes('country') || profileError.message?.includes('timezone')))
      
      if (isColumnError) {
        console.log('Column error detected, retrying without country/timezone fields')
        const retryData: any = {
          full_name: fullName,
          updated_at: new Date().toISOString(),
        }
        
        const { data: retryProfile, error: retryError } = await adminSupabase
          .from('profiles')
          .update(retryData)
          .eq('id', user.id)
          .select()
          .single()
        
        if (retryError) {
          console.error('Retry also failed:', retryError)
          return errorResponse(`Failed to update profile: ${retryError.message || 'Unknown error'}`, 500)
        }
        
        console.log('Profile updated successfully (without country/timezone):', retryProfile?.id)
      } else {
        return errorResponse(`Failed to update profile: ${profileError.message || 'Unknown error'}`, 500)
      }
    } else if (!updatedProfile) {
      console.error('Profile update returned no data')
      return errorResponse('Failed to update profile: No data returned', 500)
    } else {
      console.log('Profile updated successfully:', updatedProfile.id)
    }

    // Calculate profile completion based on filled fields
    const calculateProfileCompletion = (): number => {
      const fields = [
        validatedData.firstName, // firstName is required
        validatedData.lastName, // lastName is required
        validatedData.jobTitle, // jobTitle is required
        validatedData.country, // country is required
        validatedData.timezone, // timezone is required
        validatedData.experience, // experience is required
        validatedData.skillIds?.length > 0, // at least one skill
        validatedData.bio, // bio is optional
        validatedData.phone, // phone is optional
        validatedData.location, // location is optional
        validatedData.portfolioUrl, // portfolio is optional
        validatedData.linkedInUrl, // linkedIn is optional
        validatedData.githubUrl, // github is optional
        validatedData.introVideoUrl, // video is optional
        validatedData.hourlyRate,
        validatedData.availability,
      ]
      const completed = fields.filter(Boolean).length
      return Math.round((completed / fields.length) * 100)
    }

    const profileCompletion = calculateProfileCompletion()
    console.log('📊 Calculated profile completion:', profileCompletion, '%')

    // Update talent_profiles status for onboarding (this is where SUBMITTED status should be stored)
    // First, ensure talent_profiles record exists
    const { data: existingTalentProfile, error: checkTalentError } = await adminSupabase
      .from('talent_profiles')
      .select('id, status, profile_completion')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (checkTalentError && checkTalentError.code !== 'PGRST116') {
      console.error('Error checking talent_profiles:', checkTalentError)
      // Continue anyway - might not exist yet
    } else {
      console.log('📊 Existing talent profile:', {
        exists: !!existingTalentProfile,
        current_status: existingTalentProfile?.status,
        current_completion: existingTalentProfile?.profile_completion
      })
    }

    // Prepare all talent profile data in one object
    const talentProfileData: any = {
      headline: validatedData.jobTitle, // Professional job title (required)
      experience: validatedData.experience,
      bio: validatedData.bio,
      portfolio_url: validatedData.portfolioUrl?.trim() || null,
      intro_video_url: validatedData.introVideoUrl,
      hourly_rate: validatedData.hourlyRate || null,
      availability: validatedData.availability || null,
      status: 'SUBMITTED',
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      profile_completion: profileCompletion,
      is_profile_ready: false, // Will be set to true when approved by admin
    }
    
    console.log('📊 Talent profile data to save:', {
      user_id: user.id,
      status: talentProfileData.status,
      profile_completion: talentProfileData.profile_completion,
      has_headline: !!talentProfileData.headline,
      has_experience: !!talentProfileData.experience,
      has_portfolio: !!talentProfileData.portfolio_url,
      has_video: !!talentProfileData.intro_video_url,
    })

    let talentProfileId: string | undefined

    if (existingTalentProfile) {
      // Update existing talent_profiles with all data at once
      console.log('Updating existing talent_profiles:', {
        user_id: user.id,
        existing_id: existingTalentProfile.id,
        current_status: existingTalentProfile.status,
        new_status: 'SUBMITTED',
        data: talentProfileData
      })
      
      const { data: updatedTalent, error: talentUpdateError } = await adminSupabase
        .from('talent_profiles')
        .update(talentProfileData)
        .eq('id', existingTalentProfile.id)
        .select('id, status')
        .single()
      
      if (talentUpdateError) {
        console.error('Error updating talent_profiles:', talentUpdateError)
        console.error('Error details:', {
          message: talentUpdateError.message,
          code: talentUpdateError.code,
          details: talentUpdateError.details,
          hint: talentUpdateError.hint
        })
        console.error('Update data:', JSON.stringify(talentProfileData, null, 2))
        return errorResponse(`Failed to update talent profile: ${talentUpdateError.message}`, 500)
      }
      
      if (!updatedTalent) {
        console.error('Update returned no data')
        return errorResponse('Failed to update talent profile: No data returned', 500)
      }
      
      talentProfileId = updatedTalent.id
      console.log('✅ Successfully updated talent_profiles:', {
        id: talentProfileId,
        status: updatedTalent.status,
        completion: profileCompletion
      })
      
      // Verify the update was successful by fetching the record again
      const { data: verifyTalent, error: verifyError } = await adminSupabase
        .from('talent_profiles')
        .select('id, status, submitted_at')
        .eq('user_id', user.id)
        .single()
      
      if (verifyError) {
        console.error('⚠️ Warning: Could not verify status update:', verifyError)
      } else {
        console.log('✅ Verified status update:', {
          id: verifyTalent?.id,
          status: verifyTalent?.status,
          submitted_at: verifyTalent?.submitted_at
        })
        
        // Double-check status is SUBMITTED
        if (verifyTalent?.status !== 'SUBMITTED') {
          console.error('❌ ERROR: Status was not updated to SUBMITTED! Current status:', verifyTalent?.status)
          // Try to update again
          const { error: retryError } = await adminSupabase
            .from('talent_profiles')
            .update({ status: 'SUBMITTED', submitted_at: new Date().toISOString() })
            .eq('user_id', user.id)
          
          if (retryError) {
            console.error('❌ Retry update also failed:', retryError)
          } else {
            console.log('✅ Retry update successful')
          }
        }
      }
    } else {
      // Create talent_profiles if it doesn't exist
      talentProfileData.user_id = user.id
      
      console.log('Creating new talent_profiles:', {
        user_id: user.id,
        status: 'SUBMITTED',
        data: talentProfileData
      })
      
      const { data: createdTalent, error: createTalentError } = await adminSupabase
        .from('talent_profiles')
        .insert(talentProfileData)
        .select('id, status')
        .single()
      
      if (createTalentError) {
        console.error('Error creating talent_profiles:', createTalentError)
        console.error('Error details:', {
          message: createTalentError.message,
          code: createTalentError.code,
          details: createTalentError.details,
          hint: createTalentError.hint
        })
        console.error('Insert data:', JSON.stringify(talentProfileData, null, 2))
        return errorResponse(`Failed to create talent profile: ${createTalentError.message}`, 500)
      }
      
      if (!createdTalent) {
        console.error('Insert returned no data')
        return errorResponse('Failed to create talent profile: No data returned', 500)
      }
      
      talentProfileId = createdTalent.id
      console.log('✅ Successfully created talent_profiles:', {
        id: talentProfileId,
        status: createdTalent.status,
        completion: profileCompletion
      })
      
      // Verify the creation was successful
      const { data: verifyTalent, error: verifyError } = await adminSupabase
        .from('talent_profiles')
        .select('id, status, submitted_at')
        .eq('user_id', user.id)
        .single()
      
      if (verifyError) {
        console.error('⚠️ Warning: Could not verify status creation:', verifyError)
      } else {
        console.log('✅ Verified status creation:', {
          id: verifyTalent?.id,
          status: verifyTalent?.status,
          submitted_at: verifyTalent?.submitted_at
        })
      }
    }

    if (!talentProfileId) {
      return errorResponse('Failed to get talent profile ID', 500)
    }

    // Best-effort sync to candidate profile (Prisma) for profile overview fields
    try {
      await db.candidateProfile.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          headline: validatedData.jobTitle,
          bio: validatedData.bio,
          location: validatedData.location,
          phone: validatedData.phone,
          hourlyRate: validatedData.hourlyRate ?? null,
          availability: validatedData.availability ?? null,
          portfolioUrl: validatedData.portfolioUrl?.trim() || null,
          linkedInUrl: normalizedLinkedInUrl,
          githubUrl: normalizedGithubUrl,
          videoIntroUrl: validatedData.introVideoUrl,
        },
        update: {
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          headline: validatedData.jobTitle,
          bio: validatedData.bio,
          location: validatedData.location,
          phone: validatedData.phone,
          hourlyRate: validatedData.hourlyRate ?? null,
          availability: validatedData.availability ?? null,
          portfolioUrl: validatedData.portfolioUrl?.trim() || null,
          linkedInUrl: normalizedLinkedInUrl,
          githubUrl: normalizedGithubUrl,
          videoIntroUrl: validatedData.introVideoUrl,
        },
      })
    } catch (prismaError) {
      console.warn('Failed to sync candidate profile (non-blocking):', prismaError)
    }

    // Update skills (delete old, insert new)
    // Note: Skills might be stored in a junction table or directly in talent_profiles
    // For now, we'll try to use _CandidateSkills junction table if it exists
    if (validatedData.skillIds.length > 0) {
      try {
        // Try to delete existing skills from junction table
        const { error: deleteError } = await adminSupabase
          .from('_CandidateSkills')
          .delete()
          .eq('A', talentProfileId)

        if (deleteError) {
          console.warn('Could not delete skills from _CandidateSkills (table might not exist):', deleteError.message)
          // Continue anyway - might not have existing skills or table doesn't exist
        }

        // Insert new skills
        const skillLinks = validatedData.skillIds.map((skillId) => ({
          A: talentProfileId,
          B: skillId,
        }))

        const { error: skillsError } = await adminSupabase
          .from('_CandidateSkills')
          .insert(skillLinks)

        if (skillsError) {
          console.warn('Could not insert skills to _CandidateSkills (table might not exist):', skillsError.message)
          // Don't fail the whole operation if skills fail, but log it
          // Skills might be stored differently or table doesn't exist yet
        } else {
          console.log('Skills updated successfully:', skillLinks.length, 'skills')
        }
      } catch (skillsErr) {
        console.warn('Exception updating skills (non-critical):', skillsErr)
        // Don't fail the whole operation if skills fail
      }
    }

    return successResponse({ message: 'Profile submitted successfully' })
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors)
      const errorMessages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')
      return errorResponse(`Validation error: ${errorMessages}`, 400)
    }
    console.error('Error in POST /api/user/profile/submit:', error)
    // Log full error details for debugging
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    return errorResponse(`Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}`, 500)
  }
}
