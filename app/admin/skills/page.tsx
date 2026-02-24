import { Card, CardContent } from '@/components/ui/card'
import { SkillsTable } from '@/components/admin/skills-table'
import { CreateSkillButton } from '@/components/admin/create-skill-button'
export const runtime = 'edge'

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
      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm text-gray-500">
            Home / Admin / <span className="text-brand-purple font-medium">Skills</span>
          </p>
          <h1 className="text-3xl font-semibold text-gray-900 mt-3">Skills Management</h1>
          <p className="text-gray-500 mt-2">Manage platform skills and categories.</p>
        </div>
        <CreateSkillButton
          className="rounded-full bg-brand-purple px-5 text-white shadow-lg hover:bg-brand-purple/90"
          label="Add Skill"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border border-gray-100 shadow-sm">
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-gray-500">Total Skills</div>
            <div className="text-3xl font-bold mt-2">{totalSkills || 0}</div>
            <div className="text-sm text-gray-500 mt-1">Available skills</div>
          </CardContent>
        </Card>

        <Card className="border border-gray-100 shadow-sm">
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-gray-500">Most Used</div>
            <div className="text-3xl font-bold mt-2">
              {skillUsage.size > 0
                ? Math.max(...Array.from(skillUsage.values()))
                : 0}
            </div>
            <div className="text-sm text-gray-500 mt-1">Times used by talents</div>
          </CardContent>
        </Card>

        <Card className="border border-gray-100 shadow-sm">
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-gray-500">Active Skills</div>
            <div className="text-3xl font-bold mt-2">{skillUsage.size}</div>
            <div className="text-sm text-gray-500 mt-1">Skills in use</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-gray-100 shadow-sm">
        <CardContent>
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">All Skills</h2>
            <p className="text-sm text-gray-500">Manage skills available on the platform</p>
          </div>
          <SkillsTable skills={skills || []} skillUsage={skillUsage} />
        </CardContent>
      </Card>
    </div>
  )
}
