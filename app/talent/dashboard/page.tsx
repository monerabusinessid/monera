'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Footer } from '@/components/footer'

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
  recruiter: {
    email: string
  }
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
  }
}

interface Profile {
  firstName: string | null
  lastName: string | null
  headline: string | null
  hourlyRate: number | null
  availability: string | null
  skills: Array<{ name: string }>
}

type OnboardingStatusProps = {
  completion: number
}

function OnboardingStatusWidget({ completion }: OnboardingStatusProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600">Finish your profile to unlock more opportunities.</p>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-brand-purple h-2 rounded-full transition-all"
          style={{ width: `${completion}%` }}
        ></div>
      </div>
      <p className="text-xs text-gray-500">{completion}% complete</p>
      <Link href="/talent/onboarding">
        <Button size="sm" className="w-full">
          Continue onboarding
        </Button>
      </Link>
    </div>
  )
}

function OnboardingStatusCard({ completion }: OnboardingStatusProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Next Steps</CardTitle>
        <CardDescription>Complete these to improve your profile</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span>Profile basics</span>
          <span className="text-gray-500">{completion >= 40 ? 'Done' : 'Pending'}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span>Skills and rates</span>
          <span className="text-gray-500">{completion >= 70 ? 'Done' : 'Pending'}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span>Portfolio and bio</span>
          <span className="text-gray-500">{completion >= 100 ? 'Done' : 'Pending'}</span>
        </div>
        <Link href="/talent/onboarding">
          <Button variant="outline" size="sm" className="w-full">
            Update profile
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

export default function TalentDashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [profileCompletion, setProfileCompletion] = useState(0)
  const [activeTab, setActiveTab] = useState<'best' | 'recent' | 'saved'>('best')
  const [searchQuery, setSearchQuery] = useState('')
  const [loadingData, setLoadingData] = useState(true)
  const [lastFetch, setLastFetch] = useState(Date.now())

  // Fetch data function
  const fetchData = useCallback(async () => {
    try {
      const [jobsRes, profileRes] = await Promise.all([
        fetch(`/api/jobs?status=PUBLISHED&limit=10`, {
          credentials: 'include',
        }),
        fetch('/api/profile/talent', {
          credentials: 'include',
        }),
      ])

      const jobsData = await jobsRes.json()
      const profileData = await profileRes.json()

      if (jobsData.success) {
        setJobs(jobsData.data.jobs || [])
      }

      if (profileData.success && profileData.data) {
        setProfile(profileData.data)
        setProfileCompletion(calculateProfileCompletion(profileData.data))
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoadingData(false)
      setLastFetch(Date.now())
    }
  }, [])

  // Initial fetch and auto-refresh
  useEffect(() => {
    // Wait for auth to finish loading before checking
    if (loading) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[TalentDashboard] Auth still loading, waiting...')
      }
      return
    }
    
    // Only redirect if auth is done loading and user is definitely not authenticated
    if (!user) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[TalentDashboard] No user found, redirecting to login')
      }
      // Use window.location for immediate redirect
      window.location.href = '/login'
      return
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[TalentDashboard] User found:', { role: user.role, userId: user.id })
    }
    
    // Check role - redirect if not TALENT
    if (user.role !== 'TALENT') {
      if (process.env.NODE_ENV === 'development') {
        console.log('[TalentDashboard] User role is not TALENT, redirecting:', user.role)
      }
      // Redirect based on role
      if (user.role === 'CLIENT' || user.role === 'RECRUITER') {
        window.location.href = '/client'
      } else if (user.role === 'SUPER_ADMIN' || user.role === 'QUALITY_ADMIN' || user.role === 'SUPPORT_ADMIN' || user.role === 'ANALYST' || user.role === 'ADMIN') {
        window.location.href = '/admin/dashboard'
      } else {
        window.location.href = '/login'
      }
      return
    }
    
    // User is TALENT, fetch data
    if (user.role === 'TALENT') {
      if (process.env.NODE_ENV === 'development') {
        console.log('[TalentDashboard] User is TALENT, fetching data...')
      }
      fetchData()
      
      // Auto-refresh every 30 seconds
      const interval = setInterval(() => {
        fetchData()
      }, 30000)

      // Refresh when window regains focus
      const handleFocus = () => {
        fetchData()
      }
      window.addEventListener('focus', handleFocus)

      return () => {
        clearInterval(interval)
        window.removeEventListener('focus', handleFocus)
      }
    }
  }, [user, loading, router, fetchData])

  // Refresh function
  const refreshData = useCallback(() => {
    setLoadingData(true)
    fetchData()
  }, [fetchData])

  const calculateProfileCompletion = (profile: any): number => {
    if (!profile) return 0
    const fields = [
      profile.firstName,
      profile.lastName,
      profile.headline,
      profile.bio,
      profile.location,
      profile.hourlyRate,
      profile.portfolioUrl,
      profile.skills?.length > 0,
    ]
    const completed = fields.filter(Boolean).length
    return Math.round((completed / fields.length) * 100)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/talent/jobs?query=${encodeURIComponent(searchQuery)}`)
  }

  const formatTimeAgo = (date: string) => {
    const now = new Date()
    const past = new Date(date)
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric' })
  }

  // Show loading state while checking auth or loading data
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-purple"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If user is not authenticated or not TALENT, redirect will be handled by useEffect
  // But we should show loading state while redirecting
  if (!user || user.role !== 'TALENT') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-purple"></div>
          <p className="mt-4 text-gray-600">Redirecting...</p>
        </div>
      </div>
    )
  }

  // Show loading state while fetching data
  if (loadingData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-purple"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Informational Banner */}
      {profileCompletion < 100 && (
        <div className="bg-blue-50 border-b border-blue-200">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <p className="text-sm text-blue-800">
                  To do: Complete your profile. Clients trust and hire freelancers who have complete profiles.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Learn How to Get Started Card */}
            <Card className="bg-gradient-to-br from-purple-50 to-green-50 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">Learn How to Get Started</h3>
                    <p className="text-gray-700 mb-4">
                      Monera 101 will guide you through the basics of the platform.
                    </p>
                    <Button className="bg-green-600 hover:bg-green-700">
                      Explore Monera 101 →
                    </Button>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Job Search Bar */}
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder="Search for jobs"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </form>

            {/* Jobs You Might Like Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Jobs you might like</h2>
              </div>

              {/* Tabs */}
              <div className="flex gap-6 border-b mb-4">
                <button
                  onClick={() => setActiveTab('best')}
                  className={`pb-2 px-1 font-medium ${
                    activeTab === 'best'
                      ? 'border-b-2 border-brand-purple text-brand-purple'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Best Matches
                </button>
                <button
                  onClick={() => setActiveTab('recent')}
                  className={`pb-2 px-1 font-medium ${
                    activeTab === 'recent'
                      ? 'border-b-2 border-brand-purple text-brand-purple'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Most Recent
                </button>
                <button
                  onClick={() => setActiveTab('saved')}
                  className={`pb-2 px-1 font-medium ${
                    activeTab === 'saved'
                      ? 'border-b-2 border-brand-purple text-brand-purple'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Saved Jobs
                </button>
              </div>

              <p className="text-sm text-gray-600 mb-6">
                {activeTab === 'best' && "Browse jobs that match your experience to a client's hiring preferences. Ordered by most relevant."}
                {activeTab === 'recent' && "Browse the most recently posted jobs."}
                {activeTab === 'saved' && "View your saved jobs."}
              </p>

              {/* Job Listings */}
              <div className="space-y-6">
                {jobs.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <p className="text-gray-500 mb-4">No jobs found</p>
                      <Link href="/talent/jobs">
                        <Button>Browse All Jobs</Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : (
                  jobs.map((job) => (
                    <Card key={job.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-2">
                              <span className="text-sm text-gray-500">Posted {formatTimeAgo(job.createdAt)}</span>
                            </div>
                            <Link href={`/talent/jobs/${job.id}`}>
                              <h3 className="text-xl font-semibold text-brand-purple hover:underline mb-2">
                                {job.title}
                              </h3>
                            </Link>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                              {job.salaryMin && (
                                <span>
                                  Hourly: {job.currency || '$'}{job.salaryMin}
                                  {job.salaryMax && `-${job.currency || '$'}${job.salaryMax}`}
                                </span>
                              )}
                              <span>•</span>
                              <span>Intermediate</span>
                              <span>•</span>
                              <span>Est. Time: Less than 1 month</span>
                            </div>
                            <p className="text-gray-700 mb-4 line-clamp-3">{job.description}</p>
                            <div className="flex flex-wrap gap-2 mb-4">
                              {job.skills.slice(0, 6).map((skill) => (
                                <span
                                  key={skill.id}
                                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                                >
                                  {skill.name}
                                </span>
                              ))}
                              {job.skills.length > 6 && (
                                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                                  +{job.skills.length - 6} more
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Payment verified
                              </span>
                              <span className="flex items-center gap-1">
                                ⭐ 5.0
                              </span>
                              <span>$3K+ spent</span>
                              {job.location && (
                                <span className="flex items-center gap-1">
                                  📍 {job.location}
                                </span>
                              )}
                            </div>
                            <div className="mt-2 text-sm text-gray-600">
                              Proposals: Less than 5
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 ml-4">
                            <button className="p-2 hover:bg-gray-100 rounded-full">
                              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                            <button className="p-2 hover:bg-gray-100 rounded-full">
                              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Profile Card */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-400 to-brand-purple flex items-center justify-center text-white text-2xl font-bold">
                    {profile?.firstName?.[0] || profile?.lastName?.[0] || user.email[0].toUpperCase()}
                  </div>
                  <h3 className="font-semibold text-lg mb-1">
                    {profile?.firstName && profile?.lastName
                      ? `${profile.firstName} ${profile.lastName}`
                      : user.email.split('@')[0]}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {profile?.headline || 'Complete your profile'}
                  </p>
                  {profileCompletion < 100 && (
                    <Link href="/talent/onboarding">
                      <Button variant="outline" size="sm" className="w-full mb-3">
                        Complete your profile
                      </Button>
                    </Link>
                  )}
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className="bg-brand-purple h-2 rounded-full transition-all"
                      style={{ width: `${profileCompletion}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500">{profileCompletion}% complete</p>
                </div>
              </CardContent>
            </Card>

            {/* Onboarding Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Onboarding Status</CardTitle>
              </CardHeader>
              <CardContent>
                <OnboardingStatusWidget completion={profileCompletion} />
              </CardContent>
            </Card>

            {/* Onboarding Status Card */}
            <OnboardingStatusCard completion={profileCompletion} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
