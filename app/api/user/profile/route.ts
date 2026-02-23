import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server-helper'
import { getAuthUser, successResponse, errorResponse } from '@/lib/api-utils'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return errorResponse('Unauthorized', 401)
    }

    console.log('🔑 Authenticated user:', {
      id: user.id,
      email: user.email,
      role: user.role
    })

    const adminSupabase = await createAdminClient()
    const statusPriority: Record<string, number> = {
      APPROVED: 5,
      SUBMITTED: 4,
      NEED_REVISION: 3,
      REJECTED: 2,
      PENDING: 1,
      DRAFT: 0,
    }

    const getTalentProfileTimestamp = (record: any) => {
      const raw = record?.updated_at || record?.created_at
      const parsed = raw ? new Date(raw).getTime() : 0
      return Number.isNaN(parsed) ? 0 : parsed
    }

    const pickBestTalentProfile = (records: any[]) => {
      if (!records?.length) return null
      return records
        .slice()
        .sort((a, b) => {
          const aReady = a?.is_profile_ready ? 1 : 0
          const bReady = b?.is_profile_ready ? 1 : 0
          if (aReady !== bReady) return bReady - aReady
          const aStatus = statusPriority[a?.status || 'DRAFT'] ?? -1
          const bStatus = statusPriority[b?.status || 'DRAFT'] ?? -1
          if (aStatus !== bStatus) return bStatus - aStatus
          return getTalentProfileTimestamp(b) - getTalentProfileTimestamp(a)
        })[0]
    }

    // Get profile - use raw SQL to bypass potential RLS issues
    let profile: any = null
    let profileError: any = null
    
    try {
      const { data: profileData, error: error1 } = await adminSupabase
        .rpc('get_profile_by_id', { profile_id: user.id })
      
      if (error1) {
        // Fallback to direct query if RPC doesn't exist
        const { data: directData, error: error2 } = await adminSupabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle()
        
        profile = directData
        profileError = error2
      } else {
        profile = profileData?.[0] || profileData
      }
      
      console.log('📊 Profile query result:', {
        found: !!profile,
        error: profileError?.message || null,
        full_name: profile?.full_name || 'NULL',
        country: profile?.country || 'NULL',
        phone: profile?.phone || 'NULL',
        location: profile?.location || 'NULL'
      })
    } catch (err) {
      console.error('❌ Error fetching profile:', err)
      profileError = err
    }

    if (profileError || !profile) {
      console.warn('⚠️ Profile not found or error:', profileError?.message)
      console.log('⚠️ Will use talent_profiles data only')
      // Build a minimal fallback profile
      profile = {
        id: user.id,
        full_name: null,
        country: null,
        timezone: null,
        avatar_url: null,
        revision_notes: null,
        created_at: null,
        bio: null,
        phone: null,
        location: null,
        linked_in_url: null,
        github_url: null,
      } as any
    } else {
      console.log('✅ Profile found with data:', {
        full_name: profile.full_name,
        country: profile.country,
        phone: profile.phone,
        location: profile.location
      })
    }

    // Get talent profile - handle both UUID and TEXT user.id
    // This is where the onboarding status (DRAFT, SUBMITTED, APPROVED, etc.) is stored
    console.log('📊 Fetching talent profile for user_id:', user.id, 'type:', typeof user.id)
    
    // Convert user.id to string to ensure type consistency
    const userIdString = String(user.id)
    
    // Use admin client to bypass RLS and ensure we can read the data
    // Try multiple query approaches to handle type mismatches
    let talentProfile: any = null
    let talentError: any = null
    
    // Try multiple approaches to find talent profile
    // Approach 1: Direct string match
    let queryAttempt = 1
    const { data: talentProfiles1, error: error1 } = await adminSupabase
      .from('talent_profiles')
      .select('id, user_id, headline, bio, experience, portfolio_url, intro_video_url, status, submitted_at, revision_notes, profile_completion, hourly_rate, availability, hours_per_week, is_profile_ready, avatar_url, created_at, updated_at')
      .eq('user_id', userIdString)
      .order('updated_at', { ascending: false })
      .limit(5)
    
    console.log(`📊 Query attempt ${queryAttempt} (string match):`, {
      found: !!talentProfiles1?.length,
      count: talentProfiles1?.length || 0,
      error: error1?.message || null,
      errorCode: error1?.code || null,
      user_id_searched: userIdString,
      user_id_type: typeof userIdString
    })
    
    if (talentProfiles1?.length) {
      talentProfile = pickBestTalentProfile(talentProfiles1)
      console.log('✅ Talent profile found with string match:', {
        id: talentProfile.id,
        user_id: talentProfile.user_id,
        user_id_type: typeof talentProfile.user_id,
        status: talentProfile.status,
        profile_completion: talentProfile.profile_completion,
        profile_completion_type: typeof talentProfile.profile_completion
      })
    } else {
      // Approach 2: Try with UUID if user.id is UUID
      queryAttempt = 2
      const { data: talentProfiles2, error: error2 } = await adminSupabase
        .from('talent_profiles')
        .select('id, user_id, headline, bio, experience, portfolio_url, intro_video_url, status, submitted_at, revision_notes, profile_completion, hourly_rate, availability, hours_per_week, is_profile_ready, avatar_url, created_at, updated_at')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(5)
      
      console.log(`📊 Query attempt ${queryAttempt} (UUID match):`, {
        found: !!talentProfiles2?.length,
        count: talentProfiles2?.length || 0,
        error: error2?.message || null,
        errorCode: error2?.code || null,
        user_id_searched: user.id,
        user_id_type: typeof user.id
      })
      
      if (talentProfiles2?.length) {
        talentProfile = pickBestTalentProfile(talentProfiles2)
        console.log('✅ Talent profile found with UUID match:', {
          id: talentProfile.id,
          user_id: talentProfile.user_id,
          user_id_type: typeof talentProfile.user_id,
          status: talentProfile.status,
          profile_completion: talentProfile.profile_completion,
          profile_completion_type: typeof talentProfile.profile_completion
        })
      } else {
        // Approach 3: Match by talent_profiles.id (some schemas use id as user id)
        queryAttempt = 3
        const { data: talentProfiles3, error: error3 } = await adminSupabase
          .from('talent_profiles')
          .select('id, user_id, headline, bio, experience, portfolio_url, intro_video_url, status, submitted_at, revision_notes, profile_completion, hourly_rate, availability, hours_per_week, is_profile_ready, avatar_url, created_at, updated_at')
          .eq('id', userIdString)
          .limit(5)
        
        console.log(`📊 Query attempt ${queryAttempt} (id match):`, {
          found: !!talentProfiles3?.length,
          count: talentProfiles3?.length || 0,
          error: error3?.message || null,
          errorCode: error3?.code || null,
          id_searched: userIdString
        })
        
        if (talentProfiles3?.length) {
          talentProfile = pickBestTalentProfile(talentProfiles3)
          console.log('✅ Talent profile found with id match:', {
            id: talentProfile.id,
            user_id: talentProfile.user_id,
            status: talentProfile.status,
            profile_completion: talentProfile.profile_completion
          })
        } else {
          // Approach 4: Fetch all and filter in JavaScript (last resort)
          queryAttempt = 4
          console.log(`📊 Query attempt ${queryAttempt} (fetch all and filter):`)
        try {
          const { data: allTalentProfiles, error: error3 } = await adminSupabase
            .from('talent_profiles')
            .select('id, user_id, headline, bio, experience, portfolio_url, intro_video_url, status, submitted_at, revision_notes, profile_completion, hourly_rate, availability, hours_per_week, is_profile_ready, avatar_url, created_at, updated_at')
            .limit(1000) // Safety limit
          
          if (error3) {
            console.error('❌ Error fetching all talent profiles:', error3)
            talentError = error3
          } else if (allTalentProfiles) {
            // Filter in JavaScript with type casting
            const matchedProfiles = allTalentProfiles.filter((tp: any) => {
              const tpUserId = String(tp.user_id || '')
              const searchUserId = userIdString
              return tpUserId === searchUserId || tpUserId === String(user.id) || String(tp.id) === searchUserId
            })
            
            if (matchedProfiles.length) {
              talentProfile = pickBestTalentProfile(matchedProfiles)
              console.log('✅ Talent profile found by filtering all records:', {
                id: talentProfile.id,
                user_id: talentProfile.user_id,
                status: talentProfile.status,
                profile_completion: talentProfile.profile_completion
              })
            } else {
              console.log('ℹ️ Talent profile not found in any query attempt')
              console.log('📊 Debug info:', {
                userIdString,
                userIdOriginal: user.id,
                userIdOriginalType: typeof user.id,
                allTalentProfilesCount: allTalentProfiles?.length || 0,
                sampleUserIds: allTalentProfiles?.slice(0, 3).map((tp: any) => ({
                  user_id: tp.user_id,
                  user_id_type: typeof tp.user_id,
                  user_id_string: String(tp.user_id)
                })) || []
              })
              if (error1?.code === 'PGRST116') {
                talentError = error1 // Use first error if it's "not found"
              }
            }
          }
        } catch (fetchAllError) {
          console.error('❌ Error in fetch-all approach:', fetchAllError)
        }
        }
      }
    }
    
    // Fallback: try to resolve user id via auth email (handles mismatched custom ids)
    if (!talentProfile && user.email) {
      try {
        const { data: authUsers, error: authUsersError } = await adminSupabase.auth.admin.listUsers()
        if (!authUsersError && authUsers?.users?.length) {
          const matchedAuthUser = authUsers.users.find((authUser: any) => authUser.email === user.email)
          if (matchedAuthUser?.id) {
            const resolvedId = String(matchedAuthUser.id)
            console.log('📊 Fallback auth lookup by email:', {
              email: user.email,
              resolvedId,
              originalId: userIdString
            })

            const { data: talentProfilesByResolvedId } = await adminSupabase
              .from('talent_profiles')
              .select('id, user_id, headline, bio, experience, portfolio_url, intro_video_url, status, submitted_at, revision_notes, profile_completion, hourly_rate, availability, hours_per_week, is_profile_ready, avatar_url, created_at, updated_at')
              .or(`user_id.eq.${resolvedId},id.eq.${resolvedId}`)
              .order('updated_at', { ascending: false })
              .limit(5)

            if (talentProfilesByResolvedId?.length) {
              talentProfile = pickBestTalentProfile(talentProfilesByResolvedId)
              console.log('✅ Talent profile resolved via auth email lookup:', {
                id: talentProfile.id,
                user_id: talentProfile.user_id,
                status: talentProfile.status,
                is_profile_ready: talentProfile.is_profile_ready
              })
            }
          }
        }
      } catch (fallbackError) {
        console.warn('⚠️ Fallback auth email lookup failed:', fallbackError)
      }
    }

    if (talentProfile && String(talentProfile.user_id || '') !== userIdString) {
      try {
        await adminSupabase
          .from('talent_profiles')
          .update({ user_id: userIdString, updated_at: new Date().toISOString() })
          .eq('id', talentProfile.id)
        console.log('✅ Synced talent_profiles.user_id to authenticated user:', {
          talentProfileId: talentProfile.id,
          userId: userIdString
        })
        talentProfile.user_id = userIdString
      } catch (syncError) {
        console.warn('⚠️ Failed to sync talent_profiles.user_id:', syncError)
      }
    }

    // Final check - if still not found, log detailed debug info
    if (!talentProfile) {
      console.error('❌ CRITICAL: Talent profile not found after all attempts!', {
        userIdString,
        userIdOriginal: user.id,
        userIdOriginalType: typeof user.id,
        userEmail: user.email,
        suggestion: 'Check /api/debug/profile endpoint for detailed info'
      })
    }

    if (talentError && talentError.code !== 'PGRST116') {
      console.error('❌ Error fetching talent_profiles:', talentError)
    } else {
      console.log('📊 Talent profile fetched:', {
        found: !!talentProfile,
        status: talentProfile?.status || 'NOT_FOUND',
        submitted_at: talentProfile?.submitted_at || null,
        profile_completion: talentProfile?.profile_completion ?? null,
        profile_completion_type: typeof talentProfile?.profile_completion,
        profile_completion_raw: talentProfile?.profile_completion,
        user_id: user.id,
        user_id_string: userIdString,
        talent_profile_user_id: talentProfile?.user_id || 'N/A',
        talent_profile_id: talentProfile?.id || 'N/A'
      })
    }

    // Get skills - only if talent profile exists
    let skills: Array<{ id: string; name: string }> = []
    if (talentProfile && !talentError) {
      console.log('📊 Fetching skills for talent_profile_id:', talentProfile.id)
      
      // Check if _CandidateSkills table exists and try to fetch skills
      try {
        const { data: jobSkills, error: skillsError } = await adminSupabase
          .from('_CandidateSkills')
          .select('B')
          .eq('A', talentProfile.id)

        if (skillsError) {
          console.warn('⚠️ Error fetching skills from _CandidateSkills:', skillsError.message)
        } else if (jobSkills && jobSkills.length > 0) {
          const skillIds = [...new Set(jobSkills.map((js: any) => js.B).filter(Boolean))]
          console.log('📊 Found skill IDs:', skillIds)
          
          if (skillIds.length > 0) {
            const { data: skillsData, error: skillsDataError } = await adminSupabase
              .from('skills')
              .select('id, name')
              .in('id', skillIds)

            if (skillsDataError) {
              console.warn('⚠️ Error fetching skills data:', skillsDataError.message)
            } else if (skillsData) {
              skills = skillsData.map((s: any) => ({ id: s.id, name: s.name }))
              console.log('📊 Skills fetched:', skills.length, 'skills')
            }
          }
        }
      } catch (error) {
        console.warn('⚠️ Exception fetching skills (non-critical):', error)
      }
    }

    // Get status from talent_profiles (onboarding status), fallback to DRAFT if not found
    // If is_profile_ready is true, treat as APPROVED even if status is missing
    const status = talentProfile?.is_profile_ready
      ? 'APPROVED'
      : (talentProfile?.status || 'DRAFT')
    
    console.log('📊 Final status being returned:', {
      status,
      hasTalentProfile: !!talentProfile,
      talentProfileStatus: talentProfile?.status,
      submittedAt: talentProfile?.submitted_at
    })
    
    // Use revision_notes from talent_profiles if available, otherwise from profiles
    const revisionNotes = talentProfile?.revision_notes || profile.revision_notes || null

    // Calculate profile completion
    // Priority: 1) database value, 2) calculate from fields
    let profileCompletion: number = 0
    
    console.log('📊 Starting profile completion calculation:', {
      hasTalentProfile: !!talentProfile,
      talentProfileId: talentProfile?.id || 'N/A',
      talentProfileUserId: talentProfile?.user_id || 'N/A',
      talentProfileCompletion: talentProfile?.profile_completion,
      talentProfileCompletionType: typeof talentProfile?.profile_completion,
      talentProfileCompletionRaw: JSON.stringify(talentProfile?.profile_completion),
      skillsCount: skills.length
    })
    
    // Check if profile_completion exists in database and is valid
    if (talentProfile) {
      const rawValue = talentProfile.profile_completion
      
      console.log('📊 Checking profile_completion from database:', {
        raw: rawValue,
        rawType: typeof rawValue,
        isNull: rawValue === null,
        isUndefined: rawValue === undefined,
        rawStringified: JSON.stringify(rawValue)
      })
      
      // Check if value exists and is not null/undefined
      if (rawValue !== null && rawValue !== undefined) {
        const numValue = Number(rawValue)
        
        console.log('📊 Converting profile_completion to number:', {
          raw: rawValue,
          numValue: numValue,
          isNaN: isNaN(numValue),
          isGreaterThanZero: numValue > 0,
          isGreaterThanOrEqualZero: numValue >= 0
        })
        
        // Use database value if it's a valid number (including 0, but prefer > 0)
        if (!isNaN(numValue)) {
          profileCompletion = Math.round(numValue)
          console.log('✅ Using profile completion from database:', profileCompletion, '%')
        } else {
          console.log('⚠️ Database profile_completion is NaN, will calculate from fields')
        }
      } else {
        console.log('⚠️ Database profile_completion is null/undefined, will calculate from fields')
      }
    } else {
      console.log('⚠️ No talentProfile found, will calculate from fields')
    }
    
    // If profile_completion is 0 or not available, calculate it from available data
    if (profileCompletion === 0) {
      console.log('📊 Calculating profile completion from fields (database value is 0 or not available)...')
      const fields = [
        profile.full_name,
        profile.country,
        profile.timezone,
        profile.bio,
        profile.phone,
        profile.location,
        profile.linked_in_url,
        profile.github_url,
        talentProfile?.headline,
        talentProfile?.experience,
        talentProfile?.portfolio_url,
        talentProfile?.intro_video_url,
        skills.length > 0,
      ]
      const completed = fields.filter(Boolean).length
      profileCompletion = Math.round((completed / fields.length) * 100)
      console.log('✅ Calculated profile completion from fields:', profileCompletion, '%', {
        completedFields: completed,
        totalFields: fields.length,
        fieldDetails: fields.map((f, i) => {
          const fieldNames = [
            'full_name', 'country', 'timezone', 'bio', 'phone', 'location',
            'linked_in_url', 'github_url', 'headline', 'experience',
            'portfolio_url', 'intro_video_url', 'skills'
          ]
          return { 
            name: fieldNames[i] || `field_${i}`, 
            hasValue: !!f, 
            value: f ? (typeof f === 'string' && f.length > 50 ? f.substring(0, 50) + '...' : f) : null
          }
        })
      })
    }
    
    // Final check - ensure profileCompletion is a valid number (never null/undefined)
    if (profileCompletion === null || profileCompletion === undefined || isNaN(profileCompletion)) {
      console.error('❌ CRITICAL: profileCompletion is invalid after calculation!', { 
        profileCompletion,
        type: typeof profileCompletion,
        isNull: profileCompletion === null,
        isUndefined: profileCompletion === undefined,
        isNaN: isNaN(profileCompletion as any)
      })
      profileCompletion = 0 // Force to 0 if invalid
    }
    
    // IMPORTANT: Even if talentProfile is not found, we should still calculate from available profile fields
    // This ensures profileCompletion is never 0 unless truly no data exists
    if (profileCompletion === 0 && !talentProfile) {
      console.log('⚠️ Talent profile not found and completion is 0, calculating from profile fields only...')
      const profileFields = [
        profile.full_name,
        profile.country,
        profile.timezone,
        profile.bio,
        profile.phone,
        profile.location,
        profile.linked_in_url,
        profile.github_url,
      ]
      const completedProfileFields = profileFields.filter(Boolean).length
      if (completedProfileFields > 0) {
        profileCompletion = Math.round((completedProfileFields / profileFields.length) * 100)
        console.log('✅ Calculated profile completion from profile fields only:', profileCompletion, '%')
      }
    }
    
    console.log('📊 Final profileCompletion before response:', {
      value: profileCompletion,
      type: typeof profileCompletion,
      isNumber: typeof profileCompletion === 'number',
      isValid: !isNaN(profileCompletion),
      willBeIncluded: true,
      hasTalentProfile: !!talentProfile,
      source: talentProfile ? 'database_or_calculated' : 'calculated_from_profile_only'
    })

    // Ensure profileCompletion is always a number (never null or undefined)
    let finalProfileCompletion = profileCompletion !== null && profileCompletion !== undefined 
      ? Number(profileCompletion) 
      : 0
    
    // Double check - profileCompletion should never be null/undefined at this point
    if (finalProfileCompletion === null || finalProfileCompletion === undefined || isNaN(finalProfileCompletion)) {
      console.error('❌ ERROR: profileCompletion is invalid!', { profileCompletion, finalProfileCompletion })
      // Fallback to 0 if somehow still invalid
      finalProfileCompletion = 0
    }
    
    console.log('📊 Final response data being returned:', {
      profileCompletion: finalProfileCompletion,
      profileCompletionType: typeof finalProfileCompletion,
      status,
      hasTalentProfile: !!talentProfile,
      talentProfileId: talentProfile?.id || 'N/A',
      skillsCount: skills.length,
      headline: talentProfile?.headline || 'N/A',
      fullName: profile.full_name || 'N/A'
    })

    // Build response data - ensure profileCompletion is always included and not overridden
    // IMPORTANT: Build object explicitly to ensure all fields are present
    const responseData: Record<string, any> = {}
    
    // Basic profile fields
    responseData.id = profile.id
    responseData.fullName = profile.full_name || null
    // Split full_name into firstName and lastName for frontend
    if (profile.full_name) {
      const nameParts = profile.full_name.trim().split(/\s+/)
      responseData.firstName = nameParts[0] || null
      responseData.lastName = nameParts.slice(1).join(' ') || null
    } else {
      responseData.firstName = null
      responseData.lastName = null
    }
    responseData.country = profile.country || null
    responseData.timezone = profile.timezone || null
    responseData.bio = talentProfile?.bio || profile.bio || null
    responseData.phone = profile.phone || null
    responseData.location = profile.location || null
    responseData.linkedInUrl = profile.linked_in_url || null
    responseData.githubUrl = profile.github_url || null
    responseData.avatarUrl = profile.avatar_url || talentProfile?.avatar_url || null
    responseData.avatar_url = profile.avatar_url || talentProfile?.avatar_url || null // Keep for backward compatibility
    responseData.created_at = profile.created_at || null
    
    // Talent profile fields
    responseData.headline = talentProfile?.headline || null
    responseData.jobTitle = talentProfile?.headline || null // Alias for headline
    responseData.status = status // Status from talent_profiles (DRAFT, SUBMITTED, APPROVED, etc.)
    responseData.revisionNotes = revisionNotes || null
    responseData.submittedAt = talentProfile?.submitted_at || null
    responseData.experience = talentProfile?.experience || null
    responseData.portfolioUrl = talentProfile?.portfolio_url || null
    responseData.introVideoUrl = talentProfile?.intro_video_url || null
    responseData.hourlyRate = talentProfile?.hourly_rate || null
    responseData.availability = talentProfile?.availability || null
    responseData.hoursPerWeek = talentProfile?.hours_per_week || null
    
    // Skills and completion - CRITICAL FIELDS
    responseData.skills = skills || []
    responseData.profileCompletion = finalProfileCompletion // Profile completion percentage (ensured to be a number)
    
    // Verify profileCompletion was set
    if (responseData.profileCompletion === undefined || responseData.profileCompletion === null) {
      console.error('❌ CRITICAL: profileCompletion is undefined after assignment!', {
        finalProfileCompletion,
        responseDataProfileCompletion: responseData.profileCompletion
      })
      responseData.profileCompletion = 0 // Force to 0
    }
    
    console.log('📊 Response data profileCompletion check BEFORE return:', {
      hasProfileCompletion: 'profileCompletion' in responseData,
      profileCompletionValue: responseData.profileCompletion,
      profileCompletionType: typeof responseData.profileCompletion,
      isNumber: typeof responseData.profileCompletion === 'number',
      isNaN: isNaN(responseData.profileCompletion),
      finalProfileCompletion: finalProfileCompletion,
      responseDataKeys: Object.keys(responseData)
    })

    // Final validation - ensure profileCompletion is always present
    if (!('profileCompletion' in responseData) || responseData.profileCompletion === undefined || responseData.profileCompletion === null) {
      console.error('❌ CRITICAL ERROR: profileCompletion is missing from responseData!', {
        hasProfileCompletion: 'profileCompletion' in responseData,
        profileCompletion: responseData.profileCompletion,
        finalProfileCompletion: finalProfileCompletion
      })
      // Force add it
      responseData.profileCompletion = finalProfileCompletion
    }
    
    console.log('📊 Response data FINAL check before return:', {
      hasProfileCompletion: 'profileCompletion' in responseData,
      profileCompletionValue: responseData.profileCompletion,
      profileCompletionType: typeof responseData.profileCompletion,
      isNumber: typeof responseData.profileCompletion === 'number',
      isValid: !isNaN(responseData.profileCompletion as number)
    })
    
    // Final validation - ensure ALL required fields are present
    const requiredFields = ['id', 'profileCompletion', 'status', 'skills']
    const missingFields = requiredFields.filter(field => !(field in responseData))
    
    if (missingFields.length > 0) {
      console.error('❌ CRITICAL: Missing required fields in responseData!', {
        missingFields,
        allKeys: Object.keys(responseData),
        responseData
      })
      // Add missing fields with defaults
      if (!('profileCompletion' in responseData)) {
        responseData.profileCompletion = 0
      }
      if (!('status' in responseData)) {
        responseData.status = 'DRAFT'
      }
      if (!('skills' in responseData)) {
        responseData.skills = []
      }
    }
    
    // Final check - log what we're about to return
    console.log('📊 About to return response with keys:', Object.keys(responseData))
    console.log('📊 Response data sample:', {
      id: responseData.id,
      fullName: responseData.fullName,
      headline: responseData.headline,
      country: responseData.country,
      timezone: responseData.timezone,
      profileCompletion: responseData.profileCompletion,
      profileCompletionType: typeof responseData.profileCompletion,
      status: responseData.status,
      skillsCount: responseData.skills?.length || 0,
      hasProfileCompletion: 'profileCompletion' in responseData
    })
    
    // Create response
    const response = successResponse(responseData)
    
    // Verify the response was created correctly
    console.log('📊 Response created, status:', response.status)
    
    // Double-check by stringifying and parsing (simulates what happens in network)
    try {
      const testStringify = JSON.stringify(responseData)
      const testParse = JSON.parse(testStringify)
      console.log('📊 JSON serialization test:', {
        hasProfileCompletion: 'profileCompletion' in testParse,
        profileCompletion: testParse.profileCompletion,
        profileCompletionType: typeof testParse.profileCompletion
      })
    } catch (e) {
      console.error('❌ JSON serialization error:', e)
    }
    
    return response
  } catch (error) {
    console.error('Error in GET /api/user/profile:', error)
    return errorResponse('Internal server error', 500)
  }
}
