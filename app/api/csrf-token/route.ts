import { NextRequest, NextResponse } from 'next/server'
import { generateCSRFToken } from '@/lib/security/csrf'
import { successResponse } from '@/lib/api-utils'

export async function GET(request: NextRequest) {
  try {
    const token = await generateCSRFToken()
    return successResponse({ token })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to generate CSRF token' },
      { status: 500 }
    )
  }
}
