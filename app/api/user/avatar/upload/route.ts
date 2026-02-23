import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getAuthUser, successResponse, errorResponse } from '@/lib/api-utils'
export const dynamic = 'force-dynamic'
export const runtime = 'edge'

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
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!validTypes.includes(file.type)) {
      return errorResponse('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.', 400)
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return errorResponse('File size too large. Maximum size is 5MB.', 400)
    }

    const supabase = await createAdminClient()

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExt = file.name.split('.').pop()
    const fileName = `avatars/${user.id}/${timestamp}-${randomString}.${fileExt}`

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true
      })

    if (uploadError) {
      console.error('Error uploading avatar:', uploadError)
      if (uploadError.message.includes('Bucket not found') || uploadError.message.includes('not found')) {
        return errorResponse(
          'Storage bucket "avatars" not found. Please create the bucket in Supabase Dashboard:\n\n' +
          '1. Go to Supabase Dashboard → Storage\n' +
          '2. Click "New bucket"\n' +
          '3. Name: "avatars"\n' +
          '4. Check "Public bucket"\n' +
          '5. Click "Create bucket"\n\n' +
          'Or run the SQL script: supabase/create-storage-buckets.sql',
          500
        )
      }
      return errorResponse(uploadError.message, 500)
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)

    // Update profile with avatar URL
    // Handle both UUID and TEXT user.id types
    const userIdStr = typeof user.id === 'string' ? user.id : String(user.id)
    
    // First check if profile exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userIdStr)
      .single()

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Error checking profile:', checkError)
      return errorResponse(
        `Failed to check profile: ${checkError.message || 'Unknown error'}`,
        500
      )
    }

    // If profile doesn't exist, create it
    // NOTE: avatar_url column may not exist in profiles table, so we'll store it in talent_profiles instead
    if (!existingProfile) {
      const { error: createError } = await supabase
        .from('profiles')
        .insert({
          id: userIdStr,
          full_name: null,
        })

      if (createError) {
        console.error('Error creating profile:', createError)
        return errorResponse(
          `Failed to create profile: ${createError.message || 'Unknown error'}`,
          500
        )
      }
    }
    
    // Update avatar in both profiles and talent_profiles tables
    // Update profiles table
    const { error: updateProfileError } = await supabase
      .from('profiles')
      .update({ avatar_url: urlData.publicUrl, updated_at: new Date().toISOString() })
      .eq('id', userIdStr)
    
    if (updateProfileError) {
      console.warn('Could not update profiles.avatar_url:', updateProfileError.message)
    }
    
    // Update talent_profiles table (where avatar_url should be stored)
    // First check if talent_profile exists
    const { data: talentProfile } = await supabase
      .from('talent_profiles')
      .select('id')
      .eq('user_id', userIdStr)
      .maybeSingle()
    
    if (talentProfile) {
      // Update existing talent profile with avatar
      const { error: updateTalentError } = await supabase
        .from('talent_profiles')
        .update({ avatar_url: urlData.publicUrl, updated_at: new Date().toISOString() })
        .eq('id', talentProfile.id)

      if (updateTalentError) {
        console.error('Error updating talent profile avatar:', updateTalentError)
      }
    }

    return successResponse({
      url: urlData.publicUrl,
      path: fileName
    })
  } catch (error: any) {
    console.error('Error in POST /api/user/avatar/upload:', error)
    return errorResponse(error.message || 'Internal server error', 500)
  }
}
