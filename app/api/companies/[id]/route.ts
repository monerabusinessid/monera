import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { companySchema } from '@/lib/validations'
import { requireAuth, successResponse, errorResponse, handleApiError, getAuthUser } from '@/lib/api-utils'

export const runtime = 'edge'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const company = await prisma.company.findUnique({
      where: { id: params.id },
      include: {
        jobs: {
          where: {
            status: 'PUBLISHED',
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            members: true,
            jobs: true,
          },
        },
      },
    })

    if (!company) {
      return errorResponse('Company not found', 404)
    }

    return successResponse(company)
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

  try {
    const body = await request.json()
    const validatedData = companySchema.partial().parse(body)
    const id = params.id

    // Check if user is admin or member of the company
    const adminRoles = ['SUPER_ADMIN', 'QUALITY_ADMIN']
    if (!adminRoles.includes(user.role)) {
      const recruiterProfile = await prisma.recruiterProfile.findUnique({
        where: { userId: user.id },
      })
      if (recruiterProfile?.companyId !== id) {
        return errorResponse('Forbidden', 403)
      }
    }

    const company = await prisma.company.update({
      where: { id },
      data: validatedData,
    })

    return successResponse(company)
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

  try {
    const adminRoles = ['SUPER_ADMIN', 'QUALITY_ADMIN']
    if (!adminRoles.includes(user.role)) {
      return errorResponse('Forbidden', 403)
    }

    await prisma.company.delete({
      where: { id: params.id },
    })

    return successResponse({ message: 'Company deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}
