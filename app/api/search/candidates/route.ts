import { NextRequest } from 'next/server'
import { candidateSearchSchema } from '@/lib/validations'
import { getAuthUser, successResponse, handleApiError, errorResponse } from '@/lib/api-utils'
import { getSupabaseClient } from '@/lib/supabase/server-helper'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getAuthUser(request)
    if (!user) {
      return errorResponse('Unauthorized', 401)
    }

    const { searchParams } = new URL(request.url)
    const validatedParams = candidateSearchSchema.parse({
      query: searchParams.get('query') || undefined,
      location: searchParams.get('location') || undefined,
      skillIds: searchParams.get('skillIds')?.split(',').filter(Boolean),
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
    })

    const supabase = await getSupabaseClient()
    const skip = (validatedParams.page - 1) * validatedParams.limit

    // First, get all TALENT profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('role', 'TALENT')

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError)
      return handleApiError(profilesError)
    }

    if (!profiles || profiles.length === 0) {
      return successResponse({
        candidates: [],
        pagination: {
          page: validatedParams.page,
          limit: validatedParams.limit,
          total: 0,
          totalPages: 0,
        },
      })
    }

    const profileIds = profiles.map(p => p.id)

    // Build query for talent profiles
    let query = supabase
      .from('talent_profiles')
      .select('*', { count: 'exact' })
      .in('user_id', profileIds)

    // Apply filters
    if (validatedParams.query) {
      query = query.or(`headline.ilike.%${validatedParams.query}%,bio.ilike.%${validatedParams.query}%`)
    }

    if (validatedParams.location) {
      // Note: location might be in profiles table, we'll filter later
      query = query.ilike('location', `%${validatedParams.location}%`)
    }

    // Apply pagination
    query = query.range(skip, skip + validatedParams.limit - 1)
    query = query.order('created_at', { ascending: false })

    const { data: talentProfiles, error, count } = await query

    if (error) {
      console.error('Error fetching talent profiles:', error)
      return handleApiError(error)
    }

    // Create profile map for quick lookup
    const profileMap = new Map(profiles.map(p => [p.id, p]))

    // Enrich with skills and application count
    const enrichedCandidates = await Promise.all(
      (talentProfiles || []).map(async (talent: any) => {
        const profile = profileMap.get(talent.user_id)

        // Apply location filter if needed (from profiles table)
        if (validatedParams.location && profile) {
          // Location might be in profiles, but we don't have it in the query
          // For now, we'll skip location filtering on profiles
        }

        // Fetch skills from junction table (talent_skills)
        let skills: Array<{ id: string; name: string }> = []
        try {
          const { data: talentSkills } = await supabase
            .from('talent_skills')
            .select('skill_id')
            .eq('talent_id', talent.id)

          if (talentSkills && talentSkills.length > 0) {
            const skillIds = talentSkills.map((ts: any) => ts.skill_id).filter(Boolean)
            
            // Filter by skillIds if provided
            if (validatedParams.skillIds && validatedParams.skillIds.length > 0) {
              const hasMatchingSkill = skillIds.some((sid: string) => validatedParams.skillIds!.includes(sid))
              if (!hasMatchingSkill) {
                return null // Skip this candidate
              }
            }

            // Fetch skill details
            const { data: skillDetails } = await supabase
              .from('skills')
              .select('id, name')
              .in('id', skillIds)

            if (skillDetails) {
              skills = skillDetails.map((s: any) => ({ id: s.id, name: s.name }))
            }
          }
        } catch (err) {
          console.error('Error fetching skills:', err)
        }

        // Count applications
        let applicationCount = 0
        try {
          const { count: appCount } = await supabase
            .from('applications')
            .select('*', { count: 'exact', head: true })
            .eq('talent_id', talent.id)

          applicationCount = appCount || 0
        } catch (err) {
          console.error('Error counting applications:', err)
        }

        // Get name from profile
        const fullName = profile?.full_name || ''
        const nameParts = fullName.split(' ')
        const firstName = nameParts[0] || null
        const lastName = nameParts.slice(1).join(' ') || null

        return {
          id: talent.id,
          firstName,
          lastName,
          bio: talent.bio,
          location: null, // Location not in talent_profiles, would need to add to schema
          headline: talent.headline,
          hourlyRate: talent.hourly_rate ? parseFloat(talent.hourly_rate) : null,
          availability: talent.availability,
          portfolioUrl: talent.portfolio_url,
          linkedInUrl: talent.linkedin_url,
          githubUrl: talent.github_url,
          user: {
            id: profile?.id || talent.user_id,
            email: profile?.email || '',
          },
          skills,
          _count: {
            applications: applicationCount,
          },
        }
      })
    )

    // Filter out null candidates (filtered by skills)
    const filteredCandidates = enrichedCandidates.filter(c => c !== null) as any[]

    return successResponse({
      candidates: filteredCandidates,
      pagination: {
        page: validatedParams.page,
        limit: validatedParams.limit,
        total: filteredCandidates.length, // Approximate, actual count would need more complex query
        totalPages: Math.ceil((filteredCandidates.length) / validatedParams.limit),
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}
