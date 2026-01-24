import { NextRequest } from 'next/server'
import { createTalentRequestSchema } from '@/lib/validations'
import { sendEmail, emailTemplates } from '@/lib/email'
import { successResponse, handleApiError } from '@/lib/api-utils'
import { getSupabaseClient } from '@/lib/supabase/server-helper'


export async function POST(request: NextRequest) {
  try {
    // 1. Validate input
    const body = await request.json()
    console.log('Received request body:', body)
    
    const validatedData = createTalentRequestSchema.parse(body)
    console.log('Validated data:', validatedData)

    // 2. Save data to database (Supabase)
    console.log('Attempting to save to database...')
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
      console.error('Error saving talent request:', insertError)
      return handleApiError(insertError || new Error('Failed to create talent request'))
    }

    console.log('Data saved successfully:', talentRequest.id)

    // 3. Trigger email notification to admin
    try {
      const adminEmail = process.env.ADMIN_EMAIL

      if (!adminEmail) {
        console.warn('⚠️  ADMIN_EMAIL not configured. Skipping email notification.')
      } else {
        // Send email to admin
        await sendEmail({
          to: adminEmail,
          ...emailTemplates.newTalentRequest(
            validatedData.clientName,
            validatedData.email,
            validatedData.company || null,
            validatedData.talentType,
            validatedData.budget,
            validatedData.notes || null,
            talentRequest.id
          ),
        })
      }
    } catch (emailError) {
      // Log email error but don't fail the request
      console.error('Failed to send admin notification email:', emailError)
      // Continue with success response even if email fails
    }

    // 4. Return success response
    return successResponse(
      {
        message: 'Talent request submitted successfully',
        talentRequest: {
          id: talentRequest.id,
          clientName: talentRequest.client_name,
          email: talentRequest.email,
          talentType: talentRequest.talent_type,
          createdAt: talentRequest.created_at,
        },
      },
      201
    )
  } catch (error) {
    console.error('API Error details:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)
    }
    return handleApiError(error)
  }
}
