import { NextRequest } from 'next/server'
import { getAuthUser, successResponse, handleApiError, errorResponse } from '@/lib/api-utils'
import { getSupabaseClient } from '@/lib/supabase/server-helper'
import { z } from 'zod'

const createMessageSchema = z.object({
  conversationId: z.string().optional(),
  recruiterId: z.string().optional(),
  talentId: z.string().optional(),
  jobId: z.string().optional(),
  content: z.string().min(1, 'Message content is required'),
})

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return errorResponse('Unauthorized', 401)
    }

    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')
    const role = searchParams.get('role') // 'client' or 'talent'

    const supabase = await getSupabaseClient()

    // Get user profile to check role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return errorResponse('Profile not found', 404)
    }

    if (conversationId) {
      // Get messages for specific conversation
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single()

      if (convError || !conversation) {
        return successResponse({ conversation: null, messages: [] })
      }

      // Check access: user must be either talent or recruiter in this conversation
      if (profile.role === 'TALENT' && conversation.talent_id !== user.id) {
        return errorResponse('Forbidden', 403)
      }
      if ((profile.role === 'CLIENT' || profile.role === 'RECRUITER') && conversation.recruiter_id !== user.id) {
        return errorResponse('Forbidden', 403)
      }

      // Fetch messages
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (messagesError) {
        console.error('Error fetching messages:', messagesError)
        return handleApiError(messagesError)
      }

      return successResponse({ conversation, messages: messages || [] })
    } else {
      // Get all conversations for this user
      let conversationsQuery = supabase
        .from('conversations')
        .select('*')

      if (profile.role === 'TALENT') {
        conversationsQuery = conversationsQuery.eq('talent_id', user.id)
      } else if (profile.role === 'CLIENT' || profile.role === 'RECRUITER') {
        conversationsQuery = conversationsQuery.eq('recruiter_id', user.id)
      } else {
        return successResponse({ conversations: [] })
      }

      const { data: conversations, error: convsError } = await conversationsQuery
        .order('updated_at', { ascending: false })

      if (convsError) {
        console.error('Error fetching conversations:', convsError)
        return handleApiError(convsError)
      }

      // For each conversation, get last message and unread count
      const enrichedConversations = await Promise.all(
        (conversations || []).map(async (conv: any) => {
          // Get last message
          const { data: lastMessage } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          // Get unread count (messages not read by current user)
          const { data: unreadMessages } = await supabase
            .from('messages')
            .select('id')
            .eq('conversation_id', conv.id)
            .eq('is_read', false)
            .neq('sender_id', user.id)

          // Get talent/recruiter info
          let talentInfo = null
          if (conv.talent_id) {
            const { data: talentProfile } = await supabase
              .from('talent_profiles')
              .select('user_id, first_name, last_name')
              .eq('id', conv.talent_id)
              .single()

            if (talentProfile) {
              const { data: talentUser } = await supabase
                .from('profiles')
                .select('id, email, full_name')
                .eq('id', talentProfile.user_id)
                .single()

              talentInfo = {
                id: talentProfile.user_id,
                full_name: talentUser?.full_name || `${talentProfile.first_name || ''} ${talentProfile.last_name || ''}`.trim() || null,
                email: talentUser?.email || null,
              }
            }
          }

          return {
            id: conv.id,
            talent: talentInfo,
            lastMessage: lastMessage?.content || null,
            lastMessageAt: lastMessage?.created_at || null,
            unreadCount: unreadMessages?.length || 0,
          }
        })
      )

      return successResponse({ conversations: enrichedConversations })
    }
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
    const validatedData = createMessageSchema.parse(body)

    const supabase = await getSupabaseClient()

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return errorResponse('Profile not found', 404)
    }

    let conversation

    if (validatedData.conversationId) {
      // Use existing conversation
      const { data: conv, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', validatedData.conversationId)
        .single()

      if (convError || !conv) {
        return errorResponse('Conversation not found', 404)
      }

      // Check access
      if (profile.role === 'TALENT' && conv.talent_id !== user.id) {
        return errorResponse('Forbidden', 403)
      }
      if ((profile.role === 'CLIENT' || profile.role === 'RECRUITER') && conv.recruiter_id !== user.id) {
        return errorResponse('Forbidden', 403)
      }

      conversation = conv
    } else {
      // Create new conversation (for client/recruiter to start conversation with talent)
      if (profile.role !== 'CLIENT' && profile.role !== 'RECRUITER') {
        return errorResponse('Only clients/recruiters can start conversations', 403)
      }

      if (!validatedData.talentId) {
        return errorResponse('talentId is required to start a conversation', 400)
      }

      // Check if conversation already exists
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('*')
        .eq('recruiter_id', user.id)
        .eq('talent_id', validatedData.talentId)
        .single()

      if (existingConv) {
        conversation = existingConv
      } else {
        // Create new conversation
        const { data: newConv, error: createError } = await supabase
          .from('conversations')
          .insert({
            recruiter_id: user.id,
            talent_id: validatedData.talentId,
            job_id: validatedData.jobId || null,
          })
          .select()
          .single()

        if (createError || !newConv) {
          console.error('Error creating conversation:', createError)
          return handleApiError(createError || new Error('Failed to create conversation'))
        }

        conversation = newConv
      }
    }

    // Create message
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversation.id,
        sender_id: user.id,
        content: validatedData.content,
        is_read: false,
      })
      .select()
      .single()

    if (messageError || !message) {
      console.error('Error creating message:', messageError)
      return handleApiError(messageError || new Error('Failed to create message'))
    }

    // Update conversation updated_at
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversation.id)

    return successResponse(message, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
