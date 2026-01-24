import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server-helper'
import { getAuthUser } from '@/lib/api-utils'

export const runtime = 'edge'

export async function PUT(req: NextRequest) {
  try {
    const user = await getAuthUser(req)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { videoIntroUrl } = body

    if (!videoIntroUrl || typeof videoIntroUrl !== 'string') {
      return NextResponse.json({ success: false, error: 'videoIntroUrl is required' }, { status: 400 })
    }

    const adminSupabase = await createAdminClient()

    // Update talent_profiles.intro_video_url
    const { data, error } = await adminSupabase
      .from('talent_profiles')
      .update({
        intro_video_url: videoIntroUrl.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .select('intro_video_url')
      .single()

    if (error) {
      console.error('Error updating video URL:', error)
      return NextResponse.json({ success: false, error: error.message || 'Failed to update video URL' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        introVideoUrl: data?.intro_video_url || null,
      },
    })
  } catch (error: any) {
    console.error('Error in PUT /api/user/profile/video:', error)
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 })
  }
}
