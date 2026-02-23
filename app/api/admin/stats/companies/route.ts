import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireRole, successResponse, handleApiError } from '@/lib/api-utils'
export const dynamic = 'force-dynamic'
export const runtime = 'edge'

export const GET = requireRole(['SUPER_ADMIN', 'QUALITY_ADMIN', 'ANALYST'], async (req, userId, userRole) => {
  try {
    const count = await db.company.count()
    return successResponse({ count })
  } catch (error) {
    return handleApiError(error)
  }
})
