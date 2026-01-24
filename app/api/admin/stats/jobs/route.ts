import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { requireRole, successResponse, handleApiError } from '@/lib/api-utils'

export const GET = requireRole(['SUPER_ADMIN', 'QUALITY_ADMIN', 'ANALYST'], async (req, userId, userRole) => {
  try {
    const [total, active] = await Promise.all([
      prisma.job.count(),
      prisma.job.count({ where: { status: 'PUBLISHED' } }),
    ])
    return successResponse({ total, active })
  } catch (error) {
    return handleApiError(error)
  }
})
