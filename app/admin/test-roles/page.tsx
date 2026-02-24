import { getSupabaseClient } from '@/lib/supabase/server-helper'
import { requireAdmin } from '@/lib/admin/rbac-server'
import { getAdminCapabilities } from '@/lib/admin/rbac'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { redirect } from 'next/navigation'
export const runtime = 'edge'

export default async function TestRolesPage() {
  try {
    const { user, profile, role } = await requireAdmin()
    const capabilities = getAdminCapabilities(role)

    return (
      <div>
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Role Testing Page</h1>
          <p className="text-gray-600">Test your admin role permissions</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current User Info */}
          <Card>
            <CardHeader>
              <CardTitle>Current User</CardTitle>
              <CardDescription>Your current admin role and permissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Email:</p>
                <p className="font-semibold">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Role:</p>
                <p className="font-semibold text-brand-purple">{role}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status:</p>
                <p className="font-semibold">{profile.status}</p>
              </div>
            </CardContent>
          </Card>

          {/* Capabilities */}
          <Card>
            <CardHeader>
              <CardTitle>Your Capabilities</CardTitle>
              <CardDescription>What you can do with this role</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Manage Admins</span>
                <span className={capabilities.canManageAdmins ? 'text-green-600' : 'text-red-600'}>
                  {capabilities.canManageAdmins ? '✅' : '❌'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Review Talent</span>
                <span className={capabilities.canReviewTalent ? 'text-green-600' : 'text-red-600'}>
                  {capabilities.canReviewTalent ? '✅' : '❌'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Review Jobs</span>
                <span className={capabilities.canReviewJobs ? 'text-green-600' : 'text-red-600'}>
                  {capabilities.canReviewJobs ? '✅' : '❌'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Manage Settings</span>
                <span className={capabilities.canManageSettings ? 'text-green-600' : 'text-red-600'}>
                  {capabilities.canManageSettings ? '✅' : '❌'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>View Analytics</span>
                <span className={capabilities.canViewAnalytics ? 'text-green-600' : 'text-red-600'}>
                  {capabilities.canViewAnalytics ? '✅' : '❌'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Support Users</span>
                <span className={capabilities.canSupportUsers ? 'text-green-600' : 'text-red-600'}>
                  {capabilities.canSupportUsers ? '✅' : '❌'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Access Database</span>
                <span className={capabilities.canAccessDatabase ? 'text-green-600' : 'text-red-600'}>
                  {capabilities.canAccessDatabase ? '✅' : '❌'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>View Audit Log</span>
                <span className={capabilities.canViewAuditLog ? 'text-green-600' : 'text-red-600'}>
                  {capabilities.canViewAuditLog ? '✅' : '❌'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Route Access Test */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Route Access Test</CardTitle>
              <CardDescription>Test which routes you can access</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <RouteTestLink href="/admin/dashboard" label="Dashboard" />
                <RouteTestLink href="/admin/users" label="Users" role={role} requiredRoles={['SUPER_ADMIN', 'QUALITY_ADMIN']} />
                <RouteTestLink href="/admin/talent-review" label="Talent Review" role={role} requiredRoles={['SUPER_ADMIN', 'QUALITY_ADMIN']} />
                <RouteTestLink href="/admin/jobs" label="Jobs" role={role} requiredRoles={['SUPER_ADMIN', 'QUALITY_ADMIN']} />
                <RouteTestLink href="/admin/applications" label="Applications" />
                <RouteTestLink href="/admin/skills" label="Skills" role={role} requiredRoles={['SUPER_ADMIN', 'QUALITY_ADMIN']} />
                <RouteTestLink href="/admin/analytics" label="Analytics" role={role} requiredRoles={['SUPER_ADMIN', 'ANALYST']} />
                <RouteTestLink href="/admin/settings" label="Settings" role={role} requiredRoles={['SUPER_ADMIN']} />
                <RouteTestLink href="/admin/audit-logs" label="Audit Logs" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  } catch (error) {
    redirect('/admin/dashboard?error=test_page_access_denied')
  }
}

function RouteTestLink({
  href,
  label,
  role,
  requiredRoles,
}: {
  href: string
  label: string
  role?: string
  requiredRoles?: string[]
}) {
  const hasAccess = !requiredRoles || !role || requiredRoles.includes(role) || role === 'SUPER_ADMIN'

  return (
    <a
      href={href}
      className={`p-4 border rounded-lg text-center transition-colors ${
        hasAccess
          ? 'border-green-500 bg-green-50 hover:bg-green-100 text-green-700'
          : 'border-red-500 bg-red-50 text-red-700 opacity-50 cursor-not-allowed'
      }`}
    >
      <div className="font-semibold">{label}</div>
      <div className="text-xs mt-1">{hasAccess ? '✅ Access' : '❌ Blocked'}</div>
    </a>
  )
}
