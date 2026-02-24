'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
export const runtime = 'edge'

interface Job {
  id: string
  title: string
  status: string
  createdAt: string
  publishedAt: string | null
  company: {
    name: string
  } | null
  applicationCount?: number
}

interface Application {
  id: string
  status: string
  createdAt: string
  job: {
    id: string
    title: string
  }
  talent: {
    id: string
    full_name: string | null
    email?: string
  } | null
}

export default function ClientDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    draftJobs: 0,
    totalApplications: 0,
    pendingApplications: 0,
    shortlistedApplications: 0,
    acceptedApplications: 0,
  })
  const [loadingData, setLoadingData] = useState(true)
  const [lastFetch, setLastFetch] = useState(Date.now())
  const redirectAttempted = useRef(false)
  const checkedClientOnboarding = useRef(false)
  const authRecheckAttempted = useRef(false)
  const authConfirmed = useRef(false)

  // Fetch data function
  const fetchData = useCallback(async () => {
    try {
      // Fetch jobs and applications
      const [jobsRes, appsRes] = await Promise.all([
        fetch('/api/jobs?recruiterId=me', {
          credentials: 'include',
        }),
        fetch('/api/applications?recruiterId=me&limit=20', {
          credentials: 'include',
        }),
      ])

      const jobsData = await jobsRes.json()
      const appsData = await appsRes.json()

      if (jobsData.success) {
        const jobsList = jobsData.data.jobs || []
        setJobs(jobsList)
        
        // Calculate stats
        const activeJobs = jobsList.filter((j: Job) => j.status === 'PUBLISHED').length
        const draftJobs = jobsList.filter((j: Job) => j.status === 'DRAFT').length
        
        setStats(prev => ({
          ...prev,
          totalJobs: jobsList.length,
          activeJobs,
          draftJobs,
        }))
      }

      if (appsData.success) {
        const appsList = appsData.data.applications || []
        setApplications(appsList)
        
        // Calculate application stats
        const pending = appsList.filter((a: Application) => a.status === 'PENDING').length
        const shortlisted = appsList.filter((a: Application) => a.status === 'SHORTLISTED').length
        const accepted = appsList.filter((a: Application) => a.status === 'ACCEPTED').length
        
        setStats(prev => ({
          ...prev,
          totalApplications: appsList.length,
          pendingApplications: pending,
          shortlistedApplications: shortlisted,
          acceptedApplications: accepted,
        }))
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoadingData(false)
      setLastFetch(Date.now())
    }
  }, [])

  // Set page title
  useEffect(() => {
    document.title = 'Your Dashboard - Monera'
  }, [])

  // Auth check - wait for auth to finish loading before checking
  // This prevents redirect to login when auth context is still loading
  // Same pattern as talent onboarding page
  useEffect(() => {
    let mounted = true

    const checkAuth = async () => {
      // If auth is still loading, fetch directly from API (same as talent onboarding)
      if (loading) {
        await new Promise(resolve => setTimeout(resolve, 500))
        
        if (!mounted) return

        try {
          const meRes = await fetch('/api/auth/me', { credentials: 'include' })
          const meData = await meRes.json()
          
          if (meData.success && meData.data) {
            const currentUser = meData.data
            if (currentUser.role !== 'CLIENT') {
              if (!redirectAttempted.current) {
                redirectAttempted.current = true
                if (currentUser.role === 'TALENT') {
                  router.push('/talent')
                } else if (['SUPER_ADMIN', 'QUALITY_ADMIN', 'SUPPORT_ADMIN', 'ANALYST', 'ADMIN'].includes(currentUser.role)) {
                  router.push('/admin')
                } else {
                  router.push('/login')
                }
              }
              return
            }
            // User is CLIENT, proceed - data will be fetched by other useEffect
            return
          } else {
            // No user data from API, check sessionStorage before redirecting
            // This handles the case where OAuth callback just set sessionStorage
            // but auth context hasn't processed it yet
            console.log('[Client] No user from API, checking sessionStorage...')
            try {
              const oauthUserStr = sessionStorage.getItem('oauth_user')
              if (oauthUserStr) {
                console.log('[Client] ✅ Found user in sessionStorage, waiting for auth context to process...')
                // Wait a bit more for auth context to process sessionStorage
                setTimeout(() => {
                  if (!mounted) return
                  // Check again if user is now available from auth context
                  // If still no user, then redirect
                  if (!user) {
                    console.log('[Client] Still no user after sessionStorage check, redirecting to login')
                    router.push('/login')
                  } else {
                    console.log('[Client] User found after sessionStorage check, proceeding')
                  }
                }, 3000) // Increased delay to allow auth context to process
                return
              }
            } catch (e) {
              console.warn('[Client] Error checking sessionStorage:', e)
            }
            
            // No user data and no sessionStorage, wait a bit more then redirect
            if (!redirectAttempted.current) {
              redirectAttempted.current = true
              setTimeout(() => {
                if (!mounted) return
                router.push('/login')
              }, 3000) // Increased delay
            }
            return
          }
        } catch (err) {
          console.error('[Client] Error checking auth:', err)
          if (!redirectAttempted.current) {
            redirectAttempted.current = true
            setTimeout(() => {
              if (!mounted) return
              router.push('/login')
            }, 2000)
          }
          return
        }
      }

      // Auth context finished loading
      if (!loading) {
        // Check if user is authenticated and has CLIENT role
        if (user && user.role === 'CLIENT') {
          // User is authenticated as CLIENT, proceed to dashboard
          // Data will be fetched by the other useEffect
        } else if (user && user.role !== 'CLIENT') {
          // User is authenticated but not CLIENT, redirect to appropriate page
          if (!redirectAttempted.current) {
            redirectAttempted.current = true
            if (user.role === 'TALENT') {
              router.push('/talent')
            } else if (['SUPER_ADMIN', 'QUALITY_ADMIN', 'SUPPORT_ADMIN', 'ANALYST', 'ADMIN'].includes(user.role)) {
              router.push('/admin')
            } else {
              router.push('/login')
            }
          }
        } else if (!user) {
          // User is not authenticated, redirect to login
          // But wait a bit more to ensure sessionStorage user is loaded (from OAuth callback)
          if (!authRecheckAttempted.current) {
            authRecheckAttempted.current = true
            try {
              const meRes = await fetch('/api/auth/me', { credentials: 'include' })
              const meData = await meRes.json()
              if (meData?.success && (meData?.data?.role === 'CLIENT' || meData?.data?.role === 'RECRUITER')) {
                authConfirmed.current = true
                return
              }
            } catch (err) {
              console.warn('[Client] Auth recheck failed:', err)
            }
          }
          if (authConfirmed.current) {
            return
          }
          if (!redirectAttempted.current) {
            redirectAttempted.current = true
            // Give auth context more time to check sessionStorage (OAuth callback stores user there)
            setTimeout(() => {
              if (!mounted) return
              router.push('/login?redirect=/client')
            }, 2000)
          }
        }
      }
    }

    checkAuth()

    return () => {
      mounted = false
    }
  }, [user, loading, router])

  // Initial fetch and auto-refresh (only if user is authenticated)
  useEffect(() => {
    if (!user || user.role !== 'CLIENT' || loading) {
      return
    }

    fetchData()
    
    // Auto-refresh every 30 seconds to get latest data
    const interval = setInterval(() => {
      fetchData()
    }, 30000) // 30 seconds

    // Refresh when window regains focus (user comes back to tab)
    const handleFocus = () => {
      fetchData()
    }
    window.addEventListener('focus', handleFocus)

    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', handleFocus)
    }
  }, [user, loading, fetchData])

  // Refresh function that can be called manually
  const refreshData = useCallback(() => {
    setLoadingData(true)
    fetchData()
  }, [fetchData])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-green-100 text-green-700'
      case 'DRAFT':
        return 'bg-gray-100 text-gray-700'
      case 'CLOSED':
        return 'bg-red-100 text-red-700'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700'
      case 'SHORTLISTED':
        return 'bg-blue-100 text-blue-700'
      case 'ACCEPTED':
        return 'bg-green-100 text-green-700'
      case 'REJECTED':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  // Show loading state while auth is loading or data is fetching
  if (loading || (loadingData && user && user.role === 'CLIENT') || (!user && authConfirmed.current)) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-purple"></div>
        <p className="mt-4 text-gray-600">Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-2xl shadow-lg p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Welcome back! 👋</h1>
            <p className="text-purple-100 text-lg">Manage your jobs and find the best talent for your team</p>
          </div>
          <div className="flex items-center gap-3">
            {lastFetch > 0 && (
              <span className="text-sm text-purple-100 hidden md:block">
                Last updated: {new Date(lastFetch).toLocaleTimeString()}
              </span>
            )}
            <Button
              onClick={refreshData}
              variant="secondary"
              size="sm"
              disabled={loadingData}
              className="flex items-center gap-2 bg-white text-purple-600 hover:bg-purple-50"
            >
              <svg 
                className={`w-4 h-4 ${loadingData ? 'animate-spin' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {loadingData ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-purple-50 to-white">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Total Jobs</CardTitle>
              <span className="text-2xl">💼</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-purple-600 mb-1">{stats.totalJobs}</div>
            <p className="text-xs text-gray-500">
              {stats.activeJobs} active • {stats.draftJobs} draft
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-green-50 to-white">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Active Jobs</CardTitle>
              <span className="text-2xl">✅</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-600 mb-1">{stats.activeJobs}</div>
            <p className="text-xs text-gray-500">Currently published</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-blue-50 to-white">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Applications</CardTitle>
              <span className="text-2xl">📝</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-600 mb-1">{stats.totalApplications}</div>
            <p className="text-xs text-gray-500">
              {stats.pendingApplications} pending review
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-yellow-50 to-white">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Shortlisted</CardTitle>
              <span className="text-2xl">⭐</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-yellow-600 mb-1">{stats.shortlistedApplications}</div>
            <p className="text-xs text-gray-500">Top candidates</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* My Jobs */}
        <Card className="border-0 shadow-md">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-transparent border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-gray-900">My Jobs</CardTitle>
                <CardDescription className="mt-1">Manage your job postings</CardDescription>
              </div>
              <Link href="/client/jobs">
                <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700">
                  View All →
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {jobs.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-3xl">💼</span>
                  </div>
                  <p className="text-gray-600 font-medium mb-2">No jobs posted yet</p>
                  <p className="text-sm text-gray-500 mb-6">Start by posting your first job opening</p>
                  <Link href="/client/post-job">
                    <Button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-md">
                      Post Your First Job
                    </Button>
                  </Link>
                </div>
              ) : (
                jobs.slice(0, 5).map((job) => (
                  <Link key={job.id} href={`/jobs/${job.id}`}>
                    <div className="border border-gray-200 rounded-xl p-4 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer group">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                            {job.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                            <span>{job.company?.name || 'No company'}</span>
                            <span>•</span>
                            <span>{formatDate(job.createdAt)}</span>
                          </p>
                          {job.applicationCount !== undefined && (
                            <p className="text-xs text-purple-600 font-medium mt-2">
                              {job.applicationCount} application{job.applicationCount !== 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(job.status)}`}>
                          {job.status}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Applications */}
        <Card className="border-0 shadow-md">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-transparent border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-gray-900">Recent Applications</CardTitle>
                <CardDescription className="mt-1">New candidate applications</CardDescription>
              </div>
              <Link href="/client/applications">
                <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                  View All →
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {applications.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <span className="text-3xl">📝</span>
                  </div>
                  <p className="text-gray-600 font-medium mb-2">No applications yet</p>
                  <p className="text-sm text-gray-500">
                    Applications will appear here when candidates apply to your jobs
                  </p>
                </div>
              ) : (
                applications.slice(0, 5).map((app) => (
                  <Link key={app.id} href={`/jobs/${app.job.id}`}>
                    <div className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {app.job.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {app.talent?.full_name || app.talent?.email || 'Unknown Talent'}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Applied {formatDate(app.createdAt)}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(app.status)}`}>
                          {app.status}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
