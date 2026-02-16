'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Footer } from '@/components/footer'

interface Skill {
  id: string
  name: string
}

interface ProfileData {
  id: string
  fullName: string | null
  headline: string | null
  bio: string | null
  location: string | null
  timezone: string | null
  country: string | null
  linkedInUrl: string | null
  githubUrl: string | null
  portfolioUrl: string | null
  hourlyRate: number | null
  availability: string | null
  avatarUrl: string | null
  profileCompletion: number
  skills: Skill[]
}

interface ExperienceData {
  workHistory: any[]
  education: any[]
  languages: any[]
  certifications: any[]
}

export default function TalentPublicProfilePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [experience, setExperience] = useState<ExperienceData>({
    workHistory: [],
    education: [],
    languages: [],
    certifications: [],
  })
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    if (!loading && (!user || user.role !== 'TALENT')) {
      router.push('/login?redirect=/talent/profile/public')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (!user || user.role !== 'TALENT') return

    const fetchData = async () => {
      setLoadingData(true)
      try {
        const [profileRes, experienceRes] = await Promise.all([
          fetch('/api/user/profile', { credentials: 'include', cache: 'no-store' }),
          fetch('/api/user/profile/experience', { credentials: 'include', cache: 'no-store' }),
        ])

        const profileJson = await profileRes.json()
        const experienceJson = await experienceRes.json()

        if (profileJson?.success && profileJson.data) {
          const data = profileJson.data
          setProfile({
            id: data.id,
            fullName: data.fullName || null,
            headline: data.headline || null,
            bio: data.bio || null,
            location: data.location || null,
            timezone: data.timezone || null,
            country: data.country || null,
            linkedInUrl: data.linkedInUrl || null,
            githubUrl: data.githubUrl || null,
            portfolioUrl: data.portfolioUrl || null,
            hourlyRate: data.hourlyRate ?? null,
            availability: data.availability || null,
            avatarUrl: data.avatarUrl || null,
            profileCompletion: data.profileCompletion || 0,
            skills: data.skills || [],
          })
        }

        if (experienceJson?.success && experienceJson.data) {
          setExperience({
            workHistory: experienceJson.data.workHistory || [],
            education: experienceJson.data.education || [],
            languages: experienceJson.data.languages || [],
            certifications: experienceJson.data.certifications || [],
          })
        }
      } catch (error) {
        console.error('[Talent Public Profile] Failed to load data:', error)
      } finally {
        setLoadingData(false)
      }
    }

    fetchData()
  }, [user])

  const displayName = profile?.fullName || 'N/A'
  const headline = profile?.headline || 'N/A'
  const locationLabel = profile?.location || profile?.country || 'N/A'
  const timezoneLabel = profile?.timezone || 'N/A'

  const verificationItems = useMemo(
    () => [
      { label: 'Email Verified', active: Boolean(user?.email) },
      { label: 'Portfolio Linked', active: Boolean(profile?.portfolioUrl) },
      { label: 'LinkedIn Linked', active: Boolean(profile?.linkedInUrl) },
    ],
    [profile?.portfolioUrl, profile?.linkedInUrl, user?.email]
  )

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f6f4fb] pt-24">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-purple"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-[#f6f4fb] pt-24 pb-16">
        <div className="container mx-auto max-w-6xl px-4">
        <div className="rounded-3xl border border-purple-100 bg-white/90 shadow-sm">
          <div className="relative overflow-hidden rounded-3xl">
            <div className="h-24 w-full bg-gradient-to-r from-purple-100 via-purple-50 to-white" />
            <div className="px-6 pb-6">
              <div className="-mt-12 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative h-20 w-20 overflow-hidden rounded-full border-4 border-white bg-gray-100">
                    {profile?.avatarUrl ? (
                      <Image
                        src={profile.avatarUrl}
                        alt={displayName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-gray-400">
                        {displayName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h1 className="text-xl font-semibold text-gray-900">{headline}</h1>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        {locationLabel}
                      </span>
                      <span>UTC {timezoneLabel}</span>
                      <span>{profile?.profileCompletion || 0}% Profile Completion</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" className="rounded-full px-5">Save Profile</Button>
                  <Button className="rounded-full bg-brand-purple px-6 text-white hover:bg-purple-700">Offer Contract</Button>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-6 border-b border-gray-100 text-sm font-medium text-gray-500">
                <span className="border-b-2 border-brand-purple pb-3 text-brand-purple">Overview</span>
                <span className="pb-3">Portfolio</span>
                <span className="pb-3">Experience</span>
                <span className="pb-3">Reviews</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">About Me</h2>
              <p className="mt-3 text-sm leading-6 text-gray-600">
                {profile?.bio || 'No bio added yet.'}
              </p>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Portfolio Highlights</h2>
                {profile?.portfolioUrl && (
                  <Link
                    href={profile.portfolioUrl}
                    className="text-sm font-medium text-brand-purple"
                    target="_blank"
                    rel="noreferrer"
                  >
                    View All Projects
                  </Link>
                )}
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-purple-50 to-white p-5">
                  <h3 className="text-sm font-semibold text-gray-900">Portfolio Link</h3>
                  {profile?.portfolioUrl ? (
                    <Link
                      href={profile.portfolioUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 block text-sm text-brand-purple hover:underline"
                    >
                      {profile.portfolioUrl}
                    </Link>
                  ) : (
                    <p className="mt-2 text-sm text-gray-500">No portfolio URL provided.</p>
                  )}
                </div>
                <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-purple-50 to-white p-5">
                  <h3 className="text-sm font-semibold text-gray-900">GitHub</h3>
                  {profile?.githubUrl ? (
                    <Link
                      href={profile.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 block text-sm text-brand-purple hover:underline"
                    >
                      {profile.githubUrl}
                    </Link>
                  ) : (
                    <p className="mt-2 text-sm text-gray-500">No GitHub URL provided.</p>
                  )}
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Work History</h2>
              <div className="mt-4 space-y-5">
                {experience.workHistory.length === 0 && (
                  <p className="text-sm text-gray-500">No work history added yet.</p>
                )}
                {experience.workHistory.map((work, index) => (
                  <div key={`${work.title || 'role'}-${index}`} className="border-l-2 border-purple-200 pl-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-900">{work.title || 'Role'}</h3>
                      <span className="text-xs text-gray-400">
                        {work.startDate || 'N/A'} - {work.endDate || 'Present'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{work.company || 'Company'}</p>
                    {work.description && (
                      <p className="mt-2 text-sm text-gray-500">{work.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Education</h2>
              <div className="mt-4 space-y-4">
                {experience.education.length === 0 && (
                  <p className="text-sm text-gray-500">No education added yet.</p>
                )}
                {experience.education.map((edu, index) => (
                  <div key={`${edu.institution || 'edu'}-${index}`} className="rounded-xl border border-gray-100 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-900">{edu.institution || 'Institution'}</p>
                      <span className="text-xs text-gray-400">
                        {edu.startYear || 'N/A'} - {edu.endYear || 'Present'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{edu.degree || 'Degree'} {edu.field ? ` ${edu.field}` : ''}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Work Preferences</h2>
              <div className="mt-4 space-y-3 text-sm text-gray-600">
                <div className="flex items-center justify-between">
                  <span>Hourly Rate</span>
                  <span className="font-medium text-gray-900">
                    {profile?.hourlyRate ? `$${profile.hourlyRate}/hr` : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Availability</span>
                  <span className="font-medium text-gray-900">{profile?.availability || 'N/A'}</span>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Skills</h2>
                <span className="text-xs text-gray-400">View All</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {profile?.skills?.length ? (
                  profile.skills.map((skill) => (
                    <span key={skill.id} className="rounded-full bg-purple-50 px-3 py-1 text-xs text-purple-700">
                      {skill.name}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No skills added yet.</p>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Verifications</h2>
              <div className="mt-4 space-y-3">
                {verificationItems.map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{item.label}</span>
                    <span className={item.active ? 'text-emerald-500' : 'text-gray-300'}>
                      {item.active ? 'Verified' : 'Not set'}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">External Links</h2>
              <div className="mt-4 space-y-3 text-sm text-gray-600">
                {profile?.linkedInUrl ? (
                  <Link href={profile.linkedInUrl} className="block text-brand-purple hover:underline" target="_blank" rel="noreferrer">
                    {profile.linkedInUrl}
                  </Link>
                ) : (
                  <p className="text-sm text-gray-500">No LinkedIn URL provided.</p>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">Languages</h2>
              <div className="mt-4 space-y-2">
                {experience.languages.length === 0 && (
                  <p className="text-sm text-gray-500">No languages added yet.</p>
                )}
                {experience.languages.map((lang, index) => (
                  <div key={`${lang.name || 'lang'}-${index}`} className="flex items-center justify-between text-sm text-gray-600">
                    <span>{lang.name || 'Language'}</span>
                    <span className="text-gray-500">{lang.proficiency || 'N/A'}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
    <Footer />
    </>
  )
}


