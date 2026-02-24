import { requireAdmin } from '@/lib/admin/rbac-server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
export const runtime = 'edge'

export default async function SettingsPage() {
  try {
    await requireAdmin(['SUPER_ADMIN'])
  } catch {
    redirect('/admin/dashboard?error=insufficient_permissions')
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">System Settings</h1>
        <p className="text-gray-600">Configure platform rules and thresholds (SUPER_ADMIN only)</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Platform Configuration</CardTitle>
          <CardDescription>
            System settings management (coming soon)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-8 text-center text-gray-500">
            <p>System settings feature is currently under development.</p>
            <p className="text-sm mt-2">This page will allow SUPER_ADMIN to configure platform-wide settings.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
