import { prisma } from '@/lib/db'

export interface ProfileReadinessResult {
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

export async function calculateProfileReadiness(userId: string): Promise<ProfileReadinessResult> {
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
    skills: profile.skills.length >= 3 ? 20 : Math.min((profile.skills.length / 3) * 20, 20),
    // Experience/Bio: 20% - min 100 chars
    experience: profile.bio && profile.bio.length >= 100 ? 20 : Math.min((profile.bio?.length || 0) / 100 * 20, 20),
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

export async function getBestMatchJobs(userId: string, limit: number = 20) {
  const profile = await prisma.candidateProfile.findUnique({
    where: { userId },
    include: { skills: true },
  })

  if (!profile || !profile.isProfileReady) {
    return []
  }

  const profileSkillIds = profile.skills.map(s => s.id)
  const profileRate = profile.hourlyRate || 0

  // Get all published jobs
  const jobs = await prisma.job.findMany({
    where: {
      status: 'PUBLISHED',
    },
    include: {
      skills: true,
      company: true,
      recruiter: {
        select: {
          email: true,
        },
      },
      applications: {
        where: {
          candidateId: profile.id,
        },
      },
    },
    take: 100, // Get more to score and sort
  })

  // Score and sort jobs
  const scoredJobs = jobs.map(job => {
    // Skill match: 60%
    const jobSkillIds = job.skills.map(s => s.id)
    const matchingSkills = profileSkillIds.filter(id => jobSkillIds.includes(id))
    const skillMatchScore = job.skills.length > 0 
      ? (matchingSkills.length / Math.max(job.skills.length, profileSkillIds.length)) * 60
      : 0

    // Rate match: 20%
    let rateMatchScore = 0
    if (job.salaryMin && job.salaryMax && profileRate > 0) {
      const jobRateRange = (job.salaryMin + job.salaryMax) / 2
      const rateDiff = Math.abs(profileRate - jobRateRange) / jobRateRange
      rateMatchScore = Math.max(0, (1 - rateDiff) * 20)
    } else if (profileRate > 0) {
      rateMatchScore = 10 // Partial score if no job rate specified
    }

    // Availability: 10%
    const availabilityScore = profile.availability === 'Open' ? 10 : 0

    // Profile completion: 10%
    const completionScore = (profile.profileCompletion || 0) / 100 * 10

    const totalScore = skillMatchScore + rateMatchScore + availabilityScore + completionScore
    const hasApplied = job.applications.length > 0

    return {
      ...job,
      matchScore: totalScore,
      skillMatchScore,
      rateMatchScore,
      hasApplied,
    }
  })

  // Sort by match score descending, filter out applied jobs
  return scoredJobs
    .filter(job => !job.hasApplied)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit)
}
