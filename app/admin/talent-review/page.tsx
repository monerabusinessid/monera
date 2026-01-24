import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TalentReviewTable } from '@/components/admin/talent-review-table'

export default async function TalentReviewPage() {
  const { createAdminClient } = await import('@/lib/supabase/server')
  const adminSupabase = await createAdminClient()

  const [
    { count: totalTalents },
    { count: pendingReviews },
    { data: talentProfiles, error: talentError },
    { data: profilesWithoutTalentProfile, error: profilesError },
  ] = await Promise.all([
    adminSupabase
      .from('talent_profiles')
      .select('*', { count: 'exact', head: true }),
    adminSupabase
      .from('talent_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'PENDING'),
    adminSupabase
      .from('talent_profiles')
      .select(`
        id,
        user_id,
        headline,
        bio,
        hourly_rate,
        portfolio_url,
        availability,
        profile_completion,
        is_profile_ready,
        status,
        last_validated_at,
        created_at,
        profile:user_id (
          id,
          full_name,
          role,
          status
        )
      `)
      .order('created_at', { ascending: false }),
    adminSupabase
      .from('profiles')
      .select('id, full_name, role, status, created_at')
      .eq('role', 'TALENT')
      .order('created_at', { ascending: false })
      .limit(100),
  ])

  if (talentError) {
    console.error('Error fetching talent profiles:', talentError)
  }

  if (profilesError) {
    console.error('Error fetching profiles:', profilesError)
  }

  // Get user IDs that already have talent_profiles
  const talentProfileUserIds = new Set(
    (talentProfiles || []).map((tp: any) => tp.user_id)
  )

  // Filter profiles that don't have talent_profiles yet
  const profilesNeedingTalentProfile = (profilesWithoutTalentProfile || []).filter(
    (p: any) => !talentProfileUserIds.has(p.id)
  )

  console.log('Fetched talent profiles:', talentProfiles?.length || 0)
  console.log('Profiles without talent_profiles:', profilesNeedingTalentProfile?.length || 0)

  // Transform talent_profiles to match TalentReviewTable expected format
  const transformedTalents = (talentProfiles || []).map((talent: any) => {
    const profile = talent.profile || {}
    
    // Fetch email from Supabase Auth
    let email = null
    try {
      // We'll fetch email in parallel or use a helper
      // For now, we'll use the profile data
    } catch (e) {
      console.error('Error fetching email:', e)
    }

    return {
      id: talent.id,
      user_id: talent.user_id,
      headline: talent.headline || null,
      bio: talent.bio || null,
      hourly_rate: talent.hourly_rate ? parseFloat(talent.hourly_rate) : null,
      portfolio_url: talent.portfolio_url || null,
      availability: talent.availability || 'Open',
      profile_completion: talent.profile_completion ? parseFloat(talent.profile_completion) : 0,
      is_profile_ready: talent.is_profile_ready || false,
      status: talent.status || 'PENDING',
      last_validated_at: talent.last_validated_at || null,
      created_at: talent.created_at || new Date().toISOString(),
      profiles: {
        id: profile.id || talent.user_id,
        full_name: profile.full_name || 'N/A',
        status: profile.status || 'ACTIVE',
        role: profile.role || 'TALENT',
      },
    }
  })

  // Add profiles that don't have talent_profiles yet (incomplete profiles)
  const incompleteTalents = profilesNeedingTalentProfile.map((profile: any) => ({
    id: `incomplete-${profile.id}`, // Temporary ID
    user_id: profile.id,
    headline: null,
    bio: null,
    hourly_rate: null,
    portfolio_url: null,
    availability: 'Open',
    profile_completion: 0,
    is_profile_ready: false,
    status: 'PENDING',
    last_validated_at: null,
    created_at: profile.created_at || new Date().toISOString(),
    profiles: {
      id: profile.id,
      full_name: profile.full_name || 'N/A',
      status: profile.status || 'ACTIVE',
      role: profile.role || 'TALENT',
    },
  }))

  const allTalents = [...transformedTalents, ...incompleteTalents]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Talent Review</h1>
        <p className="text-gray-600">Review and approve talent profiles</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Talent Profiles ({totalTalents || 0})</CardTitle>
          <CardDescription>
            {pendingReviews || 0} pending reviews • Review profile completion, readiness status, and approve/reject talents
          </CardDescription>
        </CardHeader>
        <CardContent>
          {allTalents && allTalents.length > 0 ? (
            <TalentReviewTable talents={allTalents} />
          ) : (
            <div className="p-8 text-center text-gray-500">
              <p>No talent profiles found</p>
              <p className="text-sm mt-2">Talent profiles will appear here when users create their profiles</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
