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

  const readinessRate = totalTalents ? ((readyTalents || 0) / totalTalents) * 100 : 0
  const acceptanceRate = totalApplications
    ? ((acceptedApplications || 0) / totalApplications) * 100
    : 0

  return (
    <div className="max-w-[1600px] mx-auto w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-[#111118] dark:text-white">Admin Overview</h1>
          <p className="text-[#616289] mt-1">Welcome back. Here's what's happening on Monera today.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2 bg-white dark:bg-[#252538] border border-[#e5e7eb] dark:border-[#2b2b40] text-[#111118] dark:text-white hover:bg-gray-50 dark:hover:bg-[#303048]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export Report
          </Button>
          <Link href="/admin/jobs">
            <Button className="flex items-center gap-2 bg-primary text-white hover:bg-primary/90 shadow-sm shadow-primary/20">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Job
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="bg-white dark:bg-[#1a1a2e] rounded-xl border border-[#e5e7eb] dark:border-[#2b2b40] p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[#616289] text-sm font-medium">Total Users</p>
              <h3 className="text-2xl font-bold text-[#111118] dark:text-white mt-2">{totalUsers || 0}</h3>
            </div>
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="flex items-center text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              5.2%
            </span>
            <span className="text-xs text-[#616289]">vs last month</span>
          </div>
        </div>

        {/* Active Jobs */}
        <div className="bg-white dark:bg-[#1a1a2e] rounded-xl border border-[#e5e7eb] dark:border-[#2b2b40] p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[#616289] text-sm font-medium">Active Jobs</p>
              <h3 className="text-2xl font-bold text-[#111118] dark:text-white mt-2">{activeJobs || 0}</h3>
            </div>
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="flex items-center text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              12%
            </span>
            <span className="text-xs text-[#616289]">vs last month</span>
          </div>
        </div>

        {/* Pending Verifications */}
        <div className="bg-white dark:bg-[#1a1a2e] rounded-xl border border-accent-yellow/50 dark:border-accent-yellow/30 p-6 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-accent-yellow/20 dark:bg-accent-yellow/10 rounded-bl-full -mr-8 -mt-8"></div>
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-[#616289] text-sm font-medium">Pending Verifications</p>
              <h3 className="text-2xl font-bold text-[#111118] dark:text-white mt-2">{pendingTalentReviews || 0}</h3>
            </div>
            <div className="p-2 bg-accent-yellow/10 dark:bg-accent-yellow/10 rounded-lg text-orange-600 dark:text-orange-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 relative z-10">
            <span className="flex items-center text-xs font-bold text-orange-800 bg-accent-yellow/40 dark:bg-accent-yellow/20 dark:text-orange-300 px-2 py-0.5 rounded-full">
              Action Needed
            </span>
            <span className="text-xs text-[#616289]">+8 today</span>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white dark:bg-[#1a1a2e] rounded-xl border border-[#e5e7eb] dark:border-[#2b2b40] p-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[#616289] text-sm font-medium">Total Applications</p>
              <h3 className="text-2xl font-bold text-[#111118] dark:text-white mt-2">{totalApplications || 0}</h3>
            </div>
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="flex items-center text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              {acceptanceRate.toFixed(1)}%
            </span>
            <span className="text-xs text-[#616289]">acceptance rate</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Platform Growth Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1a1a2e] rounded-xl border border-[#e5e7eb] dark:border-[#2b2b40] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-[#111118] dark:text-white">Platform Growth</h3>
              <p className="text-sm text-[#616289]">User acquisition vs Active Jobs (90 Days)</p>
            </div>
            <select className="bg-background-light dark:bg-[#252538] border-none text-sm text-[#111118] dark:text-white rounded-lg focus:ring-0 cursor-pointer px-3 py-2">
              <option>Last 90 Days</option>
              <option>Last 30 Days</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className="relative w-full h-[300px] flex items-end gap-2 pt-8 pb-2 px-2">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8 pl-8 pr-4 pt-12">
              <div className="w-full h-px bg-gray-100 dark:bg-[#2b2b40]"></div>
              <div className="w-full h-px bg-gray-100 dark:bg-[#2b2b40]"></div>
              <div className="w-full h-px bg-gray-100 dark:bg-[#2b2b40]"></div>
              <div className="w-full h-px bg-gray-100 dark:bg-[#2b2b40]"></div>
              <div className="w-full h-px bg-gray-100 dark:bg-[#2b2b40]"></div>
            </div>
            <svg className="w-full h-full overflow-visible z-10" preserveAspectRatio="none" viewBox="0 0 800 300">
              <defs>
                <linearGradient id="gradientPrimary" x1="0%" x2="0%" y1="0%" y2="100%">
                  <stop offset="0%" style={{stopColor:'#6f03cd', stopOpacity:0.2}}></stop>
                  <stop offset="100%" style={{stopColor:'#6f03cd', stopOpacity:0}}></stop>
                </linearGradient>
              </defs>
              <path d="M0,250 C100,240 150,150 250,180 C350,210 400,100 500,80 C600,60 700,120 800,40" fill="url(#gradientPrimary)" stroke="none"></path>
              <path d="M0,250 C100,240 150,150 250,180 C350,210 400,100 500,80 C600,60 700,120 800,40" fill="none" stroke="#6f03cd" strokeLinecap="round" strokeWidth="3"></path>
              <path d="M0,280 C120,270 180,220 300,230 C420,240 500,180 600,170 C700,160 750,140 800,120" fill="none" stroke="#cbd5e1" strokeDasharray="6,4" strokeLinecap="round" strokeWidth="2"></path>
            </svg>
          </div>
          <div className="flex justify-between px-8 text-xs text-[#616289] font-medium mt-2">
            <span>Jan 01</span>
            <span>Jan 15</span>
            <span>Feb 01</span>
            <span>Feb 15</span>
            <span>Mar 01</span>
            <span>Mar 15</span>
          </div>
        </div>

        {/* Action Required */}
        <div className="lg:col-span-1 bg-white dark:bg-[#1a1a2e] rounded-xl border border-[#e5e7eb] dark:border-[#2b2b40] p-6 shadow-sm flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[#111118] dark:text-white">Action Required</h3>
            <span className="bg-accent-yellow/20 text-orange-700 text-xs font-bold px-2 py-1 rounded-md">3 New</span>
          </div>
          <div className="flex flex-col gap-3 overflow-y-auto pr-1">
            <div className="p-4 rounded-lg bg-background-light dark:bg-[#252538] border-l-4 border-red-500">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-red-600 uppercase tracking-wider">Dispute</span>
                <span className="text-xs text-[#616289]">2h ago</span>
              </div>
              <p className="text-sm font-medium text-[#111118] dark:text-white mb-1">Payment Issue: Job #{totalJobs || 8842}</p>
              <p className="text-xs text-[#616289] mb-3">User claims work was not delivered as described.</p>
              <button className="w-full py-1.5 rounded bg-white dark:bg-[#1a1a2e] border border-[#e5e7eb] dark:border-[#2b2b40] text-sm font-medium text-[#111118] dark:text-white hover:bg-gray-50 dark:hover:bg-[#303048] transition-colors shadow-sm">
                Review Case
              </button>
            </div>
            <div className="p-4 rounded-lg bg-background-light dark:bg-[#252538] border-l-4 border-accent-yellow">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">Moderation</span>
                <span className="text-xs text-[#616289]">5h ago</span>
              </div>
              <p className="text-sm font-medium text-[#111118] dark:text-white mb-1">Flagged Content: User Profile</p>
              <p className="text-xs text-[#616289] mb-3">Potential violation of community guidelines reported.</p>
              <button className="w-full py-1.5 rounded bg-white dark:bg-[#1a1a2e] border border-[#e5e7eb] dark:border-[#2b2b40] text-sm font-medium text-[#111118] dark:text-white hover:bg-gray-50 dark:hover:bg-[#303048] transition-colors shadow-sm">
                Inspect Profile
              </button>
            </div>
            <div className="p-4 rounded-lg bg-background-light dark:bg-[#252538] border-l-4 border-blue-500">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Verification</span>
                <span className="text-xs text-[#616289]">1d ago</span>
              </div>
              <p className="text-sm font-medium text-[#111118] dark:text-white mb-1">Identity Check: High Value User</p>
              <p className="text-xs text-[#616289] mb-3">Manual review required for enterprise account.</p>
              <button className="w-full py-1.5 rounded bg-white dark:bg-[#1a1a2e] border border-[#e5e7eb] dark:border-[#2b2b40] text-sm font-medium text-[#111118] dark:text-white hover:bg-gray-50 dark:hover:bg-[#303048] transition-colors shadow-sm">
                Verify Docs
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-[#1a1a2e] rounded-xl border border-[#e5e7eb] dark:border-[#2b2b40] shadow-sm">
        <div className="px-6 py-4 border-b border-[#e5e7eb] dark:border-[#2b2b40] flex justify-between items-center">
          <h3 className="text-lg font-bold text-[#111118] dark:text-white">Recent Activity</h3>
          <Link href="/admin/audit-logs" className="text-sm font-medium text-primary hover:text-primary/80">
            View All Log
          </Link>
        </div>
        <div className="divide-y divide-[#e5e7eb] dark:divide-[#2b2b40]">
          {recentLogs && recentLogs.length > 0 ? (
            recentLogs.slice(0, 4).map((log: any, index: number) => {
              const activities = [
                { icon: '👤', color: 'green', title: 'New User Registration', desc: 'Sarah Jenkins joined as a Freelancer.', time: '2 minutes ago' },
                { icon: '📝', color: 'blue', title: 'Job Posted', desc: '"React Developer Needed for FinTech App"', time: '15 minutes ago', status: 'Waiting Approval' },
                { icon: '💰', color: 'purple', title: 'Payout Processed', desc: 'Batch #9921 completed successfully.', time: '42 minutes ago' },
                { icon: '🔐', color: 'gray', title: 'Admin Login', desc: 'Support_Lead accessed User Management.', time: '1 hour ago' }
              ]
              const activity = activities[index] || activities[0]
              
              return (
                <div key={log.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-[#252538] transition-colors">
                  <div className={`size-10 rounded-full bg-${activity.color}-100 dark:bg-${activity.color}-900/20 text-${activity.color}-600 dark:text-${activity.color}-400 flex items-center justify-center shrink-0`}>
                    <span className="text-xl">{activity.icon}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-[#111118] dark:text-white">
                      <span className="font-semibold">{activity.title}</span>: {activity.desc}
                    </p>
                    <p className="text-xs text-[#616289]">
                      {activity.time}
                      {activity.status && (
                        <> • <span className="text-primary font-medium">{activity.status}</span></>
                      )}
                    </p>
                  </div>
                  {activity.status && (
                    <div className="flex gap-2">
                      <button className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-medium hover:bg-green-200">
                        Approve
                      </button>
                    </div>
                  )}
                  <button className="text-[#616289] hover:text-[#111118] dark:hover:text-white">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>
              )
            })
          ) : (
            <div className="px-6 py-12 text-center">
              <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl">📋</span>
              </div>
              <p className="font-semibold text-gray-900 mb-1">No recent activity</p>
              <p className="text-sm text-gray-500">Administrative actions will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
