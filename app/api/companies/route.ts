import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { companySchema } from '@/lib/validations'
import { requireAuth, successResponse, handleApiError } from '@/lib/api-utils'


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              jobs: true,
              members: true,
            },
          },
        },
      }),
      prisma.company.count(),
    ])

    return successResponse({
      companies,
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
}

export const POST = requireAuth(async (req, userId) => {
  try {
    const body = await req.json()
    const validatedData = companySchema.parse(body)

    const company = await prisma.company.create({
      data: validatedData,
    })

    return successResponse(company, 201)
  } catch (error) {
    return handleApiError(error)
  }
})
