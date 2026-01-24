import { NextRequest } from 'next/server'
import { getAuthUser, successResponse, errorResponse } from '@/lib/api-utils'
import { createAdminClient } from '@/lib/supabase/server'


export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return errorResponse('Unauthorized', 401)
    }

    if (user.role !== 'CLIENT') {
      return errorResponse('Only clients can access this endpoint', 403)
    }

    const body = await request.json()
    const { firstName, lastName, phone, companyName, companyWebsite, companyDescription } = body

    if (!firstName || !lastName) {
      return errorResponse('First name and last name are required', 400)
    }

    const adminSupabase = await createAdminClient()

    // Update profile full_name
    const fullName = `${firstName} ${lastName}`.trim()
    const { error: profileError } = await adminSupabase
      .from('profiles')
      .update({
        full_name: fullName,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (profileError) {
      console.error('Error updating profile:', profileError)
      return errorResponse('Failed to update profile', 500)
    }

    // Get or create company
    let companyId: string | null = null
    if (companyName) {
      // Check if company exists
      const { data: existingCompany } = await adminSupabase
        .from('companies')
        .select('id')
        .ilike('name', companyName.trim())
        .limit(1)
        .maybeSingle()

      if (existingCompany) {
        companyId = existingCompany.id
        // Update company info
        await adminSupabase
          .from('companies')
          .update({
            website: companyWebsite || null,
            description: companyDescription || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', companyId)
      } else {
        // Create new company
        const { data: newCompany, error: companyError } = await adminSupabase
          .from('companies')
          .insert({
            name: companyName.trim(),
            website: companyWebsite || null,
            description: companyDescription || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select('id')
          .single()

        if (companyError) {
          console.error('Error creating company:', companyError)
          return errorResponse('Failed to create company', 500)
        }
        companyId = newCompany.id
      }
    }

    // Update recruiter_profile
    const { error: recruiterProfileError } = await adminSupabase
      .from('recruiter_profiles')
      .upsert({
        user_id: user.id,
        first_name: firstName,
        last_name: lastName,
        phone: phone || null,
        company_id: companyId,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      })

    if (recruiterProfileError) {
      console.error('Error updating recruiter_profile:', recruiterProfileError)
      return errorResponse('Failed to update recruiter profile', 500)
    }

    return successResponse({
      message: 'Profile setup completed successfully',
      companyId,
    })
  } catch (error) {
    console.error('Error in POST /api/client/profile/setup:', error)
    return errorResponse('Internal server error', 500)
  }
}
