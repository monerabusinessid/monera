import { NextRequest } from 'next/server'
import { createJobSchema, jobSearchSchema } from '@/lib/validations'
import { requireAuth, successResponse, handleApiError, getAuthUser, errorResponse } from '@/lib/api-utils'
import { getSupabaseClient } from '@/lib/supabase/server-helper'
import { createAdminClient } from '@/lib/supabase/server'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const recruiterIdParam = searchParams.get('recruiterId')
    
    // When recruiterId=me, don't filter by status (show all jobs including DRAFT)
    // Otherwise, default to PUBLISHED for public job listings
    const defaultStatus = recruiterIdParam === 'me' ? undefined : 'PUBLISHED'
    
    const validatedParams = jobSearchSchema.parse({
      query: searchParams.get('query') || undefined,
      location: searchParams.get('location') || undefined,
      remote: searchParams.get('remote') === 'true' ? true : undefined,
      salaryMin: searchParams.get('salaryMin') ? parseInt(searchParams.get('salaryMin')!) : undefined,
      salaryMax: searchParams.get('salaryMax') ? parseInt(searchParams.get('salaryMax')!) : undefined,
      skillIds: searchParams.get('skillIds')?.split(',').filter(Boolean),
      companyId: searchParams.get('companyId') || undefined,
      status: searchParams.get('status') || defaultStatus,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
    })

    const supabase = await getSupabaseClient()
    const skip = (validatedParams.page - 1) * validatedParams.limit

    // OPTIMIZATION: Select only needed fields instead of * to reduce data transfer
    // For public job listings (PUBLISHED), use regular client (RLS should allow)
    // For recruiter's own jobs, use regular client (RLS should allow)
    // If RLS blocks, we can fallback to admin client
    let query = supabase
      .from('jobs')
      .select('id, title, description, requirements, scope_of_work, location, remote, salary_min, salary_max, currency, engagement_type, hours_per_week, duration, experience_level, project_type, status, company_id, recruiter_id, created_at, updated_at', { count: 'exact' })

    // Filter by status only if status is provided (not when recruiterId=me without status param)
    if (validatedParams.status) {
      const statusColumn = 'status' // status should be consistent
      query = query.eq(statusColumn, validatedParams.status)
      console.log('Filtering jobs by status:', validatedParams.status)
    } else {
      console.log('No status filter applied')
    }

    // Handle recruiterId filter
    if (recruiterIdParam === 'me') {
      const user = await getAuthUser(request)
      if (user) {
        // Use snake_case for recruiter_id (Supabase uses snake_case)
        query = query.eq('recruiter_id', user.id)
        console.log('Filtering jobs by recruiter_id:', user.id)
      } else {
        console.error('No authenticated user found for recruiterId=me')
      }
    } else if (recruiterIdParam) {
      query = query.eq('recruiter_id', recruiterIdParam)
    }

    // Handle search query
    if (validatedParams.query) {
      query = query.or(`title.ilike.%${validatedParams.query}%,description.ilike.%${validatedParams.query}%`)
    }

    // Handle location filter
    if (validatedParams.location) {
      query = query.ilike('location', `%${validatedParams.location}%`)
    }

    // Handle remote filter
    if (validatedParams.remote !== undefined) {
      query = query.eq('remote', validatedParams.remote)
    }

    // Handle category filter
    const categoryParam = searchParams.get('category')
    if (categoryParam) {
      query = query.eq('category', categoryParam)
    }

    // Handle salary filters (simplified - just check if salary range overlaps)
    // Note: This is a simplified version, full range checking would need more complex logic

    // Handle company filter
    if (validatedParams.companyId) {
      query = query.or(`companyId.eq.${validatedParams.companyId},company_id.eq.${validatedParams.companyId}`)
    }

    // Order by - try camelCase first, fallback to snake_case or id
    let jobsData: any[] = []
    let jobsError: any = null
    let count: number | null = null

    // Try with createdAt
    const { data: data1, error: error1, count: count1 } = await query
      .order('createdAt', { ascending: false })
      .range(skip, skip + validatedParams.limit - 1)

    if (error1 && error1.message?.includes('createdAt')) {
      // Try with created_at
      const { data: data2, error: error2, count: count2 } = await query
        .order('created_at', { ascending: false })
        .range(skip, skip + validatedParams.limit - 1)

      if (error2 && error2.message?.includes('created_at')) {
        // Fallback to id
        const { data: data3, error: error3, count: count3 } = await query
          .order('id', { ascending: false })
          .range(skip, skip + validatedParams.limit - 1)

        if (error3) {
          jobsError = error3
        } else {
          jobsData = data3 || []
          count = count3
        }
      } else if (error2) {
        jobsError = error2
      } else {
        jobsData = data2 || []
        count = count2
      }
    } else if (error1) {
      jobsError = error1
    } else {
      jobsData = data1 || []
      count = count1
    }

    // If RLS blocks access, try with admin client
    if (jobsError) {
      console.log('RLS blocked access or query error, trying with admin client')
      const adminSupabase = await createAdminClient()
      let adminQuery = adminSupabase
        .from('jobs')
        .select('id, title, description, requirements, scope_of_work, location, remote, salary_min, salary_max, currency, engagement_type, hours_per_week, duration, experience_level, project_type, status, company_id, recruiter_id, created_at, updated_at', { count: 'exact' })
      
      // Apply same filters to admin query
      if (validatedParams.status) {
        adminQuery = adminQuery.eq('status', validatedParams.status)
      }
      
      // Handle category filter
      const categoryParam = searchParams.get('category')
      if (categoryParam) {
        adminQuery = adminQuery.eq('category', categoryParam)
      }
      
      if (recruiterIdParam === 'me') {
        const user = await getAuthUser(request)
        if (user) {
          adminQuery = adminQuery.eq('recruiter_id', user.id)
          console.log('Admin query: filtering by recruiter_id:', user.id)
        }
      } else if (recruiterIdParam) {
        adminQuery = adminQuery.eq('recruiter_id', recruiterIdParam)
      }
      
      // Handle search query
      if (validatedParams.query) {
        adminQuery = adminQuery.or(`title.ilike.%${validatedParams.query}%,description.ilike.%${validatedParams.query}%`)
      }
      
      // Handle location filter
      if (validatedParams.location) {
        adminQuery = adminQuery.ilike('location', `%${validatedParams.location}%`)
      }
      
      // Handle remote filter
      if (validatedParams.remote !== undefined) {
        adminQuery = adminQuery.eq('remote', validatedParams.remote)
      }
      
      const { data: adminData, error: adminError, count: adminCount } = await adminQuery
        .order('created_at', { ascending: false })
        .range(skip, skip + validatedParams.limit - 1)
      
      if (!adminError && adminData) {
        jobsData = adminData
        count = adminCount
        jobsError = null
        console.log(`Fetched ${jobsData.length} jobs using admin client (count: ${count})`)
      } else {
        console.error('Error fetching jobs with admin client:', adminError)
        return handleApiError(jobsError || adminError)
      }
    } else {
      console.log(`Fetched ${jobsData.length} jobs from database (count: ${count})`)
    }

    // OPTIMIZATION: Batch fetch related data instead of individual queries per job
    // This reduces database queries from O(n) to O(1) for companies/recruiters
    const adminSupabase = await createAdminClient()
    const jobs = jobsData || []
    
    if (jobs.length === 0) {
      return successResponse({
        jobs: [],
        pagination: {
          page: validatedParams.page,
          limit: validatedParams.limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / validatedParams.limit),
        },
      })
    }
    
    console.log(`[Jobs API] Optimizing data fetch for ${jobs.length} jobs...`)
    const startTime = performance.now()
    
    // Collect all unique IDs for batch fetching
    const companyIds = [...new Set(jobs.map((j: any) => j.companyId || j.company_id).filter(Boolean))]
    const recruiterIds = [...new Set(jobs.map((j: any) => j.recruiterId || j.recruiter_id).filter(Boolean))]
    const jobIds = jobs.map((j: any) => j.id)
    
    // Batch fetch all companies at once
    let companiesMap = new Map<string, any>()
    if (companyIds.length > 0) {
      const { data: companiesData } = await adminSupabase
        .from('companies')
        .select('id, name, logo_url, description, website')
        .in('id', companyIds)
      
      if (companiesData) {
        companiesData.forEach((c: any) => {
          companiesMap.set(c.id, {
            id: c.id,
            name: c.name,
            logoUrl: c.logo_url,
            description: c.description,
            website: c.website,
          })
        })
      }
    }
    
    // Batch fetch all recruiters at once
    let recruitersMap = new Map<string, any>()
    if (recruiterIds.length > 0) {
      const { data: recruitersData } = await adminSupabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', recruiterIds)
      
      if (recruitersData) {
        recruitersData.forEach((r: any) => {
          recruitersMap.set(r.id, {
            id: r.id,
            email: r.email,
            name: r.full_name,
          })
        })
      }
    }
    
    // Batch fetch all job skills at once
    let jobSkillsMap = new Map<string, string[]>() // job_id -> skill_ids[]
    let skillsMap = new Map<string, { id: string; name: string }>()
    
    try {
      if (jobIds.length > 0) {
        // Fetch all job skills in one query
        const { data: allJobSkills } = await adminSupabase
          .from('_JobSkills')
          .select('A, B') // A = job_id, B = skill_id
          .in('A', jobIds)
        
        if (allJobSkills && allJobSkills.length > 0) {
          // Group skills by job_id
          allJobSkills.forEach((js: any) => {
            const jobId = js.A
            const skillId = js.B
            if (!jobSkillsMap.has(jobId)) {
              jobSkillsMap.set(jobId, [])
            }
            jobSkillsMap.get(jobId)!.push(skillId)
          })
          
          // Get all unique skill IDs
          const allSkillIds = [...new Set(allJobSkills.map((js: any) => js.B).filter(Boolean))]
          
          // Batch fetch all skills at once
          if (allSkillIds.length > 0) {
            const { data: skillsData } = await adminSupabase
              .from('skills')
              .select('id, name')
              .in('id', allSkillIds)
            
            if (skillsData) {
              skillsData.forEach((s: any) => {
                skillsMap.set(s.id, { id: s.id, name: s.name })
              })
            }
          }
        }
      }
    } catch (error) {
      console.log('Error batch fetching skills:', error)
    }
    
    // Now enrich jobs using the pre-fetched maps (O(1) lookup instead of O(n) queries)
    const enrichedJobs = jobs.map((job: any) => {
      const companyId = job.companyId || job.company_id
      const recruiterId = job.recruiterId || job.recruiter_id
      const skillIds = jobSkillsMap.get(job.id) || []
      
      return {
        id: job.id,
        title: job.title,
        description: job.description,
        requirements: job.requirements || null,
        scopeOfWork: job.scope_of_work || null,
        location: job.location,
        remote: job.remote || false,
        salaryMin: job.salaryMin || job.salary_min || null,
        salaryMax: job.salaryMax || job.salary_max || null,
        currency: job.currency || 'USD',
        engagementType: job.engagement_type || null,
        hoursPerWeek: job.hours_per_week || null,
        duration: job.duration || null,
        experienceLevel: job.experience_level || null,
        projectType: job.project_type || null,
        status: job.status,
        company: companyId ? companiesMap.get(companyId) || null : null,
        recruiter: recruiterId ? recruitersMap.get(recruiterId) || null : null,
        skills: skillIds.map((sid: string) => skillsMap.get(sid)).filter(Boolean) as Array<{ id: string; name: string }>,
        createdAt: job.createdAt || job.created_at || new Date().toISOString(),
      }
    })
    
    const endTime = performance.now()
    console.log(`[Jobs API] Data enrichment completed in ${(endTime - startTime).toFixed(2)}ms (${jobs.length} jobs)`)

    return successResponse({
      jobs: enrichedJobs,
      pagination: {
        page: validatedParams.page,
        limit: validatedParams.limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / validatedParams.limit),
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export const POST = requireAuth(async (req, userId) => {
  try {
    const body = await req.json()
    const validatedData = createJobSchema.parse(body)

    const { skillIds, ...jobData } = validatedData
    const supabase = await getSupabaseClient()
    const { createAdminClient } = await import('@/lib/supabase/server')
    const adminSupabase = await createAdminClient()

    // Generate job ID (UUID or text)
    const jobId = crypto.randomUUID()

    // Prepare job data for Supabase (use snake_case)
    const jobInsertData: any = {
      id: jobId,
      title: jobData.title,
      description: jobData.description,
      requirements: jobData.requirements || null,
      scope_of_work: (jobData as any).scopeOfWork || null,
      location: jobData.location || null,
      remote: jobData.remote || false,
      salary_min: jobData.salaryMin || null,
      salary_max: jobData.salaryMax || null,
      currency: jobData.currency || 'USD',
      engagement_type: (jobData as any).engagementType || null,
      hours_per_week: (jobData as any).hoursPerWeek || null,
      duration: (jobData as any).duration || null,
      experience_level: (jobData as any).experienceLevel || null,
      project_type: (jobData as any).projectType || null,
      status: 'DRAFT',
      recruiter_id: userId,
      company_id: jobData.companyId || null,
      category: (jobData as any).category || 'Development & IT',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Insert job into Supabase using admin client to bypass RLS
    const { data: insertedJob, error: jobError } = await adminSupabase
      .from('jobs')
      .insert(jobInsertData)
      .select()
      .single()

    if (jobError) {
      console.error('Error creating job:', jobError)
      console.error('Job insert data:', jobInsertData)
      // Return more detailed error message
      if (jobError.message) {
        return errorResponse(`Failed to create job: ${jobError.message}`, 500)
      }
      throw jobError
    }

    // Handle skills if provided
    if (skillIds && skillIds.length > 0 && insertedJob) {
      // Insert into junction table (_JobSkills)
      const jobSkillsData = skillIds.map((skillId: string) => ({
        A: insertedJob.id, // job_id
        B: skillId, // skill_id
      }))

      const { error: skillsError } = await adminSupabase
        .from('_JobSkills')
        .insert(jobSkillsData)

      if (skillsError) {
        console.error('Error linking skills to job:', skillsError)
        // Don't fail the whole operation if skills fail
      }
    }

    // Fetch related data to return complete job object
    let company = null
    if (insertedJob.company_id) {
      const { data: companyData } = await supabase
        .from('companies')
        .select('id, name, logoUrl, description, website')
        .eq('id', insertedJob.company_id)
        .single()
      company = companyData
    }

    let recruiter = null
    if (insertedJob.recruiter_id) {
      const { data: recruiterData } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .eq('id', insertedJob.recruiter_id)
        .single()
      if (recruiterData) {
        recruiter = {
          id: recruiterData.id,
          email: recruiterData.email,
          recruiterProfile: {
            firstName: recruiterData.full_name?.split(' ')[0] || null,
            lastName: recruiterData.full_name?.split(' ').slice(1).join(' ') || null,
          },
        }
      }
    }

    let skills: Array<{ id: string; name: string }> = []
    if (skillIds && skillIds.length > 0) {
      const { data: skillsData } = await supabase
        .from('skills')
        .select('id, name')
        .in('id', skillIds)
      skills = (skillsData || []).map((s: any) => ({ id: s.id, name: s.name }))
    }

    // Transform to match expected format
    const job = {
      id: insertedJob.id,
      title: insertedJob.title,
      description: insertedJob.description,
      requirements: insertedJob.requirements || null,
      scopeOfWork: insertedJob.scope_of_work || null,
      location: insertedJob.location,
      remote: insertedJob.remote || false,
      salaryMin: insertedJob.salary_min || null,
      salaryMax: insertedJob.salary_max || null,
      currency: insertedJob.currency || 'USD',
      engagementType: insertedJob.engagement_type || null,
      hoursPerWeek: insertedJob.hours_per_week || null,
      duration: insertedJob.duration || null,
      experienceLevel: insertedJob.experience_level || null,
      projectType: insertedJob.project_type || null,
      status: insertedJob.status,
      company,
      recruiter,
      skills,
      createdAt: insertedJob.created_at || new Date().toISOString(),
    }

    return successResponse(job, 201)
  } catch (error) {
    return handleApiError(error)
  }
})
