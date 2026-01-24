import { redirect } from 'next/navigation'
import { isAdmin, hasRouteAccess } from '@/lib/admin/rbac'
import { AdminNav } from '@/components/admin/admin-nav'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { getSupabaseClient } = await import('@/lib/supabase/server-helper')
  const supabase = await getSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/admin')
  }

  // Get user profile and role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('id', user.id)
    .single()

  if (!profile || !isAdmin(profile.role)) {
    redirect('/?error=admin_access_required')
  }

  if (profile.status === 'SUSPENDED') {
    redirect('/?error=account_suspended')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminNav userRole={profile.role} userEmail={user.email} />
      <main className="flex-1 overflow-x-hidden">
        <div className="container mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  )
}
