import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireAuth, successResponse, errorResponse, handleApiError, getAuthUser } from '@/lib/api-utils'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getAuthUser(request)
  if (!user) {
    return errorResponse('Unauthorized', 401)
  }

  try {
    const id = params.id

    const job = await db.job.findUnique({
      where: { id },
    })

    if (!job) {
      return errorResponse('Job not found', 404)
    }

    if (job.recruiterId !== user.id) {
      return errorResponse('Forbidden', 403)
    }

    const updatedJob = await db.job.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
    })

    return successResponse(updatedJob)
  } catch (error) {
    return handleApiError(error)
  }
}
