'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getStatusMessage } from '@/lib/talent-status'
import { Footer } from '@/components/footer'

interface ProfileStatus {
  status: string
  profileCompletion: number
  isProfileReady: boolean
  submittedAt?: string | null
  revisionNotes?: string | null
  fullName?: string | null
  skills: Array<{ id: string; name: string }>
}

interface Job {
  id: string
  title: string
  description: string
  location: string | null
  remote: boolean
  salaryMin: number | null
  salaryMax: number | null
  currency: string | null
  company: {
    name: string
  } | null
  recruiter?: {
    name?: string | null
    email?: string | null
  } | null
  skills: Array<{ id: string; name: string }>
  createdAt: string
}

interface Application {
  id: string
  status: string
  createdAt: string
  job: {
    id: string
    title: string
    company: {
      name: string
    } | null
    recruiter: {
      email: string
    }
  }
}

export default function TalentPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [profileStatus, setProfileStatus] = useState<ProfileStatus | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [jobMatches, setJobMatches] = useState<Job[]>([])
  const [loadingJobs, setLoadingJobs] = useState(false)
  const [applications, setApplications] = useState<Application[]>([])
  const [loadingApplications, setLoadingApplications] = useState(false)
  const [savedCount, setSavedCount] = useState(0)
  const hasFetchedProfile = useRef(false)
  const redirectAttempted = useRef(false)
  const authRecheckAttempted = useRef(false)
  const authConfirmed = useRef(false)

  const fetchJobMatches = useCallback(async () => {
    setLoadingJobs(true)
    try {
      const response = await fetch('/api/jobs/matched', {
        credentials: 'include',
        cache: 'no-store',
      })
      const data = await response.json()

      if (data.success) {
        setJobMatches(data.data.jobs || [])
        console.log('Job matches fetched:', data.data.jobs?.length || 0, 'jobs')
      } else {
        console.error('Failed to fetch job matches:', data.error)
      }
    } catch (error) {
      console.error('Failed to fetch job matches:', error)
    } finally {
      setLoadingJobs(false)
    }
  }, [])

  const fetchProfileStatus = useCallback(async () => {
    setLoadingProfile(true)

    try {
      const profileResponse = await fetch('/api/user/profile?' + new Date().getTime(), {
        credentials: 'include',
        cache: 'no-store',
      })

      if (profileResponse.ok) {
        const profileData = await profileResponse.json()

        if (profileData.success && profileData.data) {
          const profile = profileData.data
          let status = profile.status || 'DRAFT'

          if (status === 'DRAFT') {
            try {
              const meRes = await fetch('/api/auth/me', { credentials: 'include' })
              if (meRes.ok) {
                const meData = await meRes.json()
                const fallbackStatus = meData?.data?.talentProfile?.status
                if (fallbackStatus) {
                  status = fallbackStatus
                }
              }
            } catch (err) {
              console.warn('[Talent] Fallback status check failed:', err)
            }
          }

          console.log('Profile status fetched:', {
            status,
            submittedAt: profile.submittedAt,
            skillsCount: profile.skills?.length || 0
          })

          setProfileStatus({
            status: status,
            profileCompletion: profile.profileCompletion || 0,
            isProfileReady: status === 'APPROVED',
            submittedAt: profile.submittedAt || null,
            revisionNotes: profile.revisionNotes || null,
            fullName: profile.fullName || null,
            skills: profile.skills || [],
          })

          if (status === 'SUBMITTED' || status === 'APPROVED') {
            fetchJobMatches()
          }
        } else {
          console.warn('Profile data not found or invalid:', profileData)
        }
      } else {
        console.error('Failed to fetch profile:', profileResponse.status, profileResponse.statusText)
      }
    } catch (error) {
      console.error('Error fetching profile status:', error)
      setProfileStatus({
        status: 'DRAFT',
        profileCompletion: 0,
        isProfileReady: false,
        skills: [],
      })
    } finally {
      setLoadingProfile(false)
    }
  }, [fetchJobMatches])

  const fetchApplications = useCallback(async () => {
    setLoadingApplications(true)
    try {
      const response = await fetch('/api/applications', {
        credentials: 'include',
      })
      const data = await response.json()
      console.log('Applications API response:', data)

      if (data.success) {
        setApplications(data.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error)
    } finally {
      setLoadingApplications(false)
    }
  }, [])

  const fetchSavedJobsCount = useCallback(async () => {
    try {
      const response = await fetch('/api/saved-jobs', {
        credentials: 'include',
        cache: 'no-store',
      })
      const data = await response.json()
      console.log('Saved jobs API response:', data)
      if (data.success) {
        setSavedCount(data.data?.count || 0)
      }
    } catch (error) {
      console.error('Failed to fetch saved jobs count:', error)
    }
  }, [])

  const getCardLink = (label: string) => {
    switch (label) {
      case 'Applications':
        return '/talent/applications'
      case 'Interviews':
        return '/talent/applications?status=SHORTLISTED'
      case 'Offers':
        return '/talent/applications?status=ACCEPTED'
      case 'Saved Jobs':
        return '/talent/saved-jobs'
      default:
        return '/talent'
    }
  }

  useEffect(() => {
    let mounted = true

    const checkAuth = async () => {
      if (loading) {
        return
      }

      if (user && user.role === 'TALENT') {
        if (!hasFetchedProfile.current) {
          hasFetchedProfile.current = true
          fetchProfileStatus()
        }
        return
      }

      if (!loading && user && user.role !== 'TALENT') {
        if (!redirectAttempted.current) {
          redirectAttempted.current = true
          if (user.role === 'CLIENT') {
            router.push('/client')
          } else if (['SUPER_ADMIN', 'QUALITY_ADMIN', 'SUPPORT_ADMIN', 'ANALYST', 'ADMIN'].includes(user.role)) {
            router.push('/admin')
          } else {
            router.push('/login')
          }
        }
        return
      }

      if (!loading && !user) {
        if (!authRecheckAttempted.current) {
          authRecheckAttempted.current = true
          try {
            const meRes = await fetch('/api/auth/me', { credentials: 'include' })
            const meData = await meRes.json()
            if (meData?.success && meData?.data?.role === 'TALENT') {
              authConfirmed.current = true
              return
            }
          } catch (err) {
            console.warn('[Talent] Auth recheck failed:', err)
          }
        }

        if (authConfirmed.current) {
          return
        }

        if (!redirectAttempted.current) {
          redirectAttempted.current = true
          setTimeout(() => {
            if (!mounted) return
            router.push('/login?redirect=/talent')
          }, 1500)
        }
      }
    }

    checkAuth()

    return () => {
      mounted = false
    }
  }, [user, loading, router, fetchProfileStatus])

  useEffect(() => {
    if (!loading && user?.role === 'TALENT') {
      fetchApplications()
      fetchSavedJobsCount()
    }
  }, [user, loading, fetchApplications, fetchSavedJobsCount])

  // Redirect to onboarding only if profile status is DRAFT
  useEffect(() => {
    if (profileStatus && profileStatus.status === 'DRAFT') {
      console.log('Redirecting to onboarding due to DRAFT status')
      router.push('/talent/onboarding')
    }
  }, [profileStatus, router])

  if (loading || loadingProfile || (!user && authConfirmed.current)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-24">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-purple"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (profileStatus && profileStatus.status === 'DRAFT') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-24">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-purple"></div>
          <p className="mt-4 text-gray-600">Redirecting to onboarding...</p>
        </div>
      </div>
    )
  }

  const statusInfo = profileStatus ? getStatusMessage(profileStatus.status as any) : null
  const interviewCount = Array.isArray(applications) ? applications.filter((app) => app.status === 'SHORTLISTED').length : 0
  const offerCount = Array.isArray(applications) ? applications.filter((app) => app.status === 'ACCEPTED').length : 0
  const todayLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <>
      <div className="min-h-screen bg-[#f6f6f9] pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-7xl">
        <div className="mb-8 flex flex-col gap-2">
          <h1 className="text-3xl font-semibold text-gray-900">
            Welcome back{profileStatus?.fullName ? `, ${profileStatus.fullName}` : ''}!
          </h1>
          <p className="text-sm text-gray-500">{todayLabel}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {[
                {
                  label: 'Applications',
                  value: Array.isArray(applications) ? applications.length : 0,
                  hint: loadingApplications ? 'Updating...' : `${Array.isArray(applications) ? applications.length : 0} total`,
                  accent: 'bg-indigo-50 text-indigo-700',
                  icon: (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 7V6a2 2 0 012-2h8a2 2 0 012 2v1" />
                      <rect x="4" y="7" width="16" height="13" rx="2" strokeWidth={2} />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 11h6" />
                    </svg>
                  ),
                },
                {
                  label: 'Interviews',
                  value: interviewCount,
                  hint: interviewCount === 0 ? 'None' : 'Active',
                  accent: 'bg-purple-50 text-purple-700',
                  icon: (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h6" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a8 8 0 11-3.3-6.5L21 5v7z" />
                    </svg>
                  ),
                },
                {
                  label: 'Offers',
                  value: offerCount,
                  hint: offerCount === 0 ? 'None' : 'Pending',
                  accent: 'bg-amber-50 text-amber-700',
                  icon: (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h10l2 5-7 7-7-7 2-5z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7l3 3 3-3" />
                    </svg>
                  ),
                },
                {
                  label: 'Saved Jobs',
                  value: savedCount,
                  hint: savedCount === 0 ? 'None' : 'Saved',
                  accent: 'bg-rose-50 text-rose-700',
                  icon: (
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 4h12a1 1 0 011 1v15l-7-4-7 4V5a1 1 0 011-1z" />
                    </svg>
                  ),
                },
              ].map((item) => (
                <Link key={item.label} href={getCardLink(item.label)}>
                  <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className={`h-10 w-10 rounded-xl ${item.accent} flex items-center justify-center text-sm font-semibold`}>
                        {item.icon}
                      </div>
                      <div className="mt-4 text-2xl font-semibold text-gray-900">{item.value}</div>
                      <p className="text-sm text-gray-500">{item.label}</p>
                      <span className="mt-2 inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                        {item.hint}
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recommended Jobs</h2>
              <Link href="/talent/jobs" className="text-sm font-medium text-brand-purple hover:underline">
                View all
              </Link>
            </div>

            {loadingJobs ? (
              <Card className="border border-gray-100 shadow-sm">
                <CardContent className="py-8 text-center text-gray-500">Loading job matches...</CardContent>
              </Card>
            ) : jobMatches.length === 0 ? (
              <Card className="border border-gray-100 shadow-sm">
                <CardContent className="py-8 text-center text-gray-500">No job matches yet.</CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {jobMatches.map((job) => (
                  <Link key={job.id} href={`/talent/jobs/${job.id}`} className="block">
                    <Card className="border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          <div className="h-12 w-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-semibold">
                            {job.company?.name?.charAt(0) || 'M'}
                          </div>
                          <div className="flex-1">
                            <p className="text-base font-semibold text-gray-900 hover:text-brand-purple">
                              {job.title}
                            </p>
                            <p className="text-sm text-gray-500">{job.company?.name || job.recruiter?.email || 'No company'}</p>
                            <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                              {job.remote && <span className="rounded-full bg-gray-100 px-2 py-0.5">Remote</span>}
                              {job.location && !job.remote && (
                                <span className="rounded-full bg-gray-100 px-2 py-0.5">{job.location}</span>
                              )}
                              {job.salaryMin && (
                                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">
                                  {job.currency || '$'}{job.salaryMin.toLocaleString()}
                                  {job.salaryMax ? ` - ${job.currency || '$'}${job.salaryMax.toLocaleString()}` : ''}
                                </span>
                              )}
                            </div>
                            <p className="mt-3 text-xs text-gray-400">
                              Posted {new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </p>
                          </div>
                          <div className="text-gray-300">*</div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <Card className="border border-gray-100 shadow-sm">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-700">Profile Strength</p>
                  <span className="text-sm font-semibold text-brand-purple">
                    {profileStatus?.profileCompletion || 0}%
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-yellow-400 via-orange-400 to-brand-purple"
                    style={{ width: `${profileStatus?.profileCompletion || 0}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Your profile is looking great! Add more details to reach All-Star status.
                </p>
                <Link href="/talent/profile">
                  <Button className="w-full rounded-full bg-brand-purple hover:bg-purple-700">
                    Complete Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border border-gray-100 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Upcoming</CardTitle>
                  <span className="text-xs text-gray-400">Calendar</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {profileStatus?.submittedAt ? (
                  <div className="flex items-start gap-3 rounded-xl border border-gray-100 p-3">
                    <div className="rounded-xl bg-purple-50 px-3 py-2 text-center text-xs font-semibold text-purple-600">
                      {new Date(profileStatus.submittedAt).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                      <div className="text-base text-gray-900">
                        {new Date(profileStatus.submittedAt).toLocaleDateString('en-US', { day: '2-digit' })}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Profile Review</p>
                      <p className="text-xs text-gray-500">
                        Submitted {new Date(profileStatus.submittedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No upcoming events yet.</p>
                )}
              </CardContent>
            </Card>

            <Card className="border border-gray-100 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Recent Messages</CardTitle>
                  <Link href="/talent/messages" className="text-xs font-medium text-brand-purple hover:underline">
                    View all
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.isArray(applications) && applications.slice(0, 3).map((app) => (
                  <div key={app.id} className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-semibold">
                      {app.job.company?.name?.charAt(0) || 'R'}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">
                        {app.job.company?.name || app.job.recruiter.email}
                      </p>
                      <p className="text-xs text-gray-500 line-clamp-1">
                        Application status: {app.status}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(app.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                ))}
                {(!Array.isArray(applications) || applications.length === 0) && (
                  <p className="text-sm text-gray-500">No recent messages yet.</p>
                )}
              </CardContent>
            </Card>

            {profileStatus && statusInfo && (
              <Card className="border border-gray-100 shadow-sm">
                <CardContent className="p-4">
                  <div className={`${statusInfo.bgColor} ${statusInfo.color} rounded-xl p-4`}>
                    <p className="text-sm font-semibold">{statusInfo.message}</p>
                    <p className="text-xs opacity-80 mt-1">{statusInfo.description}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

