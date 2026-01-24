'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getStatusMessage } from '@/lib/talent-status'

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

export default function TalentPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [profileStatus, setProfileStatus] = useState<ProfileStatus | null>(null)
  const [loadingProfile, setLoadingProfile] = useState(false)
  const [jobMatches, setJobMatches] = useState<Job[]>([])
  const [loadingJobs, setLoadingJobs] = useState(false)
  const hasFetchedProfile = useRef(false)
  const redirectAttempted = useRef(false)

  const fetchProfileStatus = useCallback(async () => {
    setLoadingProfile(true)
    
    try {
      // Add cache busting to ensure fresh data
      const profileResponse = await fetch('/api/user/profile?' + new Date().getTime(), {
        credentials: 'include',
        cache: 'no-store',
      })

      if (profileResponse.ok) {
        const profileData = await profileResponse.json()

        if (profileData.success && profileData.data) {
          const profile = profileData.data
          const status = profile.status || 'DRAFT'
          
          console.log('📊 Profile status fetched:', {
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

          // Note: Redirect to onboarding is handled by useEffect below
          // Don't redirect here to avoid race conditions

          // Fetch matched jobs if status is SUBMITTED or APPROVED
          // (user has completed onboarding and submitted profile)
          if (status === 'SUBMITTED' || status === 'APPROVED') {
            fetchJobMatches()
          }
        } else {
          console.warn('⚠️ Profile data not found or invalid:', profileData)
        }
      } else {
        console.error('❌ Failed to fetch profile:', profileResponse.status, profileResponse.statusText)
      }
    } catch (error) {
      console.error('❌ Error fetching profile status:', error)
      setProfileStatus({
        status: 'DRAFT',
        profileCompletion: 0,
        isProfileReady: false,
        skills: [],
      })
      // If profile fetch fails, set status to DRAFT which will trigger redirect
    } finally {
      setLoadingProfile(false)
    }
  }, [fetchJobMatches])

  const fetchJobMatches = useCallback(async () => {
    setLoadingJobs(true)
    try {
      const response = await fetch('/api/jobs/matched', {
        credentials: 'include',
        cache: 'no-store', // Always fetch fresh data
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

  useEffect(() => {
    if (loading) return

    if (user && user.role === 'TALENT') {
      if (!hasFetchedProfile.current) {
        hasFetchedProfile.current = true
        fetchProfileStatus()
      }
    } else if (!loading && user && user.role !== 'TALENT') {
      if (!redirectAttempted.current) {
        redirectAttempted.current = true
        if (user.role === 'CLIENT') {
          router.push('/client')
        } else if (['SUPER_ADMIN', 'QUALITY_ADMIN', 'SUPPORT_ADMIN', 'ANALYST', 'ADMIN'].includes(user.role)) {
          router.push('/admin/dashboard')
        } else {
          router.push('/login')
        }
      }
    } else if (!loading && !user) {
      if (!redirectAttempted.current) {
        redirectAttempted.current = true
        router.push('/login')
      }
    }
  }, [user, loading, router, fetchProfileStatus])

  // Redirect to onboarding only if profile status is DRAFT
  useEffect(() => {
    if (profileStatus && profileStatus.status === 'DRAFT') {
      console.log('📝 Redirecting to onboarding due to DRAFT status')
      router.push('/talent/onboarding')
    }
  }, [profileStatus, router])

  if (loading || loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 pt-24">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-purple"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render if redirecting to onboarding
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

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome{profileStatus?.fullName ? `, ${profileStatus.fullName}` : ''}!
          </h1>
          <p className="text-gray-600">Here are jobs matched with your skills</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Job Matches */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Job Matches</h2>
              <Link href="/talent/jobs">
                <Button variant="outline" size="sm">View All Jobs</Button>
              </Link>
            </div>
            
            {loadingJobs ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-brand-purple"></div>
                <p className="mt-2 text-gray-600">Loading job matches...</p>
              </div>
            ) : jobMatches.length > 0 ? (
              <div className="space-y-4">
                {jobMatches.map((job) => (
                  <Card key={job.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-transparent hover:border-l-brand-purple">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <Link href={`/talent/jobs/${job.id}`}>
                            <h3 className="text-lg font-semibold text-gray-900 hover:text-brand-purple transition-colors mb-2">
                              {job.title}
                            </h3>
                          </Link>
                          <div className="flex items-center gap-3 text-sm text-gray-600 mb-3 flex-wrap">
                            <span className="font-medium text-gray-900">
                              {job.company?.name || job.recruiter?.name || job.recruiter?.email || 'No company'}
                            </span>
                            {job.location && job.location.toLowerCase() !== 'remote' && (
                              <>
                                <span className="text-gray-400">•</span>
                                <span>{job.location}</span>
                              </>
                            )}
                            {job.remote && (
                              <>
                                <span className="text-gray-400">•</span>
                                <span className="text-green-600 font-medium">🌍 Remote</span>
                              </>
                            )}
                          </div>
                          <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>
                          {job.skills.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {job.skills.slice(0, 5).map((skill) => (
                                <span
                                  key={skill.id}
                                  className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium"
                                >
                                  {skill.name}
                                </span>
                              ))}
                              {job.skills.length > 5 && (
                                <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
                                  +{job.skills.length - 5} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        {job.salaryMin && (
                          <div className="text-right ml-4 flex-shrink-0">
                            <div className="text-lg font-bold text-brand-purple">
                              {job.currency || '$'}{job.salaryMin.toLocaleString()}
                              {job.salaryMax && ` - ${job.currency || '$'}${job.salaryMax.toLocaleString()}`}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">/hour</div>
                          </div>
                        )}
                      </div>
                      <Link href={`/talent/jobs/${job.id}`}>
                        <Button className="w-full bg-brand-purple hover:bg-purple-700">View Details</Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : profileStatus && profileStatus.skills.length === 0 ? (
              <Card className="border-2">
                <CardContent className="py-12 text-center">
                  <div className="text-4xl mb-4">🎯</div>
                  <p className="text-gray-600 mb-2 text-lg font-semibold">No skills added yet</p>
                  <p className="text-gray-500 mb-4 text-sm">Add your skills to see job matches</p>
                  <Link href="/talent/profile">
                    <Button className="bg-brand-purple hover:bg-purple-700">Add Skills to Profile</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-2">
                <CardContent className="py-12 text-center">
                  <div className="text-4xl mb-4">🔍</div>
                  <p className="text-gray-600 mb-4 text-lg">No job matches found at the moment</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right: Profile Status */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 border-2">
              <CardHeader className="bg-gradient-to-r from-brand-purple to-purple-700 text-white rounded-t-lg">
                <CardTitle className="text-lg">Profile Status</CardTitle>
                <CardDescription className="text-purple-100">Your profile review status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                {profileStatus && statusInfo ? (
                  <>
                    {/* Status Badge */}
                    <div className={`${statusInfo.bgColor} ${statusInfo.color} p-4 rounded-lg border-2 border-current border-opacity-20`}>
                      <div className="flex items-start gap-3">
                        <div className="text-2xl flex-shrink-0">
                          {profileStatus.status === 'APPROVED' && '✅'}
                          {profileStatus.status === 'SUBMITTED' && '⏳'}
                          {profileStatus.status === 'NEED_REVISION' && '⚠️'}
                          {profileStatus.status === 'REJECTED' && '❌'}
                          {profileStatus.status === 'DRAFT' && '📝'}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-base mb-1">{statusInfo.message}</p>
                          <p className="text-sm opacity-90 leading-relaxed">{statusInfo.description}</p>
                        </div>
                      </div>
                    </div>

                    {/* Profile Completion */}
                    {profileStatus.profileCompletion > 0 && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Profile Completion</span>
                          <span className="font-semibold text-gray-900">{profileStatus.profileCompletion}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-brand-purple h-2 rounded-full transition-all duration-300"
                            style={{ width: `${profileStatus.profileCompletion}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Skills Count */}
                    {profileStatus.skills.length > 0 && (
                      <div className="bg-gray-50 p-3 rounded-lg border">
                        <p className="text-sm text-gray-600 mb-1">Your Skills</p>
                        <p className="text-lg font-semibold text-gray-900">{profileStatus.skills.length} skill{profileStatus.skills.length !== 1 ? 's' : ''} added</p>
                      </div>
                    )}

                    {/* Submitted Date */}
                    {profileStatus.submittedAt && (
                      <div className="text-sm text-gray-600 pt-2 border-t">
                        <p className="font-medium mb-1">Submitted on:</p>
                        <p>{new Date(profileStatus.submittedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      </div>
                    )}

                    {/* Revision Notes */}
                    {profileStatus.status === 'NEED_REVISION' && profileStatus.revisionNotes && (
                      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                        <h3 className="font-semibold text-yellow-900 mb-2 text-sm">Revision Notes</h3>
                        <p className="text-yellow-800 whitespace-pre-wrap text-sm leading-relaxed">{profileStatus.revisionNotes}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col gap-2 pt-2">
                      {profileStatus.status === 'DRAFT' && (
                        <Link href="/talent/profile">
                          <Button className="w-full bg-brand-purple hover:bg-purple-700">Complete Profile</Button>
                        </Link>
                      )}
                      {profileStatus.status === 'SUBMITTED' && null}
                      {profileStatus.status === 'NEED_REVISION' && (
                        <>
                          <Link href="/talent/profile">
                            <Button className="w-full bg-brand-purple hover:bg-purple-700">Edit Profile</Button>
                          </Link>
                        </>
                      )}
                      {profileStatus.status === 'APPROVED' && null}
                      <Link href="/talent/profile">
                        <Button variant="outline" className="w-full">View Profile</Button>
                      </Link>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">👤</div>
                    <p className="text-gray-600 mb-4">Loading profile status...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
