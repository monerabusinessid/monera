import { NextRequest } from 'next/server'
import { getAuthUser, successResponse, handleApiError, errorResponse } from '@/lib/api-utils'
import { getSupabaseClient } from '@/lib/supabase/server-helper'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'


export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return errorResponse('Unauthorized', 401)
    }

    const body = await request.json()
    const { isRead } = body

    const supabase = await getSupabaseClient()

    // First, verify the notification belongs to the user
    const { data: notification, error: fetchError } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !notification) {
      return errorResponse('Notification not found', 404)
    }

    // Update notification
    const { data: updatedNotification, error: updateError } = await supabase
      .from('notifications')
      .update({
        is_read: isRead !== undefined ? isRead : true,
      })
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating notification:', updateError)
      return handleApiError(updateError)
    }

    return successResponse(updatedNotification)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return errorResponse('Unauthorized', 401)
    }

    const supabase = await getSupabaseClient()

    // Verify the notification belongs to the user
    const { data: notification, error: fetchError } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !notification) {
      return errorResponse('Notification not found', 404)
    }

    // Delete notification
    const { error: deleteError } = await supabase
      .from('notifications')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Error deleting notification:', deleteError)
      return handleApiError(deleteError)
    }

    return successResponse({ message: 'Notification deleted' })
  } catch (error) {
    return handleApiError(error)
  }
}
