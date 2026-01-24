import { getSupabaseClient } from '@/lib/supabase/server-helper'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function AnalyticsPage() {
  const supabase = await getSupabaseClient()

  // Fetch comprehensive stats
  const [
    { count: totalUsers },
    { count: totalTalents },
    { count: totalRecruiters },
    { count: totalJobs },
    { count: activeJobs },
    { count: totalApplications },
    { count: pendingApplications },
    { count: acceptedApplications },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'TALENT'),
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'CLIENT'),
    supabase.from('jobs').select('*', { count: 'exact', head: true }),
    supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'PUBLISHED'),
    supabase.from('applications').select('*', { count: 'exact', head: true }),
    supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'PENDING'),
    supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'ACCEPTED'),
  ])

  // Calculate conversion rates
  const applicationRate = totalJobs ? ((totalApplications || 0) / totalJobs) * 100 : 0
  const acceptanceRate = totalApplications
    ? ((acceptedApplications || 0) / totalApplications) * 100
    : 0

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Analytics Dashboard</h1>
        <p className="text-gray-600">Platform insights and metrics</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalUsers || 0}</div>
            <div className="text-sm text-gray-500 mt-1">
              {totalTalents || 0} talents • {totalRecruiters || 0} clients
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Total Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalJobs || 0}</div>
            <div className="text-sm text-gray-500 mt-1">{activeJobs || 0} active</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalApplications || 0}</div>
            <div className="text-sm text-gray-500 mt-1">
              {pendingApplications || 0} pending • {acceptedApplications || 0} accepted
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Acceptance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{acceptanceRate.toFixed(1)}%</div>
            <div className="text-sm text-gray-500 mt-1">Application success rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>Platform user registration over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-gray-400">
              Chart placeholder - User growth over time
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Job Posting Trends</CardTitle>
            <CardDescription>Job creation and publication trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-gray-400">
              Chart placeholder - Job posting trends
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Application Funnel</CardTitle>
            <CardDescription>Application status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Pending</span>
                <span className="font-semibold">{pendingApplications || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Accepted</span>
                <span className="font-semibold text-green-600">{acceptedApplications || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Total</span>
                <span className="font-semibold">{totalApplications || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Platform Health</CardTitle>
            <CardDescription>Key performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Application Rate</span>
                  <span className="font-semibold">{applicationRate.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-brand-purple h-2 rounded-full"
                    style={{ width: `${Math.min(applicationRate, 100)}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Acceptance Rate</span>
                  <span className="font-semibold">{acceptanceRate.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${Math.min(acceptanceRate, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
