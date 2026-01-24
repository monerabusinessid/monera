import { NextRequest } from 'next/server'
import { getAuthUser, successResponse, handleApiError, errorResponse } from '@/lib/api-utils'
import { getSupabaseClient } from '@/lib/supabase/server-helper'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return errorResponse('Unauthorized', 401)
    }

    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unreadOnly') === 'true'
    const limit = parseInt(searchParams.get('limit') || '50')

    const supabase = await getSupabaseClient()

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (unreadOnly) {
      query = query.eq('is_read', false)
    }

    const { data: notifications, error } = await query

    if (error) {
      console.error('Error fetching notifications:', error)
      return handleApiError(error)
    }

    return successResponse({
      notifications: notifications || [],
      unreadCount: notifications?.filter((n: any) => !n.is_read).length || 0,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return errorResponse('Unauthorized', 401)
    }

    const body = await request.json()
    const { userId, type, title, message, link } = body

    // Only admins can create notifications for other users
    if (userId && userId !== user.id && user.role !== 'ADMIN' && !user.role?.includes('ADMIN')) {
      return errorResponse('Forbidden', 403)
    }

    const supabase = await getSupabaseClient()

    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId || user.id,
        type: type || 'general',
        title,
        message,
        link: link || null,
        is_read: false,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating notification:', error)
      return handleApiError(error)
    }

    return successResponse(notification, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
