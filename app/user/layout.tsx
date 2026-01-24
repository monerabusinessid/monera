import { redirect } from 'next/navigation'
import { Metadata } from 'next'
import { getSupabaseClient } from '@/lib/supabase/server-helper'
import { getStatusMessage } from '@/lib/talent-status'
import Link from 'next/link'
import { Logo } from '@/components/logo'

export const metadata: Metadata = {
  title: 'Talent Portal - Monera',
  description: 'Complete your profile and find your next opportunity',
}

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    const supabase = await getSupabaseClient()
    
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      redirect('/login?redirect=/user/onboarding')
    }

    // Get user profile and status
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, role, status, revision_notes')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      // New user, allow access to onboarding
      return (
        <div className="min-h-screen bg-gray-50">
          <nav className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <Logo size="sm" />
              </div>
            </div>
          </nav>
          <main>{children}</main>
        </div>
      )
    }

    // Check if user is TALENT or CANDIDATE
    if (profile.role !== 'TALENT' && profile.role !== 'CANDIDATE') {
      if (profile.role === 'CLIENT' || profile.role === 'RECRUITER') {
        redirect('/client')
      } else if (['SUPER_ADMIN', 'QUALITY_ADMIN', 'SUPPORT_ADMIN', 'ANALYST', 'ADMIN'].includes(profile.role)) {
        redirect('/admin/dashboard')
      } else {
        redirect('/login?error=invalid_role')
      }
    }

    const statusInfo = getStatusMessage(profile.status as any)

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Status Banner */}
        {profile.status !== 'APPROVED' && (
          <div className={`${statusInfo.bgColor} border-b ${statusInfo.color} py-3`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{statusInfo.message}</p>
                  <p className="text-sm opacity-90">{statusInfo.description}</p>
                </div>
                <Link
                  href={profile.status === 'DRAFT' ? '/user/onboarding' : '/user/status'}
                  className="text-sm font-medium underline"
                >
                  {profile.status === 'DRAFT' ? 'Complete Profile' : 'View Status'}
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-8">
                <Logo size="sm" />
                <div className="hidden md:flex space-x-4">
                  <Link
                    href="/user/jobs"
                    className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Jobs
                  </Link>
                  <Link
                    href="/user/applications"
                    className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Applications
                  </Link>
                  <Link
                    href="/user/profile"
                    className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Profile
                  </Link>
                  {profile.status !== 'APPROVED' && (
                    <Link
                      href="/user/status"
                      className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Status
                    </Link>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">{profile.full_name || user.email}</span>
                <form action="/api/auth/logout" method="POST">
                  <button
                    type="submit"
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Logout
                  </button>
                </form>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    )
  } catch (error) {
    console.error('User layout error:', error)
    redirect('/login?error=session_expired')
  }
}
