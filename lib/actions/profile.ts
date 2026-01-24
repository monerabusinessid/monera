'use server'

import { prisma } from '@/lib/db'
import { candidateProfileSchema } from '@/lib/validations'
import { getAuthUser } from '@/lib/api-utils'
import { cookies } from 'next/headers'

interface ProfileReadinessResult {
  isReady: boolean
  completion: number
  missingFields: string[]
  scores: {
    headline: number
    skills: number
    experience: number
    rate: number
    portfolio: number
    availability: number
    name: number
  }
}

export async function checkProfileReadiness(userId: string): Promise<ProfileReadinessResult> {
  const profile = await prisma.candidateProfile.findUnique({
    where: { userId },
    include: { skills: true },
  })

  if (!profile) {
    return {
      isReady: false,
      completion: 0,
      missingFields: ['Full name', 'Headline', 'Skills', 'Experience', 'Hourly rate', 'Portfolio', 'Availability'],
      scores: {
        headline: 0,
        skills: 0,
        experience: 0,
        rate: 0,
        portfolio: 0,
        availability: 0,
        name: 0,
      },
    }
  }

  const missingFields: string[] = []
  const scores = {
    // Headline: 15% - min 5 words
    headline: profile.headline && profile.headline.split(/\s+/).length >= 5 ? 15 : 0,
    // Skills: 20% - min 3 skills
    skills: profile.skills.length >= 3 ? 20 : (profile.skills.length / 3) * 20,
    // Experience/Bio: 20% - min 100 chars
    experience: profile.bio && profile.bio.length >= 100 ? 20 : (profile.bio?.length || 0) / 100 * 20,
    // Rate: 15% - > 0
    rate: profile.hourlyRate && profile.hourlyRate > 0 ? 15 : 0,
    // Portfolio: 10% - portfolioUrl exists
    portfolio: profile.portfolioUrl ? 10 : 0,
    // Availability: 10% - must be set
    availability: profile.availability ? 10 : 0,
    // Name: 10% - firstName and lastName
    name: profile.firstName && profile.lastName ? 10 : 0,
  }

  if (!profile.firstName || !profile.lastName) missingFields.push('Full name')
  if (!profile.headline || profile.headline.split(/\s+/).length < 5) missingFields.push('Headline (min 5 words)')
  if (profile.skills.length < 3) missingFields.push('Skills (min 3)')
  if (!profile.bio || profile.bio.length < 100) missingFields.push('Experience/Bio (min 100 chars)')
  if (!profile.hourlyRate || profile.hourlyRate <= 0) missingFields.push('Hourly rate')
  if (!profile.portfolioUrl) missingFields.push('Portfolio URL')
  if (!profile.availability) missingFields.push('Availability')

  const completion = Object.values(scores).reduce((sum, score) => sum + score, 0)
  const isReady = completion >= 80

  // Update profile with readiness status
  await prisma.candidateProfile.update({
    where: { userId },
    data: {
      profileCompletion: completion,
      isProfileReady: isReady,
      lastValidatedAt: new Date(),
    },
  })

  return {
    isReady,
    completion: Math.round(completion),
    missingFields,
    scores,
  }
}

export async function updateProfile(data: any) {
  try {
    // Get user from token
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    
    // For now, we'll use a different approach - this will be called from client with token
    // We'll handle auth in the API route instead
    
    return { success: false, error: 'Use API route for now' }
  } catch (error) {
    return { success: false, error: 'Failed to update profile' }
  }
}
