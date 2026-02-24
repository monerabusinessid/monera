import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createAdminClient } from '@/lib/supabase/server'
import Link from 'next/link'
import TalentDetailActions from '@/components/admin/talent-detail-actions'
export const runtime = 'edge'

export default async function TalentDetailPage({ params }: { params: { id: string } }) {
  const adminSupabase = await createAdminClient()
  const talentId = params.id

  // Fetch talent profile with all related data (support both talent profile id and user id)
  let talentProfile: any = null
  let talentError: any = null
  let isIncompleteProfile = false

  let byUserId: any = null
  let byUserIdError: any = null

  const { data: byId, error: byIdError } = await adminSupabase
    .from('talent_profiles')
    .select('*')
    .eq('id', talentId)
    .maybeSingle()

  if (byId) {
    talentProfile = byId
  } else {
    const { data: byUserIdData, error: byUserIdErr } = await adminSupabase
      .from('talent_profiles')
      .select('*')
      .eq('user_id', talentId)
      .maybeSingle()

    byUserId = byUserIdData
    byUserIdError = byUserIdErr

    if (byUserIdData) {
      talentProfile = byUserIdData
    } else {
      // Last resort: fetch a batch and match by string (handles id/user_id type mismatches)
      const { data: allTalentProfiles, error: allTalentError } = await adminSupabase
        .from('talent_profiles')
        .select('*')
        .limit(1000)

      if (allTalentError) {
        talentError = allTalentError
      } else if (allTalentProfiles?.length) {
        const match = allTalentProfiles.find((tp: any) => {
          const idStr = String(tp.id || '')
          const userIdStr = String(tp.user_id || '')
          return idStr === String(talentId) || userIdStr === String(talentId)
        })
        if (match) {
          talentProfile = match
        }
      }

      if (!talentProfile) {
        // Fallback: allow viewing when only a profile exists (no talent_profiles row yet)
        const { data: profileOnly, error: profileOnlyError } = await adminSupabase
          .from('profiles')
          .select('id, full_name, email, role, status, country, timezone, created_at')
          .eq('id', talentId)
          .maybeSingle()

        if (profileOnly) {
          isIncompleteProfile = true
          talentProfile = {
            id: `incomplete-${profileOnly.id}`,
            user_id: profileOnly.id,
            headline: null,
            bio: null,
            experience: null,
            hourly_rate: null,
            availability: null,
            profile_completion: 0,
            is_profile_ready: false,
            status: 'PENDING',
            last_validated_at: null,
            submitted_at: null,
            portfolio_url: null,
            intro_video_url: null,
            profile: profileOnly,
          }
        } else {
          talentError = byIdError || byUserIdError || profileOnlyError
        }
      }
    }
  }

  if (talentProfile && !talentProfile.profile) {
    const { data: profileData } = await adminSupabase
      .from('profiles')
      .select('id, full_name, email, role, status, country, timezone, created_at')
      .eq('id', talentProfile.user_id)
      .maybeSingle()
    talentProfile = { ...talentProfile, profile: profileData || null }
  }

  if (talentError || !talentProfile) {
    return (
      <div>
        <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm text-gray-500">
              Home / Admin / <span className="text-brand-purple font-medium">Talent Review</span>
            </p>
            <h1 className="text-3xl font-semibold text-gray-900 mt-3">Talent Profile Details</h1>
            <p className="text-gray-500 mt-2">Review complete profile information.</p>
          </div>
        </div>

        <Card className="border border-gray-100 shadow-sm">
          <CardContent className="py-12 text-center">
            <p className="text-red-600">Talent profile not found</p>
            <Link href="/admin/talent-review">
              <Button className="mt-4 rounded-full bg-brand-purple px-5 text-white shadow-lg hover:bg-brand-purple/90">
                Back to Talent Review
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  let skills: Array<{ id: string; name: string }> = []
  try {
    const skillTargetId = talentProfile?.id?.startsWith('incomplete-')
      ? talentProfile.user_id
      : talentProfile?.id || talentId
    const [{ data: talentSkills }, { data: candidateSkills }] = await Promise.all([
      adminSupabase
        .from('talent_skills')
        .select('skill_id')
        .eq('talent_id', skillTargetId),
      adminSupabase
        .from('_CandidateSkills')
        .select('B')
        .eq('A', skillTargetId),
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
  const fullName = profile.full_name || 'N/A'
  const email = profile.email || 'N/A'
  const hasEmail = Boolean(email && email !== 'N/A')
  const submittedAt = talentProfile.submitted_at || talentProfile.created_at
  const submittedLabel = submittedAt
    ? new Date(submittedAt).toLocaleString()
    : 'N/A'
  const initials = getInitials(fullName, email)
  const historyTarget = profile.id || talentProfile.user_id || talentProfile.id

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm text-gray-400">
            Home / Admin / <span className="text-brand-purple font-medium">Talent Review</span>
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold text-gray-900">Review Application</h1>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${statusInfo.bgColor} ${statusInfo.textColor}`}>
              {statusInfo.label}
            </span>
          </div>
          <p className="text-gray-500 mt-2">Review complete profile information.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full lg:w-72">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m1.85-5.4a7.25 7.25 0 11-14.5 0 7.25 7.25 0 0114.5 0z" />
              </svg>
            </span>
            <input
              disabled
              placeholder="Search talent..."
              className="h-11 w-full rounded-full border border-gray-200 bg-white pl-11 text-sm text-gray-400 shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="h-11 w-11 rounded-full p-0">
              <span className="text-lg">🔔</span>
            </Button>
            <Button variant="outline" className="h-11 w-11 rounded-full p-0">
              <span className="text-lg">💬</span>
            </Button>
          </div>
          <div className="h-11 w-11 rounded-full bg-brand-purple/10 text-brand-purple flex items-center justify-center font-semibold">
            {initials}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-brand-purple font-semibold">ID: {talentProfile.id}</p>
          <h2 className="text-3xl font-semibold text-gray-900 mt-2">Review: {fullName}</h2>
          <p className="text-sm text-gray-500 mt-2">Submitted {submittedLabel}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {!isIncompleteProfile && (
            <TalentDetailActions talentId={talentProfile.id} currentStatus={talentProfile.status} />
          )}
          <Link href="/admin/talent-review">
            <Button variant="outline" className="rounded-full px-5">
              Back to Talent Review
            </Button>
          </Link>
        </div>
      </div>

      {/* Profile Summary */}
      <Card className="border border-gray-100 shadow-sm mt-3">
        <CardContent className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-5">
            <div className="mt-2 flex h-20 w-20 items-center justify-center rounded-2xl bg-gray-100 text-xl font-semibold text-gray-500">
              {initials}
            </div>
            <div className="min-w-0">
              <CardTitle className="text-xl">{fullName}</CardTitle>
              <CardDescription className="mt-1">
                {talentProfile.headline || 'Talent profile'}
              </CardDescription>
              <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-500">
                <span>Nationality: {profile.country || 'N/A'}</span>
                <span>Timezone: {profile.timezone || 'N/A'}</span>
                <span className="truncate">{email}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {hasEmail ? (
              <Button asChild variant="outline" className="rounded-full px-4">
                <a href={`mailto:${email}`}>Message</a>
              </Button>
            ) : (
              <Button variant="outline" className="rounded-full px-4" disabled>
                Message
              </Button>
            )}
            <Button asChild variant="outline" className="rounded-full px-4">
              <Link href={`/admin/audit-logs?userId=${historyTarget}`}>History</Link>
            </Button>
          </div>
        </CardContent>
        {isIncompleteProfile && (
          <CardContent className="pt-0">
            <div className="rounded-xl border border-yellow-100 bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
              Profile ini belum memiliki record di talent_profiles. Data yang tampil berasal dari profiles.
            </div>
          </CardContent>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card className="border border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Full Name</label>
              <p className="text-gray-900">{fullName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <p className="text-gray-900">{email}</p>
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
        <Card className="border border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Profile Status</CardTitle>
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
        <Card className="border border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Professional Information</CardTitle>
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
              <p className="text-gray-900 whitespace-pre-wrap break-words">{talentProfile.experience || 'N/A'}</p>
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
        <Card className="border border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Skills</CardTitle>
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
        <Card className="border border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Portfolio & Links</CardTitle>
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
        <Card className="border border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Video Introduction</CardTitle>
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

function getInitials(name: string, fallback: string) {
  const base = (name && name !== 'N/A') ? name : fallback
  if (!base) return 'T'
  const parts = base.replace(/@.*/, '').split(' ').filter(Boolean)
  const initials = parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
  return initials || base.charAt(0).toUpperCase()
}


