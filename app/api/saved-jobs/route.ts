import { NextRequest } from 'next/server'
import { getAuthUser, successResponse, errorResponse } from '@/lib/api-utils'
import { createAdminClient } from '@/lib/supabase/server'
export const dynamic = 'force-dynamic'
export const runtime = 'edge'

// GET - List saved jobs
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return errorResponse('Unauthorized', 401)
    }

    const { searchParams } = new URL(request.url)
    const includeJobs = searchParams.get('includeJobs') === '1'

    const supabase = await createAdminClient()

    // Get saved jobs
    const { data: savedJobs, error } = await supabase
      .from('saved_jobs')
      .select('job_id, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching saved jobs:', error)
      return errorResponse('Failed to fetch saved jobs', 500)
    }

    const count = savedJobs?.length || 0

    if (!includeJobs || !savedJobs || savedJobs.length === 0) {
      return successResponse({
        count,
        jobIds: savedJobs?.map((sj: any) => sj.job_id) || [],
        jobs: [],
      })
    }

    // Fetch job details
    const jobIds = savedJobs.map((sj: any) => sj.job_id)
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select('id, title, description, location, remote, salary_min, salary_max, currency, company_id, recruiter_id, created_at')
      .in('id', jobIds)
      .eq('status', 'PUBLISHED')

    if (jobsError) {
      console.error('Error fetching job details:', jobsError)
      return errorResponse('Failed to fetch job details', 500)
    }

    // Fetch companies and recruiters
    const companyIds = [...new Set(jobs?.map((j: any) => j.company_id).filter(Boolean))]
    const recruiterIds = [...new Set(jobs?.map((j: any) => j.recruiter_id).filter(Boolean))]

    let companiesMap = new Map()
    if (companyIds.length > 0) {
      const { data: companies } = await supabase
        .from('companies')
        .select('id, name')
        .in('id', companyIds)
      companies?.forEach((c: any) => companiesMap.set(c.id, c))
    }

    let recruitersMap = new Map()
    if (recruiterIds.length > 0) {
      const { data: recruiters } = await supabase
        .from('profiles')
        .select('id, email')
        .in('id', recruiterIds)
      recruiters?.forEach((r: any) => recruitersMap.set(r.id, r))
    }

    // Fetch skills
    const { data: jobSkills } = await supabase
      .from('_JobSkills')
      .select('A, B')
      .in('A', jobIds)

    const skillIds = [...new Set(jobSkills?.map((js: any) => js.B).filter(Boolean))]
    let skillsMap = new Map()
    if (skillIds.length > 0) {
      const { data: skills } = await supabase
        .from('skills')
        .select('id, name')
        .in('id', skillIds)
      skills?.forEach((s: any) => skillsMap.set(s.id, s))
    }

    const jobSkillsMap = new Map()
    jobSkills?.forEach((js: any) => {
      if (!jobSkillsMap.has(js.A)) jobSkillsMap.set(js.A, [])
      jobSkillsMap.get(js.A).push(js.B)
    })

    const enrichedJobs = jobs?.map((job: any) => ({
      id: job.id,
      title: job.title,
      description: job.description,
      location: job.location,
      remote: job.remote || false,
      salaryMin: job.salary_min,
      salaryMax: job.salary_max,
      currency: job.currency || 'USD',
      company: job.company_id ? companiesMap.get(job.company_id) || null : null,
      recruiter: job.recruiter_id ? recruitersMap.get(job.recruiter_id) || null : null,
      skills: (jobSkillsMap.get(job.id) || []).map((sid: string) => skillsMap.get(sid)).filter(Boolean),
      createdAt: job.created_at,
    }))

    return successResponse({
      count,
      jobIds,
      jobs: enrichedJobs || [],
    })
  } catch (error: any) {
    console.error('Error in GET /api/saved-jobs:', error)
    return errorResponse(error.message || 'Internal server error', 500)
  }
}

// POST - Save a job
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return errorResponse('Unauthorized', 401)
    }

    const body = await request.json()
    const { jobId } = body

    if (!jobId) {
      return errorResponse('Job ID is required', 400)
    }

    const supabase = await createAdminClient()

    // Check if already saved
    const { data: existing } = await supabase
      .from('saved_jobs')
      .select('id')
      .eq('user_id', user.id)
      .eq('job_id', jobId)
      .single()

    if (existing) {
      return errorResponse('Job already saved', 400)
    }

    // Save job
    const { error } = await supabase
      .from('saved_jobs')
      .insert({
        user_id: user.id,
        job_id: jobId,
        created_at: new Date().toISOString(),
      })

    if (error) {
      console.error('Error saving job:', error)
      return errorResponse('Failed to save job', 500)
    }

    return successResponse({ message: 'Job saved successfully' })
  } catch (error: any) {
    console.error('Error in POST /api/saved-jobs:', error)
    return errorResponse(error.message || 'Internal server error', 500)
  }
}

// DELETE - Unsave a job
export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return errorResponse('Unauthorized', 401)
    }

    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')

    if (!jobId) {
      return errorResponse('Job ID is required', 400)
    }

    const supabase = await createAdminClient()

    const { error } = await supabase
      .from('saved_jobs')
      .delete()
      .eq('user_id', user.id)
      .eq('job_id', jobId)

    if (error) {
      console.error('Error unsaving job:', error)
      return errorResponse('Failed to unsave job', 500)
    }

    return successResponse({ message: 'Job unsaved successfully' })
  } catch (error: any) {
    console.error('Error in DELETE /api/saved-jobs:', error)
    return errorResponse(error.message || 'Internal server error', 500)
  }
}
