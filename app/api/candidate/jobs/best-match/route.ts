import { NextRequest } from 'next/server'
import { requireAuth, successResponse, handleApiError } from '@/lib/api-utils'
import { db } from '@/lib/db'
export const dynamic = 'force-dynamic'
export const runtime = 'edge'

export const GET = requireAuth(async (req, userId) => {
  try {
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '20')

    // Get user profile
    const user = await db.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return successResponse({
        jobs: [],
        message: 'User not found',
      })
    }

    // Get all published jobs for now
    const jobs = await db.job.findMany({
      where: { status: 'PUBLISHED' },
      take: limit,
      orderBy: { createdAt: 'desc' },
    })

    return successResponse({ jobs })
  } catch (error) {
    return handleApiError(error)
  }
})
