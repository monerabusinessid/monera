import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { requireRole, successResponse, handleApiError } from '@/lib/api-utils'

export const runtime = 'edge'

export const GET = requireRole(['SUPER_ADMIN', 'QUALITY_ADMIN', 'SUPPORT_ADMIN', 'ANALYST'], async (req, userId, userRole) => {
  try {
    const count = await prisma.user.count()
    return successResponse({ count })
  } catch (error) {
    return handleApiError(error)
  }
})
