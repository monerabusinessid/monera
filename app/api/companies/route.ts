import { NextRequest } from 'next/server'
import { companySchema } from '@/lib/validations'
import { requireAuth, successResponse, handleApiError } from '@/lib/api-utils'
import { createAdminClient } from '@/lib/supabase/server'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const supabase = await createAdminClient()
    
    const { data: companies, error, count } = await supabase
      .from('companies')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(skip, skip + limit - 1)

    if (error) {
      console.error('Error fetching companies:', error)
      return successResponse({ data: [], total: 0 })
    }

    return successResponse({
      data: companies || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error('Companies API error:', error)
    return successResponse({ data: [], total: 0 })
  }
}

export const POST = requireAuth(async (req, userId) => {
  try {
    const body = await req.json()
    const validatedData = companySchema.parse(body)

    const supabase = await createAdminClient()
    const { data: company, error } = await supabase
      .from('companies')
      .insert([validatedData])
      .select()
      .single()

    if (error) throw error

    return successResponse(company, 201)
  } catch (error) {
    return handleApiError(error)
  }
})
