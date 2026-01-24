import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { updateTalentRequestSchema } from '@/lib/validations'
import { requireAuth, successResponse, errorResponse, handleApiError, getAuthUser } from '@/lib/api-utils'

export const dynamic = 'force-dynamic'


export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const talentRequest = await prisma.talentRequest.findUnique({
      where: { id: params.id },
    })

    if (!talentRequest) {
      return errorResponse('Talent request not found', 404)
    }

    return successResponse(talentRequest)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getAuthUser(request)
  if (!user) {
    return errorResponse('Unauthorized', 401)
  }

  // Only admins and recruiters can update talent requests
  const adminRoles = ['SUPER_ADMIN', 'QUALITY_ADMIN', 'SUPPORT_ADMIN', 'ANALYST']
  if (!adminRoles.includes(user.role) && user.role !== 'RECRUITER') {
    return errorResponse('Forbidden', 403)
  }

  try {
    const existingRequest = await prisma.talentRequest.findUnique({
      where: { id: params.id },
    })

    if (!existingRequest) {
      return errorResponse('Talent request not found', 404)
    }

    const body = await request.json()
    const validatedData = updateTalentRequestSchema.parse(body)

    const talentRequest = await prisma.talentRequest.update({
      where: { id: params.id },
      data: validatedData,
    })

    return successResponse(talentRequest)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getAuthUser(request)
  if (!user) {
    return errorResponse('Unauthorized', 401)
  }

  // Only admins can delete talent requests
  const adminRoles = ['SUPER_ADMIN', 'QUALITY_ADMIN', 'SUPPORT_ADMIN']
  if (!adminRoles.includes(user.role)) {
    return errorResponse('Forbidden', 403)
  }

  try {
    const talentRequest = await prisma.talentRequest.findUnique({
      where: { id: params.id },
    })

    if (!talentRequest) {
      return errorResponse('Talent request not found', 404)
    }

    await prisma.talentRequest.delete({
      where: { id: params.id },
    })

    return successResponse({ message: 'Talent request deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}
