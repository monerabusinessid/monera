import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { JobsTable } from '@/components/admin/jobs-table'
import { CreateJobButton } from '@/components/admin/create-job-button'

export default async function JobsPage() {
  // Use admin client to bypass RLS and ensure we can read all jobs
  let jobs: any[] = []
  let fetchError: any = null
  
  try {
    const { createAdminClient } = await import('@/lib/supabase/server')
    const adminSupabase = await createAdminClient()
    
    // Fetch all jobs using admin client (bypasses RLS)
    // Use snake_case column names (created_at, recruiter_id, company_id, etc.)
    const { data: jobsData, error: jobsError } = await adminSupabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (jobsError) {
      console.error('Error fetching jobs (admin):', jobsError)
      fetchError = jobsError
    } else {
      jobs = jobsData || []
      console.log('Jobs fetched successfully:', jobs.length, 'jobs')
      if (jobs.length > 0) {
        console.log('First job:', jobs[0])
      }
      
      // Fetch recruiter profiles and companies separately
      if (jobs.length > 0) {
        // Get unique recruiter IDs (use snake_case: recruiter_id)
        const recruiterIds = [...new Set(
          jobs
            .map((j: any) => j.recruiter_id)
            .filter(Boolean)
        )]
        
        // Get unique company IDs (use snake_case: company_id)
        const companyIds = [...new Set(
          jobs
            .map((j: any) => j.company_id)
            .filter(Boolean)
        )]
        
        console.log('Recruiter IDs to fetch:', recruiterIds)
        console.log('Company IDs to fetch:', companyIds)
        
        // Fetch profiles (recruiter_id references profiles.id with role CLIENT)
        if (recruiterIds.length > 0) {
          const { data: profiles, error: profileError } = await adminSupabase
            .from('profiles')
            .select('id, full_name')
            .in('id', recruiterIds)
          
          if (profileError) {
            console.error('Error fetching profiles:', profileError)
          } else if (profiles) {
            console.log('Profiles fetched:', profiles.length)
            const profileMap = new Map(profiles.map((p: any) => [p.id, p]))
            jobs = jobs.map((job: any) => {
              return {
                ...job,
                profiles: profileMap.get(job.recruiter_id) || null
              }
            })
          }
        }
        
        // Fetch companies
        if (companyIds.length > 0) {
          const { data: companies, error: companyError } = await adminSupabase
            .from('companies')
            .select('id, name')
            .in('id', companyIds)
          
          if (companyError) {
            console.error('Error fetching companies:', companyError)
          } else if (companies) {
            console.log('Companies fetched:', companies.length)
            const companyMap = new Map(companies.map((c: any) => [c.id, c]))
            jobs = jobs.map((job: any) => {
              return {
                ...job,
                company: companyMap.get(job.company_id) || null
              }
            })
          }
        }
      }
    }
  } catch (error) {
    console.error('Error in JobsPage:', error)
    fetchError = error
  }

  // Count all jobs from database (not just the limited fetch)
  let totalJobsCount = 0
  let activeJobsCount = 0
  let inactiveJobsCount = 0
  
  try {
    const { createAdminClient } = await import('@/lib/supabase/server')
    const adminSupabase = await createAdminClient()
    
    // Count total jobs
    const { count: totalCount, error: totalError } = await adminSupabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })

    if (totalError) {
      console.error('Error counting total jobs:', totalError)
    } else {
      totalJobsCount = totalCount || 0
    }
    
    // Count active jobs (PUBLISHED status)
    const { count: activeCount, error: activeError } = await adminSupabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'PUBLISHED')

    if (activeError) {
      console.error('Error counting active jobs:', activeError)
    } else {
      activeJobsCount = activeCount || 0
    }
    
    // Count inactive jobs (all status except PUBLISHED)
    const { count: inactiveCount, error: inactiveError } = await adminSupabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .neq('status', 'PUBLISHED')

    if (inactiveError) {
      console.error('Error counting inactive jobs:', inactiveError)
      // Fallback: calculate from total - active
      inactiveJobsCount = totalJobsCount - activeJobsCount
    } else {
      inactiveJobsCount = inactiveCount || 0
    }
  } catch (error) {
    console.error('Error counting jobs:', error)
    // Fallback: count from fetched jobs
    totalJobsCount = jobs.length
    activeJobsCount = jobs.filter((j: any) => j.status === 'PUBLISHED').length
    inactiveJobsCount = totalJobsCount - activeJobsCount
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Job Moderation</h1>
        <p className="text-gray-600">Review and manage job postings</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{totalJobsCount}</div>
            <div className="text-sm text-gray-500">Total Jobs</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{activeJobsCount}</div>
            <div className="text-sm text-gray-500">Active Jobs</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{inactiveJobsCount}</div>
            <div className="text-sm text-gray-500">Inactive Jobs</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>All Jobs ({totalJobsCount})</CardTitle>
              <CardDescription>
                Active: {activeJobsCount} • Inactive: {inactiveJobsCount} • Review, approve, or reject job postings
              </CardDescription>
            </div>
            <CreateJobButton />
          </div>
        </CardHeader>
        <CardContent>
          {fetchError ? (
            <div className="p-8 text-center text-red-600">
              <p className="font-semibold">Error loading jobs</p>
              <p className="text-sm text-gray-500 mt-2">{fetchError.message || 'Failed to fetch jobs'}</p>
            </div>
          ) : (
            <JobsTable jobs={jobs || []} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
