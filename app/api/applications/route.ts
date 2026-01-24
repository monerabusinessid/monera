import { NextRequest, NextResponse } from 'next/server'
import { createApplicationSchema } from '@/lib/validations'
import { requireAuth, successResponse, handleApiError, getAuthUser } from '@/lib/api-utils'
import { getSupabaseClient } from '@/lib/supabase/server-helper'
import { createAdminClient } from '@/lib/supabase/server'
import { createNotification } from '@/lib/notifications'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')
    const candidateIdParam = searchParams.get('candidateId')
    const talentIdParam = searchParams.get('talentId') // Support both for backward compatibility
    const recruiterIdParam = searchParams.get('recruiterId')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    const supabase = await getSupabaseClient()
    let query = supabase
      .from('applications')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (jobId) {
      query = query.eq('job_id', jobId)
    }
    if (status) {
      query = query.eq('status', status)
    }

    // Handle talentId=me or candidateId=me (backward compatibility)
    // Note: In schema, applications.candidate_id references profiles.id (not talent_profiles.id)
    const talentIdToUse = talentIdParam || candidateIdParam
    if (talentIdToUse === 'me') {
      const user = await getAuthUser(request)
      if (user) {
        // candidate_id in applications table references profiles.id directly
        query = query.eq('candidate_id', user.id)
      }
    } else if (talentIdToUse) {
      query = query.eq('candidate_id', talentIdToUse)
    }

    // Handle recruiterId=me (for clients to see applications to their jobs)
    if (recruiterIdParam === 'me') {
      const user = await getAuthUser(request)
      if (user) {
        // Get jobs posted by this recruiter
        const { data: recruiterJobs } = await supabase
          .from('jobs')
          .select('id')
          .eq('recruiter_id', user.id)
        
        if (recruiterJobs && recruiterJobs.length > 0) {
          const jobIds = recruiterJobs.map((j: any) => j.id)
          query = query.in('job_id', jobIds)
        } else {
          // No jobs found, return empty
          return successResponse({
            applications: [],
            pagination: {
              page,
              limit,
              total: 0,
              totalPages: 0,
            },
          })
        }
      }
    } else if (recruiterIdParam) {
      // Get jobs by recruiter ID
      const { data: recruiterJobs } = await supabase
        .from('jobs')
        .select('id')
        .eq('recruiter_id', recruiterIdParam)
      
      if (recruiterJobs && recruiterJobs.length > 0) {
        const jobIds = recruiterJobs.map((j: any) => j.id)
        query = query.in('job_id', jobIds)
      } else {
        return successResponse({
          applications: [],
          pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
          },
        })
      }
    }

    const { data: applications, error, count } = await query

    if (error) {
      console.error('Error fetching applications:', error)
      return handleApiError(error)
    }

    // Enrich applications with related data
    if (applications && applications.length > 0) {
      const enrichedApplications = await Promise.all(
        applications.map(async (app: any) => {
          // Fetch job details
          const { data: job } = await supabase
            .from('jobs')
            .select('id, title, description, location, remote, salary_min, salary_max, currency, status, company_id, recruiter_id')
            .eq('id', app.job_id)
            .single()

          // Fetch company
          let company = null
          if (job?.company_id) {
            const { data: companyData } = await supabase
              .from('companies')
              .select('id, name')
              .eq('id', job.company_id)
              .single()
            company = companyData
          }

          // Fetch talent profile (candidate_id references profiles.id)
          let talent = null
          if (app.candidate_id) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('id, full_name')
              .eq('id', app.candidate_id)
              .single()
            talent = profile
          }

          // Transform to match expected format
          return {
            id: app.id,
            jobId: app.job_id,
            candidateId: app.candidate_id, // Keep for backward compatibility
            talentId: app.candidate_id, // Alias for consistency
            status: app.status,
            coverLetter: app.cover_letter,
            expectedRate: app.expected_rate,
            resumeUrl: app.resume_url,
            notes: app.notes,
            createdAt: app.created_at,
            updatedAt: app.updated_at,
            job: job ? {
              id: job.id,
              title: job.title,
              description: job.description,
              location: job.location,
              remote: job.remote,
              salaryMin: job.salary_min,
              salaryMax: job.salary_max,
              currency: job.currency,
              status: job.status,
              company,
            } : null,
            talent,
          }
        })
      )

      return successResponse({
        applications: enrichedApplications,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit),
        },
      })
    }

    return successResponse({
      applications: [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: 0,
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export const POST = requireAuth(async (req, userId) => {
  try {
    const body = await req.json()
    const validatedData = createApplicationSchema.parse(body)

    const supabase = await getSupabaseClient()
    const adminSupabase = await createAdminClient()

    // Check if user has TALENT role
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    if (!userProfile || userProfile.role !== 'TALENT') {
      return NextResponse.json(
        { success: false, error: 'Only talent users can apply for jobs.' },
        { status: 403 }
      )
    }

    // Get talent profile for availability check
    const { data: talentProfile } = await supabase
      .from('talent_profiles')
      .select('availability')
      .eq('user_id', userId)
      .single()

    // Check if job exists
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('id, status')
      .eq('id', validatedData.jobId)
      .single()

    if (jobError || !job) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      )
    }

    if (job.status !== 'PUBLISHED') {
      return NextResponse.json(
        { success: false, error: 'Job is not available for applications' },
        { status: 400 }
      )
    }

    // Check availability - prevent apply if BUSY
    if (talentProfile?.availability === 'Busy') {
      return NextResponse.json(
        { success: false, error: 'You cannot apply while your availability is set to Busy. Please update your profile.' },
        { status: 400 }
      )
    }

    // Check if already applied (use admin client to bypass RLS)
    // candidate_id references profiles.id (userId)
    const { data: existingApplication } = await adminSupabase
      .from('applications')
      .select('id')
      .eq('job_id', validatedData.jobId)
      .eq('candidate_id', userId)
      .single()

    if (existingApplication) {
      return NextResponse.json(
        { success: false, error: 'You have already applied to this job' },
        { status: 409 }
      )
    }

    // Create application (use admin client to bypass RLS)
    // candidate_id references profiles.id (userId)
    const { data: application, error: createError } = await adminSupabase
      .from('applications')
      .insert({
        job_id: validatedData.jobId,
        candidate_id: userId, // References profiles.id
        cover_letter: validatedData.coverLetter,
        expected_rate: validatedData.expectedRate,
        resume_url: validatedData.resumeUrl,
        status: 'PENDING',
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating application:', createError)
      return NextResponse.json(
        { success: false, error: createError.message || 'Failed to create application' },
        { status: 500 }
      )
    }

    // Fetch related data for response
    const { data: jobData } = await adminSupabase
      .from('jobs')
      .select('id, title, company_id')
      .eq('id', validatedData.jobId)
      .single()

    let company = null
    if (jobData?.company_id) {
      const { data: companyData } = await adminSupabase
        .from('companies')
        .select('id, name')
        .eq('id', jobData.company_id)
        .single()
      company = companyData
    }

    const { data: profileData } = await adminSupabase
      .from('profiles')
      .select('id, full_name')
      .eq('id', userId)
      .single()

    // Get recruiter ID for notification
    const { data: jobWithRecruiter } = await adminSupabase
      .from('jobs')
      .select('recruiter_id, title')
      .eq('id', validatedData.jobId)
      .single()

    // Create notification for recruiter
    if (jobWithRecruiter?.recruiter_id && profileData) {
      await createNotification({
        userId: jobWithRecruiter.recruiter_id,
        type: 'application',
        title: 'New Application Received',
        message: `${profileData.full_name || 'A candidate'} applied for "${jobWithRecruiter.title}"`,
        link: `/client/applications`,
      })
    }

    // Transform to match expected format
    const enrichedApplication = {
      id: application.id,
      jobId: application.job_id,
      candidateId: application.candidate_id, // Keep for backward compatibility
      talentId: application.candidate_id, // Alias for consistency
      status: application.status,
      coverLetter: application.cover_letter,
      expectedRate: application.expected_rate,
      resumeUrl: application.resume_url,
      notes: application.notes,
      createdAt: application.created_at,
      updatedAt: application.updated_at,
      job: jobData ? {
        id: jobData.id,
        title: jobData.title,
        company,
      } : null,
      talent: profileData,
    }

    return successResponse(enrichedApplication, 201)
  } catch (error) {
    return handleApiError(error)
  }
})
