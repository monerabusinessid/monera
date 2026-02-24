import { requireAdmin } from '@/lib/admin/rbac-server'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { UsersTable } from '@/components/admin/users-table'
import { CreateUserButton } from '@/components/admin/create-user-button'
export const runtime = 'edge'

export default async function AdminUsersPage() {
  try {
    await requireAdmin(['SUPER_ADMIN', 'QUALITY_ADMIN'])
  } catch {
    redirect('/admin/dashboard?error=insufficient_permissions')
  }

  const { createAdminClient } = await import('@/lib/supabase/server')
  const adminSupabase = await createAdminClient()

  // Fetch ALL users from profiles table (data is stored here)
  let users: any[] = []
  let error: any = null

  // Fetch from profiles table directly (this is where data is stored)
  const { data: profilesData, error: profilesError } = await adminSupabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  if (profilesError) {
    console.error('Error fetching from profiles:', profilesError)
    error = profilesError
  } else {
    users = profilesData || []
    console.log('Fetched from profiles table:', users.length, 'users')
  }

  // Filter to show only admin users for display (but we fetched all for debugging)
  const adminUsers = users.filter((user: any) => {
    const role = user.role || user.role
    return ['SUPER_ADMIN', 'QUALITY_ADMIN', 'SUPPORT_ADMIN', 'ANALYST'].includes(role)
  })

  console.log('Total users fetched:', users.length)
  console.log('Admin users filtered:', adminUsers.length)
  console.log('All users:', users.map((u: any) => ({ id: u.id, email: u.email, role: u.role })))
  
  // Use adminUsers for display, but log all users for debugging
  users = adminUsers

  // Fetch emails from Supabase Auth for all users (profiles table doesn't have email column)
  const profilesWithEmail = await Promise.all(
    users.map(async (user: any) => {
      let email = user.email || null
      
      // If email is not in the data, fetch from Supabase Auth
      if (!email) {
        try {
          const { data: authUser, error: authError } = await adminSupabase.auth.admin.getUserById(user.id)
          if (authError) {
            console.warn(`Could not fetch email for user ${user.id}:`, authError.message)
          } else if (authUser?.user?.email) {
            email = authUser.user.email
          }
        } catch (err: any) {
          console.error(`Error fetching email for user ${user.id}:`, err?.message || err)
        }
      }

      const role = user.role || user.role
      const createdAt = user.createdAt || user.created_at
      const updatedAt = user.updatedAt || user.updated_at
      const fullName = user.full_name || user.fullName || email?.split('@')[0] || 'N/A'

      return {
        id: user.id,
        email: email,
        full_name: fullName,
        role: role,
        status: user.status || 'ACTIVE',
        created_at: createdAt ? (typeof createdAt === 'string' ? createdAt : new Date(createdAt).toISOString()) : new Date().toISOString(),
        updated_at: updatedAt ? (typeof updatedAt === 'string' ? updatedAt : new Date(updatedAt).toISOString()) : new Date().toISOString(),
      }
    })
  )
  
  const profiles = profilesWithEmail

  return (
    <div>
      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm text-gray-500">
            Home / Admin / <span className="text-brand-purple font-medium">Users</span>
          </p>
          <h1 className="text-3xl font-semibold text-gray-900 mt-3">User Management</h1>
          <p className="text-gray-500 mt-2">Manage platform access, track activity, and update user roles.</p>
        </div>
        <CreateUserButton
          className="rounded-full bg-brand-purple px-5 text-white shadow-lg hover:bg-brand-purple/90"
          label="Add User"
        />
      </div>

      <Card className="border border-gray-100 shadow-sm">
        <CardContent>
          {error ? (
            <div className="p-8 text-center text-red-600">
              <p className="font-semibold">Error loading users</p>
              <p className="text-sm text-gray-500 mt-2">{error.message || 'Failed to fetch users'}</p>
            </div>
          ) : (
            <UsersTable users={profiles || []} userType="admin" />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
