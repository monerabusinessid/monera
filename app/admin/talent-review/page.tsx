import { Card, CardContent } from '@/components/ui/card'
import { TalentReviewTable } from '@/components/admin/talent-review-table'

export default async function TalentReviewPage() {
  const { createAdminClient } = await import('@/lib/supabase/server')
  const adminSupabase = await createAdminClient()

  // Fetch all TALENT users from profiles table
  const { data: talentProfiles, error: profilesError } = await adminSupabase
    .from('profiles')
    .select('*')
    .eq('role', 'TALENT')
    .order('created_at', { ascending: false })

  if (profilesError) {
    console.error('Error fetching talent profiles:', profilesError)
  }

  // Fetch talent_profiles data to enrich the profiles
  const { data: talentProfilesData } = await adminSupabase
    .from('talent_profiles')
    .select('*')

  // Create a map of user_id to talent_profile data
  const talentProfilesMap = new Map(
    (talentProfilesData || []).map((tp: any) => [tp.user_id, tp])
  )

  // Fetch emails from Supabase Auth
  const talentsWithDetails = await Promise.all(
    (talentProfiles || []).map(async (profile: any) => {
      const talentProfile = talentProfilesMap.get(profile.id)
      
      // Fetch email from auth
      let email = null
      try {
        const { data: authUser } = await adminSupabase.auth.admin.getUserById(profile.id)
        email = authUser?.user?.email || null
      } catch (e) {
        console.error('Error fetching email:', e)
      }

      return {
        id: talentProfile?.id || `profile-${profile.id}`,
        user_id: profile.id,
        email: email,
        headline: talentProfile?.headline || null,
        bio: talentProfile?.bio || null,
        hourly_rate: talentProfile?.hourly_rate ? parseFloat(talentProfile.hourly_rate) : null,
        portfolio_url: talentProfile?.portfolio_url || null,
        availability: talentProfile?.availability || 'Open',
        profile_completion: talentProfile?.profile_completion ? parseFloat(talentProfile.profile_completion) : 0,
        is_profile_ready: talentProfile?.is_profile_ready || false,
        status: talentProfile?.status || 'PENDING',
        last_validated_at: talentProfile?.last_validated_at || null,
        created_at: profile.created_at || new Date().toISOString(),
        profiles: {
          id: profile.id,
          full_name: profile.full_name || 'N/A',
          status: profile.status || 'ACTIVE',
          role: profile.role || 'TALENT',
        },
      }
    })
  )

  const totalTalents = talentsWithDetails.length
  const pendingReviews = talentsWithDetails.filter((t: any) => t.status === 'PENDING').length

  return (
    <div>
      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm text-gray-500">
            Home / Admin / <span className="text-brand-purple font-medium">Talent Review</span>
          </p>
          <h1 className="text-3xl font-semibold text-gray-900 mt-3">Talent Review</h1>
          <p className="text-gray-500 mt-2">Review and approve talent profiles.</p>
        </div>
      </div>

      <Card className="border border-gray-100 shadow-sm">
        <CardContent>
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Talent Profiles ({totalTalents})</h2>
            <p className="text-sm text-gray-500">
              {pendingReviews} pending reviews • Review profile completion, readiness status, and approve/reject talents
            </p>
          </div>
          {talentsWithDetails && talentsWithDetails.length > 0 ? (
            <TalentReviewTable talents={talentsWithDetails} />
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
