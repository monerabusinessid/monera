'use server'

import { db } from '@/lib/db'

export async function checkProfileReadiness(userId: string) {
  try {
    const profile = await db.candidateProfile.findUnique({
      where: { userId },
    })

    if (!profile) {
      return {
        isReady: false,
        completion: 0,
        missingFields: ['Profile not found'],
      }
    }

    return {
      isReady: profile.isProfileReady || false,
      completion: profile.profileCompletion || 0,
      missingFields: [],
    }
  } catch (error) {
    return {
      isReady: false,
      completion: 0,
      missingFields: ['Error checking profile'],
    }
  }
}

export async function updateProfile(data: any) {
  return { success: false, error: 'Use API route for profile updates' }
}
