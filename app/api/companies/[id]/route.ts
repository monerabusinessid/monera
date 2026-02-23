import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { companySchema } from '@/lib/validations'
import { requireAuth, successResponse, errorResponse, handleApiError, getAuthUser } from '@/lib/api-utils'

export const dynamic = 'force-dynamic'
export const runtime = 'edge'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const company = await db.company.findUnique({
      where: { id: params.id },
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

    // Check if user is admin
    const adminRoles = ['SUPER_ADMIN', 'QUALITY_ADMIN', 'CLIENT']
    if (!adminRoles.includes(user.role)) {
      return errorResponse('Forbidden', 403)
    }

    const company = await db.company.update({
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

    await db.company.delete({
      where: { id: params.id },
    })

    return successResponse({ message: 'Company deleted successfully' })
  } catch (error) {
    return handleApiError(error)
  }
}
