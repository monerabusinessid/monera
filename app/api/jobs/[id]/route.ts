import { NextRequest } from 'next/server'
import { updateJobSchema } from '@/lib/validations'
import { requireAuth, successResponse, errorResponse, handleApiError, getAuthUser } from '@/lib/api-utils'
import { getSupabaseClient } from '@/lib/supabase/server-helper'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id
    console.log('[API] GET /api/jobs/[id]: Fetching job with ID:', jobId, 'Type:', typeof jobId)
    
    if (!jobId) {
      console.error('[API] GET /api/jobs/[id]: No job ID provided')
      return errorResponse('Job ID is required', 400)
    }

    const supabase = await getSupabaseClient()
    const user = await getAuthUser(request)
    
    console.log('[API] GET /api/jobs/[id]: User:', user ? { id: user.id, role: user.role } : 'Not authenticated')
    
    // Fetch job - try with regular client first
    let job: any = null
    let jobError: any = null
    
    const { data: jobData, error: error1 } = await supabase
      .from('jobs')
      .select('id, title, description, requirements, scope_of_work, location, remote, salary_min, salary_max, currency, engagement_type, hours_per_week, duration, experience_level, project_type, status, recruiter_id, company_id, category, created_at, updated_at, published_at')
      .eq('id', jobId)
      .single()

    if (error1) {
      console.log('[API] GET /api/jobs/[id]: RLS blocked or error, trying with admin client')
      // If RLS blocks, try with admin client (especially for published jobs)
      const adminSupabase = await createAdminClient()
      const { data: adminJobData, error: adminError } = await adminSupabase
        .from('jobs')
        .select('id, title, description, requirements, scope_of_work, location, remote, salary_min, salary_max, currency, engagement_type, hours_per_week, duration, experience_level, project_type, status, recruiter_id, company_id, category, created_at, updated_at, published_at')
        .eq('id', jobId)
        .single()
      
      if (adminError) {
        console.error('[API] GET /api/jobs/[id]: Job fetch error (admin):', adminError)
        jobError = adminError
      } else {
        job = adminJobData
      }
    } else {
      job = jobData
    }

    if (jobError || !job) {
      console.error('[API] GET /api/jobs/[id]: Job not found in database for ID:', jobId)
      return errorResponse('Job not found', 404)
    }

    console.log('[API] GET /api/jobs/[id]: Job found:', { id: job.id, title: job.title, status: job.status })

    // Check if job is accessible:
    // - If job is PUBLISHED, anyone can view
    // - If job is not PUBLISHED (or null/undefined), only the owner (recruiter) or admin can view
    const jobStatus = job.status || 'DRAFT'
    if (jobStatus !== 'PUBLISHED') {
      if (!user) {
        console.log('[API] Job is not published (status:', jobStatus, ') and user is not authenticated')
        return errorResponse('Job not found', 404)
      }
      
      // Check if user is the owner or admin
      const isOwner = job.recruiter_id === user.id
      const isAdmin = ['SUPER_ADMIN', 'QUALITY_ADMIN', 'SUPPORT_ADMIN', 'ANALYST', 'ADMIN'].includes(user.role)
      
      if (!isOwner && !isAdmin) {
        console.log('[API] Job is not published (status:', jobStatus, ') and user is not owner/admin')
        return errorResponse('Job not found', 404)
      }
    }

    // Fetch company and recruiter using adminSupabase to bypass RLS
    const adminSupabase = await createAdminClient()
    
    // Fetch company
    let company = null
    if (job.company_id) {
      const { data: companyData } = await adminSupabase
        .from('companies')
        .select('id, name, logo_url, description, website')
        .eq('id', job.company_id)
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

    // Fetch recruiter
    let recruiter = null
    if (job.recruiter_id) {
      const { data: recruiterData } = await adminSupabase
        .from('profiles')
        .select('id, email, full_name')
        .eq('id', job.recruiter_id)
        .single()
      if (recruiterData) {
        recruiter = {
          id: recruiterData.id,
          email: recruiterData.email,
          name: recruiterData.full_name,
        }
      }
    }

    // Fetch skills from junction table using adminSupabase
    let skills: Array<{ id: string; name: string }> = []
    try {
      const { data: jobSkills } = await adminSupabase
        .from('_JobSkills')
        .select('B') // B is skill_id
        .eq('A', job.id) // A is job_id
      
      if (jobSkills && jobSkills.length > 0) {
        const skillIds = [...new Set(jobSkills.map((js: any) => js.B).filter(Boolean))]
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
    } catch (error) {
      console.log('Error fetching skills:', error)
    }

    // Count applications
    const { count: applicationsCount } = await supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .eq('job_id', job.id)

    // Transform to match expected format
    const enrichedJob = {
      id: job.id,
      title: job.title,
      description: job.description,
      requirements: job.requirements || null,
      scopeOfWork: job.scope_of_work || null,
      location: job.location,
      remote: job.remote || false,
      salaryMin: job.salary_min || null,
      salaryMax: job.salary_max || null,
      currency: job.currency || 'USD',
      engagementType: job.engagement_type || null,
      hoursPerWeek: job.hours_per_week || null,
      duration: job.duration || null,
      experienceLevel: job.experience_level || null,
      projectType: job.project_type || null,
      status: job.status,
      category: job.category || null, // Include category
      company,
      recruiter,
      skills,
      createdAt: job.created_at || new Date().toISOString(),
      updatedAt: job.updated_at || new Date().toISOString(),
      publishedAt: job.published_at || null,
      _count: {
        applications: applicationsCount || 0,
      },
    }

    return successResponse(enrichedJob)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getAuthUser(request)
  if (!user) {
    return errorResponse('Unauthorized', 401)
  }

  try {
    const id = params.id
    const supabase = await getSupabaseClient()

    // Check if user owns the job
    const { data: existingJob, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single()

    if (jobError || !existingJob) {
      return errorResponse('Job not found', 404)
    }

    if (existingJob.recruiter_id !== user.id) {
      return errorResponse('Forbidden', 403)
    }

    const body = await request.json()
    const validatedData = updateJobSchema.parse(body)

    const { skillIds, ...jobData } = validatedData

    // Prepare update data (convert to snake_case)
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (jobData.title !== undefined) updateData.title = jobData.title
    if (jobData.description !== undefined) updateData.description = jobData.description
    if (jobData.requirements !== undefined) updateData.requirements = jobData.requirements
    if ((jobData as any).scopeOfWork !== undefined) updateData.scope_of_work = (jobData as any).scopeOfWork
    if (jobData.location !== undefined) updateData.location = jobData.location
    if (jobData.remote !== undefined) updateData.remote = jobData.remote
    if (jobData.salaryMin !== undefined) updateData.salary_min = jobData.salaryMin
    if (jobData.salaryMax !== undefined) updateData.salary_max = jobData.salaryMax
    if (jobData.currency !== undefined) updateData.currency = jobData.currency
    if ((jobData as any).engagementType !== undefined) updateData.engagement_type = (jobData as any).engagementType
    if ((jobData as any).hoursPerWeek !== undefined) updateData.hours_per_week = (jobData as any).hoursPerWeek
    if ((jobData as any).duration !== undefined) updateData.duration = (jobData as any).duration
    if ((jobData as any).experienceLevel !== undefined) updateData.experience_level = (jobData as any).experienceLevel
    if ((jobData as any).projectType !== undefined) updateData.project_type = (jobData as any).projectType
    if (jobData.status !== undefined) {
      updateData.status = jobData.status
      if (jobData.status === 'PUBLISHED' && existingJob.status !== 'PUBLISHED') {
        updateData.published_at = new Date().toISOString()
      }
    }

    // Update job
    const { data: updatedJob, error: updateError } = await supabase
      .from('jobs')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating job:', updateError)
      return handleApiError(updateError)
    }

    // Update skills if provided
    if (skillIds !== undefined) {
      // Delete existing job skills
      await supabase
        .from('_JobSkills')
        .delete()
        .eq('A', id) // A is job_id

      // Insert new job skills
      if (skillIds.length > 0) {
        const jobSkillsData = skillIds.map((skillId: string) => ({
          A: id, // job_id
          B: skillId, // skill_id
        }))

        await supabase
          .from('_JobSkills')
          .insert(jobSkillsData)
      }
    }

    // Fetch related data
    let company = null
    if (updatedJob.company_id) {
      const { data: companyData } = await supabase
        .from('companies')
        .select('*')
        .eq('id', updatedJob.company_id)
        .single()
      company = companyData
    }

    let skills: Array<{ id: string; name: string }> = []
    if (skillIds !== undefined && skillIds.length > 0) {
      const { data: skillsData } = await supabase
        .from('skills')
        .select('id, name')
        .in('id', skillIds)
      if (skillsData) {
        skills = skillsData.map((s: any) => ({ id: s.id, name: s.name }))
      }
    } else {
      // Fetch current skills
      const { data: jobSkills } = await supabase
        .from('_JobSkills')
        .select('B')
        .eq('A', id)
      if (jobSkills && jobSkills.length > 0) {
        const skillIds = [...new Set(jobSkills.map((js: any) => js.B).filter(Boolean))]
        if (skillIds.length > 0) {
          const { data: skillsData } = await supabase
            .from('skills')
            .select('id, name')
            .in('id', skillIds)
          if (skillsData) {
            skills = skillsData.map((s: any) => ({ id: s.id, name: s.name }))
          }
        }
      }
    }

    // Transform to match expected format
    const enrichedJob = {
      id: updatedJob.id,
      title: updatedJob.title,
      description: updatedJob.description,
      requirements: updatedJob.requirements || null,
      scopeOfWork: updatedJob.scope_of_work || null,
      location: updatedJob.location,
      remote: updatedJob.remote || false,
      salaryMin: updatedJob.salary_min || null,
      salaryMax: updatedJob.salary_max || null,
      currency: updatedJob.currency || 'USD',
      engagementType: updatedJob.engagement_type || null,
      hoursPerWeek: updatedJob.hours_per_week || null,
      duration: updatedJob.duration || null,
      experienceLevel: updatedJob.experience_level || null,
      projectType: updatedJob.project_type || null,
      status: updatedJob.status,
      company,
      skills,
      createdAt: updatedJob.created_at || new Date().toISOString(),
      updatedAt: updatedJob.updated_at || new Date().toISOString(),
    }

    return successResponse(enrichedJob)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getAuthUser(request)
  if (!user) {
    return errorResponse('Unauthorized', 401)
  }

  try {
    const supabase = await getSupabaseClient()

    // Check if job exists and user owns it
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('recruiter_id')
      .eq('id', params.id)
      .single()

    if (jobError || !job) {
      return errorResponse('Job not found', 404)
    }

    if (job.recruiter_id !== user.id) {
      return errorResponse('Forbidden', 403)
    }

    // Delete job (cascade will handle related records)
    const { error: deleteError } = await supabase
      .from('jobs')
      .delete()
      .eq('id', params.id)

    if (deleteError) {
      console.error('Error deleting job:', deleteError)
      return handleApiError(deleteError)
    }

    return successResponse({ message: 'Job deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}
