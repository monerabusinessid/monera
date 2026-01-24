import { createAdminClient } from '@/lib/supabase/server-helper'

export interface CreateNotificationParams {
  userId: string
  type: 'application' | 'message' | 'job' | 'talent_request' | 'general'
  title: string
  message: string
  link?: string | null
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    const adminSupabase = await createAdminClient()

    const { data: notification, error } = await adminSupabase
      .from('notifications')
      .insert({
        user_id: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        link: params.link || null,
        is_read: false,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating notification:', error)
      return null
    }

    return notification
  } catch (error) {
    console.error('Error creating notification:', error)
    return null
  }
}
