import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SkillsTable } from '@/components/admin/skills-table'
import { CreateSkillButton } from '@/components/admin/create-skill-button'

export default async function SkillsPage() {
  const { createAdminClient } = await import('@/lib/supabase/server')
  const adminSupabase = await createAdminClient()

  // Count total skills from database
  const { count: totalSkills } = await adminSupabase
    .from('skills')
    .select('*', { count: 'exact', head: true })

  // Fetch all skills using admin client to bypass RLS
  const { data: skills, error } = await adminSupabase
    .from('skills')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching skills:', error)
  }

  // Get skill usage stats from _JobSkills junction table
  const { data: jobSkills } = await adminSupabase
    .from('_JobSkills')
    .select('B') // skill_id column

  // Count skill usage from jobs
  const skillUsage = new Map<string, number>()
  jobSkills?.forEach((js: any) => {
    const skillId = js.B || js.skill_id
    if (skillId) {
      const count = skillUsage.get(skillId) || 0
      skillUsage.set(skillId, count + 1)
    }
  })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Skills Management</h1>
        <p className="text-gray-600">Manage platform skills and categories</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Total Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalSkills || 0}</div>
            <div className="text-sm text-gray-500 mt-1">Available skills</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Most Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {skillUsage.size > 0
                ? Math.max(...Array.from(skillUsage.values()))
                : 0}
            </div>
            <div className="text-sm text-gray-500 mt-1">Times used by talents</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">Active Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{skillUsage.size}</div>
            <div className="text-sm text-gray-500 mt-1">Skills in use</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Skills</CardTitle>
              <CardDescription>Manage skills available on the platform</CardDescription>
            </div>
            <CreateSkillButton />
          </div>
        </CardHeader>
        <CardContent>
          <SkillsTable skills={skills || []} skillUsage={skillUsage} />
        </CardContent>
      </Card>
    </div>
  )
}
