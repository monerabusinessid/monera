import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function AdminDashboard() {
  // Use admin client to bypass RLS for accurate counts
  const { createAdminClient } = await import('@/lib/supabase/server')
  const supabase = await createAdminClient()

  // Fetch comprehensive stats
  const [
    { count: totalUsers },
    { count: totalTalents },
    { count: readyTalents },
    { count: totalClients },
    adminCountResult,
    { count: totalJobs },
    { count: activeJobs },
    { count: pendingJobs },
    { count: totalApplications },
    { count: pendingApplications },
    { count: acceptedApplications },
    { count: pendingTalentReviews },
    { count: totalAuditLogs },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('talent_profiles').select('*', { count: 'exact', head: true }),
    supabase
      .from('talent_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_profile_ready', true),
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'CLIENT'),
    // Count admin users - same filter as in users page (removed 'ADMIN' from enum)
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .in('role', ['SUPER_ADMIN', 'QUALITY_ADMIN', 'SUPPORT_ADMIN', 'ANALYST']),
    supabase.from('jobs').select('*', { count: 'exact', head: true }),
    supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'PUBLISHED'),
    supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'PENDING'),
    supabase.from('applications').select('*', { count: 'exact', head: true }),
    supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'PENDING'),
    supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'ACCEPTED'),
    supabase
      .from('talent_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'PENDING'),
    supabase.from('audit_logs').select('*', { count: 'exact', head: true }),
  ])

  const totalAdmins = adminCountResult?.count || 0
  
  // Debug logging
  if (adminCountResult?.error) {
    console.error('Error counting admin users:', adminCountResult.error)
  } else {
    console.log('Admin users count:', totalAdmins)
  }

  // Fetch recent audit logs
  const { data: recentLogs } = await supabase
    .from('audit_logs')
    .select(`
      *,
      admin:admin_id (
        id,
        full_name,
        role
      )
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  const notReadyTalents = (totalTalents || 0) - (readyTalents || 0)
  const readinessRate = totalTalents ? ((readyTalents || 0) / totalTalents) * 100 : 0
  const acceptanceRate = totalApplications
    ? ((acceptedApplications || 0) / totalApplications) * 100
    : 0

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl shadow-lg p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-purple-100 text-lg">Monitor and manage your platform</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin/users">
              <Button variant="secondary" size="sm" className="bg-white text-purple-600 hover:bg-purple-50">
                Manage Users
              </Button>
            </Link>
            <Link href="/admin/jobs">
              <Button variant="secondary" size="sm" className="bg-white text-purple-600 hover:bg-purple-50">
                Manage Jobs
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-purple-50 to-white">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
              <span className="text-2xl">👥</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-purple-600 mb-1">{totalUsers || 0}</div>
            <div className="text-xs text-gray-500">
              {totalTalents || 0} talents • {totalClients || 0} clients • {totalAdmins || 0} admins
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-blue-50 to-white">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Admin Users</CardTitle>
              <span className="text-2xl">🛡️</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-600 mb-1">{totalAdmins || 0}</div>
            <Link href="/admin/users" className="text-xs text-blue-600 hover:underline font-medium">
              Manage admin accounts →
            </Link>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-green-50 to-white">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Talent Users</CardTitle>
              <span className="text-2xl">💼</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-600 mb-1">{totalTalents || 0}</div>
            <Link href="/admin/users/talents" className="text-xs text-green-600 hover:underline font-medium">
              Manage talent accounts →
            </Link>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-orange-50 to-white">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Client Users</CardTitle>
              <span className="text-2xl">🏢</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-orange-600 mb-1">{totalClients || 0}</div>
            <Link href="/admin/users/clients" className="text-xs text-orange-600 hover:underline font-medium">
              Manage client accounts →
            </Link>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-indigo-50 to-white">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Profile Readiness</CardTitle>
              <span className="text-2xl">✅</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-indigo-600 mb-1">{readinessRate.toFixed(1)}%</div>
            <div className="text-xs text-gray-500">
              {readyTalents || 0} of {totalTalents || 0} ready
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-purple-50 to-white">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Active Jobs</CardTitle>
              <span className="text-2xl">📋</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-purple-600 mb-1">{activeJobs || 0}</div>
            <div className="text-xs text-gray-500">
              {totalJobs || 0} total • {pendingJobs || 0} pending
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-teal-50 to-white">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Applications</CardTitle>
              <span className="text-2xl">📝</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-teal-600 mb-1">{totalApplications || 0}</div>
            <div className="text-xs text-gray-500">
              {pendingApplications || 0} pending • {acceptanceRate.toFixed(1)}% accepted
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-yellow-50 to-white">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Reviews</CardTitle>
              <span className="text-2xl">⏳</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-yellow-600 mb-1">{pendingTalentReviews || 0}</div>
            <div className="text-xs text-gray-500">Talent profiles awaiting review</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-gray-50 to-white">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Audit Logs</CardTitle>
              <span className="text-2xl">📊</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-gray-600 mb-1">{totalAuditLogs || 0}</div>
            <div className="text-xs text-gray-500">Total administrative actions</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-0 shadow-md">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-transparent border-b">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">Recent Activity</CardTitle>
              <CardDescription className="mt-1">Latest administrative actions</CardDescription>
            </div>
            <Link href="/admin/audit-logs">
              <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700">
                View All Logs →
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {recentLogs && recentLogs.length > 0 ? (
              recentLogs.map((log: any) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-purple-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <span className="text-purple-600 text-lg">📋</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {log.action.replace(/_/g, ' ')} - {log.target_type}
                      </p>
                      <p className="text-sm text-gray-600">
                        by {log.admin?.full_name || 'Unknown'} ({log.admin?.role || 'N/A'}) •{' '}
                        {new Date(log.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center p-12 border border-gray-200 rounded-xl bg-gray-50">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-4">
                    <span className="text-3xl">📋</span>
                  </div>
                  <p className="font-semibold text-gray-900 mb-1">No recent activity</p>
                  <p className="text-sm text-gray-500">Administrative actions will appear here</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
