import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createAdminClient } from '@/lib/supabase/server'
import Link from 'next/link'
import TalentDetailActions from '@/components/admin/talent-detail-actions'
import { requireAdmin } from '@/lib/admin/rbac-server'
import { redirect } from 'next/navigation'

export default async function TalentDetailPage({ params }: { params: { id: string } }) {
  try {
    await requireAdmin(['SUPER_ADMIN', 'QUALITY_ADMIN'])
  } catch {
    redirect('/admin/dashboard?error=insufficient_permissions')
  }

  const adminSupabase = await createAdminClient()
  const talentId = params.id

  // Fetch talent profile with all related data
  const { data: talentProfile, error: talentError } = await adminSupabase
    .from('talent_profiles')
    .select(`
      *,
      profile:user_id (
        id,
        full_name,
        email,
        role,
        status,
        country,
        timezone,
        created_at
      )
    `)
    .eq('id', talentId)
    .single()

  if (talentError || !talentProfile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-red-600">Talent profile not found</p>
            <Link href="/admin/talent-review">
              <Button className="mt-4">Back to Talent Review</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  let skills: Array<{ id: string; name: string }> = []
  try {
    const [{ data: talentSkills }, { data: candidateSkills }] = await Promise.all([
      adminSupabase
        .from('talent_skills')
        .select('skill_id')
        .eq('talent_id', talentId),
      adminSupabase
        .from('_CandidateSkills')
        .select('B')
        .eq('A', talentId),
    ])

    const skillIds = new Set<string>()
    ;(talentSkills || []).forEach((ts: any) => ts?.skill_id && skillIds.add(ts.skill_id))
    ;(candidateSkills || []).forEach((cs: any) => cs?.B && skillIds.add(cs.B))

    if (skillIds.size > 0) {
      const { data: skillsData } = await adminSupabase
        .from('skills')
        .select('id, name')
        .in('id', Array.from(skillIds))
      skills = skillsData || []
    }
  } catch (error) {
    console.error('Error fetching skills:', error)
  }

  const profile = talentProfile.profile || {}
  const statusInfo = getStatusInfo(talentProfile.status)

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-6xl">
      <div className="mb-6">
        <Link href="/admin/talent-review">
          <Button variant="outline">← Back to Talent Review</Button>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl sm:text-4xl font-bold mb-2">Talent Profile Details</h1>
        <p className="text-gray-600">Review complete profile information</p>
      </div>

      {/* Status and Actions */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>{profile.full_name || 'N/A'}</CardTitle>
              <CardDescription>{profile.email || 'N/A'}</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className={`px-4 py-2 rounded-lg ${statusInfo.bgColor} ${statusInfo.textColor}`}>
                <span className="font-semibold">{statusInfo.label}</span>
              </div>
              <TalentDetailActions talentId={talentId} currentStatus={talentProfile.status} />
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Full Name</label>
              <p className="text-gray-900">{profile.full_name || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-gray-900">{profile.email || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Country</label>
              <p className="text-gray-900">{profile.country || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Timezone</label>
              <p className="text-gray-900">{profile.timezone || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">User Status</label>
              <p className="text-gray-900">{profile.status || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Member Since</label>
              <p className="text-gray-900">
                {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Profile Status */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Profile Completion</label>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-brand-purple h-4 rounded-full"
                    style={{ width: `${talentProfile.profile_completion || 0}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-1">{talentProfile.profile_completion || 0}%</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <p className="text-gray-900">{talentProfile.status || 'PENDING'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Profile Ready</label>
              <p className="text-gray-900">{talentProfile.is_profile_ready ? 'Yes' : 'No'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Last Validated</label>
              <p className="text-gray-900">
                {talentProfile.last_validated_at
                  ? new Date(talentProfile.last_validated_at).toLocaleString()
                  : 'Never'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Submitted At</label>
              <p className="text-gray-900">
                {talentProfile.submitted_at
                  ? new Date(talentProfile.submitted_at).toLocaleString()
                  : 'N/A'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Professional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Professional Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Headline</label>
              <p className="text-gray-900">{talentProfile.headline || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Bio</label>
              <p className="text-gray-900 whitespace-pre-wrap">{talentProfile.bio || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Experience</label>
              <p className="text-gray-900 whitespace-pre-wrap">{talentProfile.experience || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Hourly Rate</label>
              <p className="text-gray-900">
                {talentProfile.hourly_rate ? `$${talentProfile.hourly_rate}/hour` : 'N/A'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Availability</label>
              <p className="text-gray-900">{talentProfile.availability || 'N/A'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Skills */}
        <Card>
          <CardHeader>
            <CardTitle>Skills</CardTitle>
          </CardHeader>
          <CardContent>
            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill.id}
                    className="px-3 py-1 bg-brand-purple/10 text-brand-purple rounded-full text-sm"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No skills added</p>
            )}
          </CardContent>
        </Card>

        {/* Portfolio & Links */}
        <Card>
          <CardHeader>
            <CardTitle>Portfolio & Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Portfolio URL</label>
              {talentProfile.portfolio_url ? (
                <a
                  href={talentProfile.portfolio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-purple hover:underline block mt-1"
                >
                  {talentProfile.portfolio_url}
                </a>
              ) : (
                <p className="text-gray-500">N/A</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Video Introduction */}
        <Card>
          <CardHeader>
            <CardTitle>Video Introduction</CardTitle>
          </CardHeader>
          <CardContent>
            {talentProfile.intro_video_url ? (
              <div className="space-y-2">
                <video
                  src={talentProfile.intro_video_url}
                  controls
                  className="w-full rounded-lg"
                  style={{ maxHeight: '400px' }}
                >
                  Your browser does not support the video tag.
                </video>
                <a
                  href={talentProfile.intro_video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-brand-purple hover:underline"
                >
                  Open video in new tab
                </a>
              </div>
            ) : (
              <p className="text-gray-500">No video uploaded</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function getStatusInfo(status: string) {
  switch (status) {
    case 'APPROVED':
      return {
        label: 'Approved',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
      }
    case 'SUBMITTED':
      return {
        label: 'Under Review',
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-800',
      }
    case 'REJECTED':
      return {
        label: 'Rejected',
        bgColor: 'bg-red-100',
        textColor: 'text-red-800',
      }
    case 'NEED_REVISION':
      return {
        label: 'Needs Revision',
        bgColor: 'bg-orange-100',
        textColor: 'text-orange-800',
      }
    default:
      return {
        label: 'Pending',
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-800',
      }
  }
}
