import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server-helper'
import { getAuthUser } from '@/lib/api-utils'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminSupabase = await createAdminClient()

    // Get profile
    const { data: profile, error: profileError } = await adminSupabase
      .from('profiles')
      .select('*, avatar_url')
      .eq('id', user.id)
      .single()

    // Get talent profile
    const { data: talentProfiles, error: talentError } = await adminSupabase
      .from('talent_profiles')
      .select('*, avatar_url')
      .eq('user_id', user.id)

    // Get skills
    const talentProfileId = talentProfiles?.[0]?.id
    let skills = []
    if (talentProfileId) {
      const { data: skillLinks } = await adminSupabase
        .from('_CandidateSkills')
        .select('B')
        .eq('A', talentProfileId)

      if (skillLinks && skillLinks.length > 0) {
        const skillIds = skillLinks.map((s: any) => s.B)
        const { data: skillsData } = await adminSupabase
          .from('skills')
          .select('id, name')
          .in('id', skillIds)
        skills = skillsData || []
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        profile: profile || null,
        profileError: profileError?.message || null,
        talentProfiles: talentProfiles || [],
        talentError: talentError?.message || null,
        skills: skills,
        debug: {
          hasProfile: !!profile,
          hasTalentProfile: !!talentProfiles?.length,
          talentProfileCount: talentProfiles?.length || 0,
          skillCount: skills.length,
        }
      }
    })
  } catch (error) {
    console.error('Debug error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
