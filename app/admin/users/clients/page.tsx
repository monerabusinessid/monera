import { requireAdmin } from '@/lib/admin/rbac-server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UsersTable } from '@/components/admin/users-table'
import { CreateUserButton } from '@/components/admin/create-user-button'
export const runtime = 'edge'

export default async function ClientUsersPage() {
  let adminRole: string | null = null
  try {
    const { role } = await requireAdmin(['SUPER_ADMIN', 'QUALITY_ADMIN', 'SUPPORT_ADMIN'])
    adminRole = role
  } catch {
    redirect('/admin/dashboard?error=insufficient_permissions')
  }

  const { createAdminClient } = await import('@/lib/supabase/server')
  const adminSupabase = await createAdminClient()

  // Count total client users from database
  const [
    { count: totalClients },
    { data: profilesData, error: profilesError },
  ] = await Promise.all([
    adminSupabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'CLIENT'),
    adminSupabase
      .from('profiles')
      .select('*')
      .eq('role', 'CLIENT')
      .order('created_at', { ascending: false }),
  ])

  let users: any[] = []
  let error: any = null

  if (profilesError) {
    console.error('Error fetching from profiles:', profilesError)
    error = profilesError
  } else {
    users = profilesData || []
    console.log('Fetched client users from profiles table:', users.length, 'users')
  }

  // Fetch recruiter profiles (client profiles) and companies
  const userIds = users.map((u: any) => u.id)
  const { data: recruiterProfiles } = userIds.length > 0
    ? await adminSupabase
        .from('recruiter_profiles')
        .select('user_id, company_id')
        .in('user_id', userIds)
    : { data: [] }

  const companyIds = [...new Set((recruiterProfiles || []).map((rp: any) => rp.company_id).filter(Boolean))]
  const { data: companies } = companyIds.length > 0
    ? await adminSupabase
        .from('companies')
        .select('id, name')
        .in('id', companyIds)
    : { data: [] }

  const companyMap = new Map((companies || []).map((c: any) => [c.id, c.name]))
  const recruiterProfileMap = new Map(
    (recruiterProfiles || []).map((rp: any) => [rp.user_id, rp])
  )

  // Fetch jobs count per client (recruiter_id in jobs table)
  const { data: jobsData } = userIds.length > 0
    ? await adminSupabase
        .from('jobs')
        .select('recruiter_id')
        .in('recruiter_id', userIds)
    : { data: [] }

  const jobsCountMap = new Map<string, number>()
  ;(jobsData || []).forEach((job: any) => {
    const recruiterId = job.recruiter_id || job.recruiterId
    if (recruiterId) {
      jobsCountMap.set(recruiterId, (jobsCountMap.get(recruiterId) || 0) + 1)
    }
  })

  // Fetch emails from Supabase Auth for all users
  let authEmailMap = new Map<string, string>()
  const missingEmailIds = users.filter((user: any) => !user.email).map((user: any) => user.id)
  if (missingEmailIds.length > 0) {
    try {
      const { data: authUsers, error: authUsersError } = await adminSupabase.auth.admin.listUsers()
      if (authUsersError) {
        console.warn('Could not list auth users:', authUsersError.message)
      } else {
        authEmailMap = new Map(
          (authUsers?.users || [])
            .filter((authUser: any) => missingEmailIds.includes(authUser.id) && authUser.email)
            .map((authUser: any) => [authUser.id, authUser.email])
        )
      }
    } catch (err: any) {
      console.warn('Error listing auth users:', err?.message || err)
    }
  }

  const profilesWithEmail = await Promise.all(
    users.map(async (user: any) => {
      let email = user.email || authEmailMap.get(user.id) || null
      
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

      const role = user.role || 'CLIENT'
      const createdAt = user.createdAt || user.created_at
      const updatedAt = user.updatedAt || user.updated_at
      const fullName = user.full_name || user.fullName || email?.split('@')[0] || 'N/A'
      const recruiterProfile = recruiterProfileMap.get(user.id)
      const companyId = recruiterProfile?.company_id
      const companyName = companyId ? companyMap.get(companyId) : null

      return {
        id: user.id,
        email: email,
        full_name: fullName,
        role: role,
        status: user.status || 'ACTIVE',
        company_name: companyName || null,
        jobs_count: jobsCountMap.get(user.id) || 0,
        created_at: createdAt ? (typeof createdAt === 'string' ? createdAt : new Date(createdAt).toISOString()) : new Date().toISOString(),
        updated_at: updatedAt ? (typeof updatedAt === 'string' ? updatedAt : new Date(updatedAt).toISOString()) : new Date().toISOString(),
      }
    })
  )
  
  const profiles = profilesWithEmail

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Client User Management</h1>
        <p className="text-gray-600">View and manage client accounts</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Client Users ({totalClients || 0})</CardTitle>
            <CreateUserButton defaultRole="CLIENT" />
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="p-8 text-center text-red-600">
              <p className="font-semibold">Error loading users</p>
              <p className="text-sm text-gray-500 mt-2">{error.message || 'Failed to fetch users'}</p>
            </div>
          ) : (
            <UsersTable users={profiles || []} userType="client" canDelete={adminRole === 'SUPER_ADMIN'} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
