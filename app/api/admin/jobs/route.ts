import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireRole, successResponse, handleApiError } from '@/lib/api-utils'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

export const GET = requireRole(['SUPER_ADMIN', 'QUALITY_ADMIN'], async (req, userId, userRole) => {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    const where: any = {}
    if (status) {
      where.status = status
    }

    const [jobs, total] = await Promise.all([
      db.job.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.job.count({ where }),
    ])

    return successResponse({
      jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
})
