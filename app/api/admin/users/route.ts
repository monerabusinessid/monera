import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireRole, successResponse, handleApiError } from '@/lib/api-utils'
export const dynamic = 'force-dynamic'
export const runtime = 'edge'

export const GET = requireRole(['SUPER_ADMIN', 'QUALITY_ADMIN'], async (req, userId, userRole) => {
  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    const [users, total] = await Promise.all([
      db.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
          candidateProfile: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
          recruiterProfile: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      db.user.count(),
    ])

    return successResponse({
      users,
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
