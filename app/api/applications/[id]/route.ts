import { NextRequest, NextResponse } from 'next/server'
import { updateApplicationSchema } from '@/lib/validations'
import { successResponse, errorResponse, handleApiError, getAuthUser } from '@/lib/api-utils'
import { getSupabaseClient } from '@/lib/supabase/server-helper'
import { createNotification } from '@/lib/notifications'

export const runtime = 'edge'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return errorResponse('Unauthorized', 401)
    }

    const supabase = await getSupabaseClient()

    // Fetch application
    const { data: application, error: appError } = await supabase
      .from('applications')
      .select('*')
      .eq('id', params.id)
      .single()

    if (appError || !application) {
      return errorResponse('Application not found', 404)
    }

    // Fetch job
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', application.job_id)
      .single()

    if (jobError || !job) {
      return errorResponse('Job not found', 404)
    }

    // Fetch company if exists
    let company = null
    if (job.company_id) {
      const { data: companyData } = await supabase
        .from('companies')
        .select('*')
        .eq('id', job.company_id)
        .single()
      company = companyData
    }

    // Fetch job skills
    let jobSkills: Array<{ id: string; name: string }> = []
    const { data: jobSkillsData } = await supabase
      .from('_JobSkills')
      .select('B')
      .eq('A', job.id)

    if (jobSkillsData && jobSkillsData.length > 0) {
      const skillIds = jobSkillsData.map((js: any) => js.B)
      const { data: skillsData } = await supabase
        .from('skills')
        .select('id, name')
        .in('id', skillIds)
      jobSkills = skillsData || []
    }

    // Fetch recruiter profile
    let recruiter = null
    if (job.recruiter_id) {
      const { data: recruiterData } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('id', job.recruiter_id)
        .single()
      if (recruiterData) {
        recruiter = {
          id: recruiterData.id,
          email: recruiterData.email,
        }
      }
    }

    // Fetch talent profile (candidate)
    let candidate = null
    if (application.talent_id) {
      const { data: talentProfile } = await supabase
        .from('talent_profiles')
        .select('*')
        .eq('id', application.talent_id)
        .single()

      if (talentProfile) {
        // Fetch user profile
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('id, email')
          .eq('id', talentProfile.user_id)
          .single()

        // Fetch talent skills
        let talentSkills: Array<{ id: string; name: string }> = []
        const { data: talentSkillsData } = await supabase
          .from('talent_skills')
          .select('skill_id')
          .eq('talent_id', talentProfile.id)

        if (talentSkillsData && talentSkillsData.length > 0) {
          const skillIds = talentSkillsData.map((ts: any) => ts.skill_id)
          const { data: skillsData } = await supabase
            .from('skills')
            .select('id, name')
            .in('id', skillIds)
          talentSkills = skillsData || []
        }

        candidate = {
          id: talentProfile.id,
          firstName: talentProfile.first_name,
          lastName: talentProfile.last_name,
          bio: talentProfile.bio,
          user: userProfile ? {
            id: userProfile.id,
            email: userProfile.email,
          } : null,
          skills: talentSkills,
        }
      }
    }

    // Check if user has access
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .single()

    const isCandidate = candidate && candidate.user?.id === user.id
    const isRecruiter = job.recruiter_id === user.id
    const adminRoles = ['SUPER_ADMIN', 'QUALITY_ADMIN', 'SUPPORT_ADMIN', 'ANALYST']
    const isAdmin = userProfile && adminRoles.includes(userProfile.role)

    if (!isCandidate && !isRecruiter && !isAdmin) {
      return errorResponse('Forbidden', 403)
    }

    return successResponse({
      id: application.id,
      jobId: application.job_id,
      candidateId: application.talent_id,
      status: application.status,
      coverLetter: application.cover_letter,
      resumeUrl: application.resume_url,
      notes: application.notes,
      createdAt: application.created_at,
      updatedAt: application.updated_at,
      job: {
        id: job.id,
        title: job.title,
        description: job.description,
        company,
        skills: jobSkills,
        recruiter,
      },
      candidate,
    })
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

    // Fetch application
    const { data: application, error: appError } = await supabase
      .from('applications')
      .select('*')
      .eq('id', id)
      .single()

    if (appError || !application) {
      return errorResponse('Application not found', 404)
    }

    // Fetch job
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', application.job_id)
      .single()

    if (jobError || !job) {
      return errorResponse('Job not found', 404)
    }

    // Check user access
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .single()

    const isRecruiter = job.recruiter_id === user.id
    const isCandidate = application.talent_id && user.id === application.talent_id

    // Only recruiters can update status and notes
    const body = await request.json()
    const validatedData = updateApplicationSchema.parse(body)

    if (validatedData.status || validatedData.notes) {
      const adminRoles = ['SUPER_ADMIN', 'QUALITY_ADMIN', 'SUPPORT_ADMIN']
      const isAdmin = userProfile && adminRoles.includes(userProfile.role)
      if (!isRecruiter && !isAdmin) {
        return errorResponse('Only recruiters can update application status', 403)
      }
    }

    // Candidates can only update cover letter and resume
    if (isCandidate && (validatedData.status || validatedData.notes)) {
      return errorResponse('Candidates cannot update status or notes', 403)
    }

    // Prepare update data (convert to snake_case)
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (validatedData.status !== undefined) {
      updateData.status = validatedData.status
    }
    if (validatedData.coverLetter !== undefined) {
      updateData.cover_letter = validatedData.coverLetter
    }
    if (validatedData.resumeUrl !== undefined) {
      updateData.resume_url = validatedData.resumeUrl
    }
    if (validatedData.notes !== undefined) {
      updateData.notes = validatedData.notes
    }

    // Update application
    const { data: updatedApplication, error: updateError } = await supabase
      .from('applications')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating application:', updateError)
      return handleApiError(updateError)
    }

    // Create notification if status changed (notify candidate)
    if (validatedData.status && validatedData.status !== application.status && application.talent_id) {
      const { data: jobData } = await supabase
        .from('jobs')
        .select('title')
        .eq('id', application.job_id)
        .single()

      if (jobData) {
        await createNotification({
          userId: application.talent_id,
          type: 'application',
          title: 'Application Status Updated',
          message: `Your application for "${jobData.title}" has been ${validatedData.status.toLowerCase()}`,
          link: `/talent/applications`,
        })
      }
    }

    // Fetch related data for response
    let company = null
    if (job.company_id) {
      const { data: companyData } = await supabase
        .from('companies')
        .select('*')
        .eq('id', job.company_id)
        .single()
      company = companyData
    }

    let candidate = null
    if (updatedApplication.talent_id) {
      const { data: talentProfile } = await supabase
        .from('talent_profiles')
        .select('*')
        .eq('id', updatedApplication.talent_id)
        .single()

      if (talentProfile) {
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('id, email')
          .eq('id', talentProfile.user_id)
          .single()

        candidate = {
          id: talentProfile.id,
          user: userProfile ? {
            id: userProfile.id,
            email: userProfile.email,
          } : null,
        }
      }
    }

    return successResponse({
      id: updatedApplication.id,
      jobId: updatedApplication.job_id,
      candidateId: updatedApplication.talent_id,
      status: updatedApplication.status,
      coverLetter: updatedApplication.cover_letter,
      resumeUrl: updatedApplication.resume_url,
      notes: updatedApplication.notes,
      createdAt: updatedApplication.created_at,
      updatedAt: updatedApplication.updated_at,
      job: {
        id: job.id,
        title: job.title,
        company,
      },
      candidate,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
