'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import CandidateDashboard from '@/components/dashboard/candidate-dashboard'
import RecruiterDashboard from '@/components/dashboard/recruiter-dashboard'

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
      return
    }

    // Redirect admin roles to admin dashboard
    if (user && (user.role === 'SUPER_ADMIN' || user.role === 'QUALITY_ADMIN' || user.role === 'SUPPORT_ADMIN' || user.role === 'ANALYST' || user.role === 'ADMIN')) {
      router.push('/admin/dashboard')
      return
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

  // Redirect admin roles (should not reach here, but just in case)
  if (user.role === 'SUPER_ADMIN' || user.role === 'QUALITY_ADMIN' || user.role === 'SUPPORT_ADMIN' || user.role === 'ANALYST' || user.role === 'ADMIN') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Redirecting to admin dashboard...</div>
      </div>
    )
  }

  // Redirect CLIENT to client dashboard
  if (user.role === 'CLIENT') {
    router.push('/client')
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Redirecting to client dashboard...</div>
      </div>
    )
  }

  if (user.role === 'CANDIDATE' || user.role === 'TALENT') {
    return <CandidateDashboard />
  }

  if (user.role === 'RECRUITER') {
    return <RecruiterDashboard />
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">Unknown user role: {user.role}</div>
    </div>
  )
}
