import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { candidateProfileSchema } from '@/lib/validations'
import { requireAuth, successResponse, handleApiError } from '@/lib/api-utils'
import { calculateProfileReadiness } from '@/lib/utils/profile-readiness'
export const dynamic = 'force-dynamic'
export const runtime = 'edge'

export const GET = requireAuth(async (req, userId) => {
  try {
    const profile = await db.candidateProfile.findUnique({
      where: { userId },
      include: {
        skills: true,
        workHistory: true,
        education: true,
        languages: true,
        certifications: true,
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
    const validatedData = candidateProfileSchema.parse(body)

    // Check if profile exists
    const existingProfile = await db.candidateProfile.findUnique({
      where: { userId },
    })

    if (existingProfile) {
      return NextResponse.json(
        { success: false, error: 'Profile already exists. Use PUT to update.' },
        { status: 409 }
      )
    }

    const { skillIds, ...profileData } = validatedData

    const profile = await db.candidateProfile.create({
      data: {
        ...profileData,
        userId,
        skills: skillIds
          ? {
              connect: skillIds.map((id) => ({ id })),
            }
          : undefined,
      },
      include: {
        skills: true,
        workHistory: true,
        education: true,
        languages: true,
        certifications: true,
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
    const validatedData = candidateProfileSchema.partial().parse(body)

    const { skillIds, ...profileData } = validatedData

    const profile = await db.candidateProfile.upsert({
      where: { userId },
      create: {
        ...profileData,
        userId,
        skills: skillIds
          ? {
              connect: skillIds.map((id) => ({ id })),
            }
          : undefined,
      },
      update: {
        ...profileData,
        skills: skillIds
          ? {
              set: skillIds.map((id) => ({ id })),
            }
          : undefined,
      },
      include: {
        skills: true,
        workHistory: true,
        education: true,
        languages: true,
        certifications: true,
      },
    })

    // Auto-recalculate readiness after profile update
    await calculateProfileReadiness(userId)

    // Refetch to get updated readiness status
    const updatedProfile = await db.candidateProfile.findUnique({
      where: { userId },
      include: {
        skills: true,
        workHistory: true,
        education: true,
        languages: true,
        certifications: true,
      },
    })

    return successResponse(updatedProfile)
  } catch (error) {
    return handleApiError(error)
  }
})
