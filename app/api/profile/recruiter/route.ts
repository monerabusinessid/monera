import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { recruiterProfileSchema } from '@/lib/validations'
import { requireAuth, successResponse, handleApiError } from '@/lib/api-utils'
export const dynamic = 'force-dynamic'
export const runtime = 'edge'

export const GET = requireAuth(async (req, userId) => {
  try {
    const profile = await db.recruiterProfile.findUnique({
      where: { userId },
      include: {
        company: true,
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    })

    if (!profile) {
      return successResponse(null)
    }

    return successResponse(profile)
  } catch (error) {
    return handleApiError(error)
  }
})

export const POST = requireAuth(async (req, userId) => {
  try {
    const body = await req.json()
    const validatedData = recruiterProfileSchema.parse(body)

    const existingProfile = await db.recruiterProfile.findUnique({
      where: { userId },
    })

    if (existingProfile) {
      return NextResponse.json(
        { success: false, error: 'Profile already exists. Use PUT to update.' },
        { status: 409 }
      )
    }

    const profile = await db.recruiterProfile.create({
      data: {
        ...validatedData,
        userId,
      },
      include: {
        company: true,
      },
    })

    return successResponse(profile, 201)
  } catch (error) {
    return handleApiError(error)
  }
})

export const PUT = requireAuth(async (req, userId) => {
  try {
    const body = await req.json()
    const validatedData = recruiterProfileSchema.partial().parse(body)

    const profile = await db.recruiterProfile.upsert({
      where: { userId },
      create: {
        ...validatedData,
        userId,
      },
      update: validatedData,
      include: {
        company: true,
      },
    })

    return successResponse(profile)
  } catch (error) {
    return handleApiError(error)
  }
})
