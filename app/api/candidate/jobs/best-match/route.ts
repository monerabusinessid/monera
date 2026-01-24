import { NextRequest } from 'next/server'
import { requireAuth, successResponse, handleApiError } from '@/lib/api-utils'
import { getBestMatchJobs } from '@/lib/utils/profile-readiness'
import { prisma } from '@/lib/db'

export const GET = requireAuth(async (req, userId) => {
  try {
    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '20')

    // Check if profile is ready
    const profile = await prisma.candidateProfile.findUnique({
      where: { userId },
    })

    if (!profile || !profile.isProfileReady) {
      return successResponse({
        jobs: [],
        message: 'Profile not ready. Complete your profile to see best match jobs.',
      })
    }

    const jobs = await getBestMatchJobs(userId, limit)
    return successResponse({ jobs })
  } catch (error) {
    return handleApiError(error)
  }
})
