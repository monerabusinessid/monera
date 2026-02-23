import { NextRequest } from 'next/server'
import { requireAuth, successResponse, handleApiError } from '@/lib/api-utils'
import { calculateProfileReadiness } from '@/lib/utils/profile-readiness'
export const dynamic = 'force-dynamic'
export const runtime = 'edge'

export const GET = requireAuth(async (req, userId) => {
  try {
    const readiness = await calculateProfileReadiness(userId)
    return successResponse(readiness)
  } catch (error) {
    return handleApiError(error)
  }
})
