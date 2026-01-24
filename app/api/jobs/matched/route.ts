import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser, successResponse, errorResponse } from '@/lib/api-utils'
import { getSupabaseClient, createAdminClient } from '@/lib/supabase/server-helper'

/**
 * GET /api/jobs/matched
 * Get jobs matched with talent's skills and job title
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return errorResponse('Unauthorized', 401)
    }

    if (user.role !== 'TALENT') {
      return errorResponse('Only talent users can access matched jobs', 403)
    }

    const supabase = await getSupabaseClient()
    const adminSupabase = await createAdminClient()

    // Get talent profile with headline (job title)
    const { data: talentProfile, error: talentError } = await adminSupabase
      .from('talent_profiles')
      .select('id, user_id, headline')
      .eq('user_id', user.id)
      .maybeSingle()

    if (talentError && talentError.code !== 'PGRST116') {
      console.error('Error fetching talent profile:', talentError)
      return errorResponse('Failed to fetch talent profile', 500)
    }

    // If no talent profile, return empty results
    if (!talentProfile) {
      return successResponse({
        jobs: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      })
    }

    const talentHeadline = talentProfile.headline || ''

    // Get talent's skills from _CandidateSkills junction table
    const { data: candidateSkills, error: skillsError } = await adminSupabase
      .from('_CandidateSkills')
      .select('B')
      .eq('A', talentProfile.id)

    if (skillsError) {
      console.error('Error fetching candidate skills:', skillsError)
      return errorResponse('Failed to fetch skills', 500)
    }

    const talentSkillIds = candidateSkills?.map((cs: any) => cs.B).filter(Boolean) || []
    const matchedJobIds = new Set<string>()

    // Strategy 1: Match by skills
    if (talentSkillIds.length > 0) {
      const { data: jobSkills, error: jobSkillsError } = await adminSupabase
        .from('_JobSkills')
        .select('A')
        .in('B', talentSkillIds)

      if (!jobSkillsError && jobSkills) {
        jobSkills.forEach((js: any) => {
          if (js.A) matchedJobIds.add(js.A)
        })
      }
    }

    // Strategy 2: Match by job title/headline keywords
    if (talentHeadline) {
      // Extract meaningful keywords from headline (min 3 characters)
      const keywords = talentHeadline
        .toLowerCase()
        .split(/[\s\/-]+/)
        .filter((k: string) => k.length >= 3)
        .slice(0, 5) // Limit to 5 keywords to avoid query too long

      if (keywords.length > 0) {
        // Build OR query for title matching
        const titleConditions = keywords.map((k: string) => `title.ilike.%${k}%`).join(',')
        
        const { data: headlineMatchedJobs, error: headlineError } = await adminSupabase
          .from('jobs')
          .select('id')
          .eq('status', 'PUBLISHED')
          .or(titleConditions)

        if (!headlineError && headlineMatchedJobs) {
          headlineMatchedJobs.forEach((job: any) => {
            if (job.id) matchedJobIds.add(job.id)
          })
        }
      }
    }

    // If no matches found, return empty
    if (matchedJobIds.size === 0) {
      return successResponse({
        jobs: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      })
    }

    // Fetch matched jobs
    const jobIdsArray = Array.from(matchedJobIds)
    const { data: jobs, error: jobsError, count } = await adminSupabase
      .from('jobs')
      .select('*', { count: 'exact' })
      .in('id', jobIdsArray)
      .eq('status', 'PUBLISHED')
      .order('created_at', { ascending: false })
      .limit(10)

    if (jobsError) {
      console.error('Error fetching matched jobs:', jobsError)
      return errorResponse('Failed to fetch matched jobs', 500)
    }

    // Enrich jobs with company, recruiter, and skills data
    const enrichedJobs = await enrichJobs(jobs || [], adminSupabase)

    return successResponse({
      jobs: enrichedJobs,
      pagination: {
        page: 1,
        limit: 10,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / 10),
      },
    })
  } catch (error) {
    console.error('Error in GET /api/jobs/matched:', error)
    return errorResponse('Internal server error', 500)
  }
}

/**
 * Enrich jobs with company, recruiter, and skills data
 */
async function enrichJobs(jobs: any[], adminSupabase: any) {
  return Promise.all(
    jobs.map(async (job: any) => {
      // Fetch company
      let company = null
      const companyId = job.companyId || job.company_id
      if (companyId) {
        const { data: companyData } = await adminSupabase
          .from('companies')
          .select('id, name, logo_url, description, website')
          .eq('id', companyId)
          .single()
        if (companyData) {
          company = {
            id: companyData.id,
            name: companyData.name,
            logoUrl: companyData.logo_url,
            description: companyData.description,
            website: companyData.website,
          }
        }
      }

      // Fetch recruiter profile
      let recruiter = null
      const recruiterId = job.recruiterId || job.recruiter_id
      if (recruiterId) {
        const { data: recruiterData } = await adminSupabase
          .from('profiles')
          .select('id, email, full_name')
          .eq('id', recruiterId)
          .single()
        if (recruiterData) {
          recruiter = {
            id: recruiterData.id,
            email: recruiterData.email,
            name: recruiterData.full_name,
          }
        }
      }

      // Fetch job skills
      const { data: jobSkillsData } = await adminSupabase
        .from('_JobSkills')
        .select('B')
        .eq('A', job.id)

      let skills: Array<{ id: string; name: string }> = []
      if (jobSkillsData && jobSkillsData.length > 0) {
        const skillIds = jobSkillsData.map((js: any) => js.B).filter(Boolean)
        if (skillIds.length > 0) {
          const { data: skillsData } = await adminSupabase
            .from('skills')
            .select('id, name')
            .in('id', skillIds)

          if (skillsData) {
            skills = skillsData.map((s: any) => ({ id: s.id, name: s.name }))
          }
        }
      }

      return {
        id: job.id,
        title: job.title,
        description: job.description,
        requirements: job.requirements,
        location: job.location,
        remote: job.remote,
        salaryMin: job.salaryMin || job.salary_min,
        salaryMax: job.salaryMax || job.salary_max,
        currency: job.currency || 'USD',
        status: job.status,
        company,
        recruiter,
        skills,
        createdAt: job.createdAt || job.created_at,
        publishedAt: job.publishedAt || job.published_at,
      }
    })
  )
}
