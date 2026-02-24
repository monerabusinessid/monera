'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getStatusMessage } from '@/lib/talent-status'
import Link from 'next/link'
export const runtime = 'edge'

interface ProfileStatus {
  status: string
  revisionNotes?: string | null
  submittedAt?: string | null
}

export default function StatusPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<ProfileStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/user/profile', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setProfile({
            status: data.data.status,
            revisionNotes: data.data.revisionNotes,
            submittedAt: data.data.submittedAt,
          })
        }
      })
      .catch(err => console.error('Failed to fetch status:', err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-gray-600">Profile not found. Please complete onboarding.</p>
          <Link href="/user/onboarding">
            <Button className="mt-4">Go to Onboarding</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  const statusInfo = getStatusMessage(profile.status as any)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Status</CardTitle>
          <CardDescription>Your profile review status</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Badge */}
          <div className={`${statusInfo.bgColor} ${statusInfo.color} p-4 rounded-lg`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-lg">{statusInfo.message}</p>
                <p className="text-sm mt-1 opacity-90">{statusInfo.description}</p>
              </div>
              <div className="text-4xl">
                {profile.status === 'APPROVED' && '✅'}
                {profile.status === 'SUBMITTED' && '⏳'}
                {profile.status === 'NEED_REVISION' && '⚠️'}
                {profile.status === 'REJECTED' && '❌'}
                {profile.status === 'DRAFT' && '📝'}
              </div>
            </div>
          </div>

          {/* Submitted Date */}
          {profile.submittedAt && (
            <div className="text-sm text-gray-600">
              <p>Submitted: {new Date(profile.submittedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric' })}</p>
            </div>
          )}

          {/* Revision Notes */}
          {profile.status === 'NEED_REVISION' && profile.revisionNotes && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-900 mb-2">Revision Notes</h3>
              <p className="text-yellow-800 whitespace-pre-wrap">{profile.revisionNotes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            {profile.status === 'DRAFT' && (
              <Link href="/user/onboarding">
                <Button>Complete Profile</Button>
              </Link>
            )}
            {profile.status === 'NEED_REVISION' && (
              <>
                <Link href="/user/profile">
                  <Button>Edit Profile</Button>
                </Link>
                <Link href="/user/onboarding">
                  <Button variant="outline">Review Onboarding</Button>
                </Link>
              </>
            )}
            {profile.status === 'APPROVED' && (
              <Link href="/user/jobs">
                <Button>Browse Jobs</Button>
              </Link>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
