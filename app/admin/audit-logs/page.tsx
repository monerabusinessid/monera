import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AuditLogsTable } from '@/components/admin/audit-logs-table'

export default async function AuditLogsPage() {
  const { createAdminClient } = await import('@/lib/supabase/server')
  const adminSupabase = await createAdminClient()

  // Fetch audit logs using admin client to bypass RLS
  const { data: logs, error } = await adminSupabase
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
    .limit(100)

  if (error) {
    console.error('Error fetching audit logs:', error)
  }

  // Get stats
  const { count: totalLogs } = await adminSupabase
    .from('audit_logs')
    .select('*', { count: 'exact', head: true })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Audit Logs</h1>
        <p className="text-gray-600">Track all administrative actions and changes</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Total Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalLogs || 0}</div>
            <div className="text-sm text-gray-500 mt-1">All time actions</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{logs?.length || 0}</div>
            <div className="text-sm text-gray-500 mt-1">Last 100 actions</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Active Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {new Set(logs?.map((log: any) => log.admin_id)).size || 0}
            </div>
            <div className="text-sm text-gray-500 mt-1">Admins with activity</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
          <CardDescription>Complete audit trail of administrative actions</CardDescription>
        </CardHeader>
        <CardContent>
          <AuditLogsTable logs={logs || []} />
        </CardContent>
      </Card>
    </div>
  )
}
