import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Applications Management</h1>
        <p className="text-gray-600">Review and manage all job applications</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Applications ({totalApplications || 0})</CardTitle>
          <CardDescription>Monitor application status and activity</CardDescription>
        </CardHeader>
        <CardContent>
          <ApplicationsTable applications={finalApplications || []} />
        </CardContent>
      </Card>
    </div>
  )
}
