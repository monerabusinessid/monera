import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireRole, successResponse, handleApiError } from '@/lib/api-utils'
export const dynamic = 'force-dynamic'
export const runtime = 'edge'

export const GET = requireRole(['SUPER_ADMIN', 'QUALITY_ADMIN', 'ANALYST'], async (req, userId, userRole) => {
  try {
    const [total, active] = await Promise.all([
      db.job.count(),
      db.job.count({ where: { status: 'PUBLISHED' } }),
    ])
    return successResponse({ total, active })
  } catch (error) {
    return handleApiError(error)
  }
})
