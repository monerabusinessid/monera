import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/admin/rbac'
import { AdminNav } from '@/components/admin/admin-nav'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Only use JWT token authentication to avoid conflicts
  const cookieStore = await cookies()
  const authToken = cookieStore.get('auth-token')?.value
  
  if (!authToken) {
    redirect('/login?redirect=/admin')
  }

  const payload = await verifyToken(authToken)
  if (!payload || !payload.role || !isAdmin(payload.role)) {
    redirect('/login?redirect=/admin&error=admin_access_required')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminNav userRole={payload.role} userEmail={payload.email} />
      <main className="flex-1 overflow-x-hidden">
        <div className="container mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  )
}
