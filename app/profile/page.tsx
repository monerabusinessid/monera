'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import CandidateProfilePage from '@/components/profile/candidate-profile'
import RecruiterProfilePage from '@/components/profile/recruiter-profile'

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (user.role === 'TALENT') {
    return <CandidateProfilePage />
  }

  const allowedRecruiterRoles = ['RECRUITER', 'SUPER_ADMIN', 'QUALITY_ADMIN', 'SUPPORT_ADMIN', 'ANALYST', 'ADMIN']
  if (allowedRecruiterRoles.includes(user.role)) {
    return <RecruiterProfilePage />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">Unknown user role</div>
    </div>
  )
}
