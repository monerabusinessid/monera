import { NextRequest } from 'next/server'
import { createTalentRequestSchema, talentRequestSearchSchema } from '@/lib/validations'
import { getAuthUser, successResponse, handleApiError } from '@/lib/api-utils'
import { getSupabaseClient } from '@/lib/supabase/server-helper'
export const dynamic = 'force-dynamic'
export const runtime = 'edge'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    const { searchParams } = new URL(request.url)
    const validatedParams = talentRequestSearchSchema.parse({
      query: searchParams.get('query') || undefined,
      talentType: searchParams.get('talentType') || undefined,
      email: searchParams.get('email') || undefined,
      company: searchParams.get('company') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
    })

    const supabase = await getSupabaseClient()
    const skip = (validatedParams.page - 1) * validatedParams.limit

    // Build query
    let query = supabase
      .from('talent_requests')
      .select('*', { count: 'exact' })

    // If user is client, filter by their email
    if (user && user.role === 'CLIENT' && user.email) {
      query = query.eq('email', user.email)
    }

    // Apply filters
    if (validatedParams.query) {
      query = query.or(`client_name.ilike.%${validatedParams.query}%,email.ilike.%${validatedParams.query}%,company.ilike.%${validatedParams.query}%,notes.ilike.%${validatedParams.query}%`)
    }

    if (validatedParams.talentType) {
      query = query.ilike('talent_type', `%${validatedParams.talentType}%`)
    }

    if (validatedParams.email && (!user || user.role !== 'CLIENT')) {
      // Only allow email filter for admin
      query = query.ilike('email', `%${validatedParams.email}%`)
    }

    if (validatedParams.company) {
      query = query.ilike('company', `%${validatedParams.company}%`)
    }

    // Apply pagination
    query = query.range(skip, skip + validatedParams.limit - 1)
    query = query.order('created_at', { ascending: false })

    const { data: talentRequests, error, count } = await query

    if (error) {
      console.error('Error fetching talent requests:', error)
      return handleApiError(error)
    }

    // Convert to camelCase for frontend
    const formattedRequests = (talentRequests || []).map((req: any) => ({
      id: req.id,
      clientName: req.client_name,
      email: req.email,
      company: req.company,
      talentType: req.talent_type,
      budget: req.budget,
      notes: req.notes,
      status: req.status || 'PENDING',
      createdAt: req.created_at,
      updatedAt: req.updated_at,
    }))

    return successResponse({
      talentRequests: formattedRequests,
      pagination: {
        page: validatedParams.page,
        limit: validatedParams.limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / validatedParams.limit),
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createTalentRequestSchema.parse(body)

    const supabase = await getSupabaseClient()

    // Convert to snake_case for Supabase
    const insertData = {
      client_name: validatedData.clientName,
      email: validatedData.email,
      company: validatedData.company || null,
      talent_type: validatedData.talentType,
      budget: validatedData.budget,
      notes: validatedData.notes || null,
    }

    const { data: talentRequest, error: insertError } = await supabase
      .from('talent_requests')
      .insert(insertData)
      .select()
      .single()

    if (insertError || !talentRequest) {
      console.error('Error creating talent request:', insertError)
      return handleApiError(insertError || new Error('Failed to create talent request'))
    }

    // Convert to camelCase for response
    const formattedRequest = {
      id: talentRequest.id,
      clientName: talentRequest.client_name,
      email: talentRequest.email,
      company: talentRequest.company,
      talentType: talentRequest.talent_type,
      budget: talentRequest.budget,
      notes: talentRequest.notes,
      status: talentRequest.status || 'PENDING',
      createdAt: talentRequest.created_at,
      updatedAt: talentRequest.updated_at,
    }

    return successResponse(formattedRequest, 201)
  } catch (error) {
    return handleApiError(error)
  }
}
