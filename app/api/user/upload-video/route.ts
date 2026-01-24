import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getAuthUser, successResponse, errorResponse } from '@/lib/api-utils'


export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return errorResponse('Unauthorized', 401)
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return errorResponse('No file provided', 400)
    }

    // Validate file type
    if (!file.type.startsWith('video/')) {
      return errorResponse('File must be a video', 400)
    }

    // Validate file size (100MB)
    if (file.size > 100 * 1024 * 1024) {
      return errorResponse('File size must be less than 100MB', 400)
    }

    // Use admin client to bypass RLS policies
    // Since we're using custom JWT auth, not Supabase Auth, we need admin client
    const supabase = await createAdminClient()

    // Upload to Supabase Storage
    // Path format: {user_id}/intro-video.{ext}
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/intro-video.${fileExt}`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('intro-videos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
      })

    if (uploadError) {
      console.error('Error uploading video:', uploadError)
      return errorResponse(`Failed to upload video: ${uploadError.message}`, 500)
    }

    // Get signed URL (bucket is private, so we need signed URL)
    // Signed URL expires in 1 year (31536000 seconds)
    const { data: urlData, error: urlError } = await supabase.storage
      .from('intro-videos')
      .createSignedUrl(fileName, 31536000) // 1 year expiry

    if (urlError) {
      console.error('Error creating signed URL:', urlError)
      // Fallback: return the path, frontend can request signed URL when needed
      return successResponse({ 
        url: fileName,
        path: fileName,
        bucket: 'intro-videos'
      })
    }

    return successResponse({ url: urlData.signedUrl, path: fileName })
  } catch (error) {
    console.error('Error in POST /api/user/upload-video:', error)
    return errorResponse('Internal server error', 500)
  }
}
