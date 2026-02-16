import { Card, CardContent } from '@/components/ui/card'
import { ApplicationsTable } from '@/components/admin/applications-table'

export default async function AdminApplicationsPage() {
  const { createAdminClient } = await import('@/lib/supabase/server')
  const adminSupabase = await createAdminClient()

  // Count total applications from database
  const { count: totalApplications } = await adminSupabase
    .from('applications')
    .select('*', { count: 'exact', head: true })

  // Fetch all applications using admin client to bypass RLS
  const { data: applications, error } = await adminSupabase
    .from('applications')
    .select(`
      *,
      jobs:job_id (
        id,
        title,
        status,
        recruiter_id
      ),
      talent_profiles:talent_id (
        id,
        user_id
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching applications:', error)
  }

  // Transform applications to match expected format
  let finalApplications = applications || []
  
  if (applications && applications.length > 0) {
    const recruiterIds = [...new Set(
      applications
        .map((app: any) => app.jobs?.recruiter_id)
        .filter(Boolean)
    )]
    
    const { data: recruiterProfiles } = await adminSupabase
      .from('profiles')
      .select('id, full_name')
      .in('id', recruiterIds)
    
    const recruiterMap = new Map(
      (recruiterProfiles || []).map((p: any) => [p.id, p])
    )
    
    // Fetch talent profile user info
    const talentUserIds = [...new Set(
      applications
        .map((app: any) => app.talent_profiles?.user_id)
        .filter(Boolean)
    )]
    
    const { data: talentProfiles } = await adminSupabase
      .from('profiles')
      .select('id, full_name, email')
      .in('id', talentUserIds)
    
    const talentProfileMap = new Map(
      (talentProfiles || []).map((p: any) => [p.id, p])
    )
    
    // Transform applications to match expected format
    finalApplications = applications.map((app: any) => ({
      ...app,
      jobs: app.jobs ? {
        ...app.jobs,
        recruiter_profiles: app.jobs.recruiter_id 
          ? recruiterMap.get(app.jobs.recruiter_id) || null
          : null
      } : null,
      talent_profiles: app.talent_profiles ? {
        ...app.talent_profiles,
        profiles: app.talent_profiles.user_id
          ? talentProfileMap.get(app.talent_profiles.user_id) || null
          : null
      } : null
    }))
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm text-gray-500">
            Home / Admin / <span className="text-brand-purple font-medium">Applications</span>
          </p>
          <h1 className="text-3xl font-semibold text-gray-900 mt-3">Applications Management</h1>
          <p className="text-gray-500 mt-2">Review and manage all job applications.</p>
        </div>
      </div>

      <Card className="border border-gray-100 shadow-sm">
        <CardContent>
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">All Applications ({totalApplications || 0})</h2>
            <p className="text-sm text-gray-500">Monitor application status and activity</p>
          </div>
          <ApplicationsTable applications={finalApplications || []} />
        </CardContent>
      </Card>
    </div>
  )
}
