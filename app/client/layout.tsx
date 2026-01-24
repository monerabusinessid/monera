import { redirect } from 'next/navigation'
import { Metadata } from 'next'
import { ClientNav } from '@/components/client/client-nav'
import { cookies } from 'next/headers'

export const metadata: Metadata = {
  title: 'Your Dashboard - Monera',
  description: 'Manage your jobs and find the best talent',
}

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    // Check JWT cookie first (our primary auth method)
    // This handles OAuth flow where cookie is set but Supabase session might not be
    const cookieStore = await cookies()
    const authToken = cookieStore.get('auth-token')?.value
    
    // Create a mock request for getAuthUser (it needs NextRequest)
    // We'll check cookie directly instead
    let jwtUser = null
    if (authToken) {
      try {
        const { getUserFromToken } = await import('@/lib/auth')
        jwtUser = await getUserFromToken(authToken)
        console.log('[Client Layout] JWT user found:', jwtUser ? { id: jwtUser.id, role: jwtUser.role } : 'none')
      } catch (e) {
        console.warn('[Client Layout] Error parsing JWT token:', e)
      }
    }
    
    // Also check Supabase session (for backward compatibility)
    const { getSupabaseClient } = await import('@/lib/supabase/server-helper')
    const supabase = await getSupabaseClient()
    
    const {
      data: { user: supabaseUser },
      error: userError,
    } = await supabase.auth.getUser()

    // Use JWT user if available, otherwise use Supabase user
    const user = jwtUser ? {
      id: jwtUser.id,
      email: jwtUser.email || '',
    } : supabaseUser

    // If no user from either source, check if cookie exists (OAuth just completed)
    // In this case, allow access - client page will handle auth check with sessionStorage
    if (!user && !authToken) {
      console.log('[Client Layout] No user and no auth cookie, redirecting to login')
      redirect('/login?redirect=/client')
    }
    
    // If we have cookie but no user yet (OAuth flow), allow access
    // Client page will handle auth check with sessionStorage
    if (!user && authToken) {
      console.log('[Client Layout] Auth cookie present but user not parsed yet - allowing access')
      console.log('[Client Layout] Client page will handle auth check with sessionStorage')
      // Return layout without user check - let client page handle it
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-gray-50">
          <ClientNav 
            userName="Loading..." 
            userEmail=""
          />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </div>
      )
    }

    // Get user profile and role
    // Use JWT user data if available, otherwise fetch from Supabase
    let profile: any = null
    let userRole: string | null = null
    let userStatus: string | null = null
    let userName: string | null = null
    
    if (jwtUser) {
      // Use data from JWT token (already includes role, status, name)
      userRole = jwtUser.role
      userStatus = jwtUser.status || 'ACTIVE'
      userName = jwtUser.name || null
      console.log('[Client Layout] Using JWT user data:', { role: userRole, status: userStatus })
    } else {
      // Fallback: fetch from Supabase
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('role, status, full_name')
        .eq('id', user!.id)
        .single()

      if (profileError || !profileData) {
        console.log('[Client Layout] Profile not found, but allowing access for OAuth flow', profileError)
        // Don't redirect - let client page handle it
        // This handles the case where profile is being created
        return (
          <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-gray-50">
            <ClientNav 
              userName="Loading..." 
              userEmail={user?.email || ''}
            />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>
          </div>
        )
      }
      
      profile = profileData
      userRole = profile.role
      userStatus = profile.status
      userName = profile.full_name
    }

    // Check if user is CLIENT or RECRUITER
    if (userRole !== 'CLIENT' && userRole !== 'RECRUITER') {
      console.log('[Client Layout] User role is not CLIENT or RECRUITER:', userRole)
      redirect('/?error=client_access_required')
    }

    if (userStatus === 'SUSPENDED') {
      redirect('/?error=account_suspended')
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-gray-50">
        <ClientNav 
          userName={userName || user?.email || 'Client'} 
          userEmail={user?.email}
        />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    )
  } catch (error) {
    console.error('[Client Layout] Error:', error)
    // Don't redirect with session_expired - let middleware and client page handle it
    // This prevents false session_expired errors during OAuth flow
    console.log('[Client Layout] Allowing access despite error - client page will handle auth check')
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-gray-50">
        <ClientNav 
          userName="Loading..." 
          userEmail=""
        />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    )
  }
}

