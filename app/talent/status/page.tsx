'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getStatusMessage } from '@/lib/talent-status'
import Link from 'next/link'
import { Footer } from '@/components/footer'

interface ProfileStatus {
  status: string
  revisionNotes?: string | null
  submittedAt?: string | null
  profileCompletion?: number
}

export default function TalentStatusPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<ProfileStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/user/profile', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setProfile({
            status: data.data.status || 'DRAFT',
            revisionNotes: data.data.revisionNotes,
            submittedAt: data.data.submittedAt,
            profileCompletion: data.data.profileCompletion || 0,
          })
        }
      })
      .catch(err => console.error('Failed to fetch status:', err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-12 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-purple"></div>
          <p className="mt-4 text-gray-600">Loading your profile status...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="max-w-3xl mx-auto px-4">
          <Card className="border-2">
            <CardContent className="py-12 text-center">
              <p className="text-gray-600 mb-4 text-lg">Profile not found. Please complete your onboarding.</p>
              <Link href="/talent/onboarding">
                <Button className="bg-brand-purple hover:bg-purple-700">Go to Onboarding</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const statusInfo = getStatusMessage(profile.status as any)

  return (
    <>
      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="max-w-3xl mx-auto px-4 space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Status</h1>
          <p className="text-gray-600">Track your profile review progress</p>
        </div>

        <Card className="border-2 shadow-lg">
          <CardHeader>
            <CardTitle>Your Profile Review Status</CardTitle>
            <CardDescription>Current status of your talent profile submission</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status Badge */}
            <div className={`${statusInfo.bgColor} ${statusInfo.color} p-6 rounded-lg border-2 border-current border-opacity-20`}>
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-white/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                  {profile.status.replace('_', ' ')}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-xl mb-2">{statusInfo.message}</p>
                  <p className="text-sm opacity-90 leading-relaxed">{statusInfo.description}</p>
                </div>
              </div>
            </div>

            {/* Profile Completion */}
            {profile.profileCompletion !== undefined && profile.profileCompletion > 0 && (
              <div className="space-y-2 pt-4 border-t">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 font-medium">Profile Completion</span>
                  <span className="font-semibold text-gray-900">{profile.profileCompletion}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-brand-purple h-3 rounded-full transition-all duration-500"
                    style={{ width: `${profile.profileCompletion}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Submitted Date */}
            {profile.submittedAt && (
              <div className="bg-gray-50 p-4 rounded-lg border">
                <p className="text-sm text-gray-600 mb-1 font-medium">Submitted on:</p>
                <p className="text-base font-semibold text-gray-900">
                  {new Date(profile.submittedAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            )}

            {/* Revision Notes */}
            {profile.status === 'NEED_REVISION' && profile.revisionNotes && (
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-5">
                <div className="flex items-start gap-2 mb-3">
                  <span className="text-xs font-semibold uppercase tracking-wide text-yellow-700">Note</span>
                  <h3 className="font-semibold text-yellow-900 text-lg">Revision Notes from Admin</h3>
                </div>
                <p className="text-yellow-800 whitespace-pre-wrap leading-relaxed text-sm">
                  {profile.revisionNotes}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              {profile.status === 'DRAFT' && (
                <Link href="/talent/onboarding" className="flex-1">
                  <Button className="w-full bg-brand-purple hover:bg-purple-700" size="lg">
                    Complete Your Profile
                  </Button>
                </Link>
              )}
              {profile.status === 'SUBMITTED' && (
                <>
                  <Link href="/talent/jobs" className="flex-1">
                    <Button className="w-full bg-brand-purple hover:bg-purple-700" size="lg">
                      Browse Jobs
                    </Button>
                  </Link>
                  <Link href="/talent" className="flex-1">
                    <Button variant="outline" className="w-full" size="lg">
                      Go to Dashboard
                    </Button>
                  </Link>
                </>
              )}
              {profile.status === 'NEED_REVISION' && (
                <>
                  <Link href="/talent/profile" className="flex-1">
                    <Button className="w-full bg-brand-purple hover:bg-purple-700" size="lg">
                      Edit Profile
                    </Button>
                  </Link>
                  <Link href="/talent/onboarding" className="flex-1">
                    <Button variant="outline" className="w-full" size="lg">
                      Review Onboarding
                    </Button>
                  </Link>
                </>
              )}
              {profile.status === 'APPROVED' && (
                <>
                  <Link href="/talent/jobs" className="flex-1">
                    <Button className="w-full bg-green-600 hover:bg-green-700" size="lg">
                      Browse Jobs
                    </Button>
                  </Link>
                  <Link href="/talent" className="flex-1">
                    <Button variant="outline" className="w-full" size="lg">
                      Go to Dashboard
                    </Button>
                  </Link>
                </>
              )}
              {profile.status === 'REJECTED' && (
                <div className="w-full text-center py-4">
                  <p className="text-gray-600 mb-4">Your profile was not approved. Please contact support for more information.</p>
                  <Link href="/talent/onboarding">
                    <Button variant="outline" size="lg">
                      Try Again
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
      <Footer />
    </>
  )
}

