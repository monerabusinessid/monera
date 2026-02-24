import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TalentRequestsTable } from '@/components/admin/talent-requests-table'
export const runtime = 'edge'

export default async function AdminTalentRequestsPage() {
  const { createAdminClient } = await import('@/lib/supabase/server')
  const adminSupabase = await createAdminClient()

  // Count total talent requests from database
  const { count: totalRequests } = await adminSupabase
    .from('talent_requests')
    .select('*', { count: 'exact', head: true })

  // Fetch all talent requests using admin client to bypass RLS
  const { data: requests, error } = await adminSupabase
    .from('talent_requests')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching talent requests:', error)
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Talent Requests</h1>
        <p className="text-gray-600">View all talent requests from clients</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Talent Requests ({totalRequests || 0})</CardTitle>
          <CardDescription>Manage client requests for talent</CardDescription>
        </CardHeader>
        <CardContent>
          <TalentRequestsTable requests={requests || []} />
        </CardContent>
      </Card>
    </div>
  )
}
