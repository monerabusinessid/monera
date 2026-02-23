import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isAdmin, hasRouteAccess } from '@/lib/admin/rbac'
import { getAuthUser } from '@/lib/api-utils'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // If Supabase not configured, allow request to pass (for non-admin routes)
    // Admin routes will fail gracefully with better error message
    return NextResponse.next({ request })
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { pathname } = request.nextUrl
  
  // Try to get user from JWT token first (before checking public routes)
  const jwtUser = await getAuthUser(request)
  
  // Public routes that don't need authentication
  const publicRoutes = ['/', '/login', '/register', '/auth/callback', '/api/auth/login', '/api/auth/register']
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith('/api/auth/'))
  
  if (isPublicRoute) {
    // If already authenticated, redirect away from login to the correct dashboard
    if (pathname === '/login' && jwtUser) {
      if (isAdmin(jwtUser.role)) {
        return NextResponse.redirect(new URL('/admin', request.url))
      }
      if (jwtUser.role === 'CLIENT' || jwtUser.role === 'RECRUITER') {
        return NextResponse.redirect(new URL('/client', request.url))
      }
      if (jwtUser.role === 'TALENT' || jwtUser.role === 'CANDIDATE') {
        return NextResponse.redirect(new URL('/talent', request.url))
      }
    }
    return supabaseResponse
  }
  
  // Try to get user from Supabase session first
  const {
    data: { user: supabaseUser },
  } = await supabase.auth.getUser()
  
  // Logging for debugging session issues
  if (pathname.startsWith('/client') || pathname.startsWith('/auth/callback')) {
    console.log('[Middleware] Auth check for:', pathname, {
      hasSupabaseUser: !!supabaseUser,
      hasJwtUser: !!jwtUser,
      hasAuthCookie: !!request.cookies.get('auth-token'),
      cookieNames: request.cookies.getAll().map(c => c.name)
    })
  }

  // Use JWT user if available, otherwise use Supabase user
  // JWT user takes precedence because it's our primary auth method
  const user = jwtUser ? {
    id: jwtUser.id,
    email: jwtUser.email,
  } : supabaseUser

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    if (!user) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Prefer JWT user (already resolved via service role in getAuthUser)
    if (jwtUser) {
      if (!isAdmin(jwtUser.role)) {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('error', 'admin_access_required')
        return NextResponse.redirect(loginUrl)
      }
      if (jwtUser.status === 'SUSPENDED') {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('error', 'account_suspended')
        return NextResponse.redirect(loginUrl)
      }
      return supabaseResponse
    }

    // Fallback: Get user role via Supabase session
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, status')
      .eq('id', user.id)
      .single()

    if (!profile || !isAdmin(profile.role)) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('error', 'admin_access_required')
      return NextResponse.redirect(loginUrl)
    }

    if (profile.status === 'SUSPENDED') {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('error', 'account_suspended')
      return NextResponse.redirect(loginUrl)
    }

    // Check route-specific permissions
    if (!hasRouteAccess(profile.role, pathname)) {
      const dashboardUrl = new URL('/admin', request.url)
      dashboardUrl.searchParams.set('error', 'insufficient_permissions')
      return NextResponse.redirect(dashboardUrl)
    }
  }

  // Protect client routes
  // BUT: Allow access if cookie exists (even if user not parsed yet)
  // This handles OAuth callback flow where cookie is set but user not yet parsed
  // The client page itself will handle auth check with sessionStorage and cookie
  if (pathname.startsWith('/client')) {
    // Check if auth-token cookie exists (OAuth just completed)
    const hasAuthCookie = request.cookies.get('auth-token')
    
    // If no user but cookie exists, allow through
    // This handles the case where cookie is set but getAuthUser hasn't parsed it yet
    // The client page will handle the auth check with sessionStorage
    if (!user && hasAuthCookie) {
      console.log('[Middleware] Allowing /client access - auth-token cookie present but user not parsed yet')
      console.log('[Middleware] Client page will handle auth check with sessionStorage')
      return supabaseResponse
    }
    
    // Also check referer for OAuth callback (backup check)
    const referer = request.headers.get('referer')
    const isOAuthCallback = referer?.includes('/auth/callback')
    if (!user && isOAuthCallback) {
      console.log('[Middleware] Allowing /client access - coming from OAuth callback')
      return supabaseResponse
    }
    
    if (!user) {
      console.log('[Middleware] No user and no cookie, redirecting to login')
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Prefer JWT user (already resolved via service role in getAuthUser)
    if (jwtUser) {
      const role = jwtUser.role
      const status = jwtUser.status
      if (role !== 'CLIENT' && role !== 'RECRUITER') {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('error', 'client_access_required')
        return NextResponse.redirect(loginUrl)
      }
      if (status === 'SUSPENDED') {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('error', 'account_suspended')
        return NextResponse.redirect(loginUrl)
      }
      return supabaseResponse
    }

    // Fallback: Get user role via Supabase session
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, status')
      .eq('id', user.id)
      .single()

    if (!profile) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('error', 'profile_not_found')
      return NextResponse.redirect(loginUrl)
    }

    // Check if user is CLIENT or RECRUITER
    if (profile.role !== 'CLIENT' && profile.role !== 'RECRUITER') {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('error', 'client_access_required')
      return NextResponse.redirect(loginUrl)
    }

    if (profile.status === 'SUSPENDED') {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('error', 'account_suspended')
      return NextResponse.redirect(loginUrl)
    }
  }

  // Protect user (talent) routes with status-based access control
  if (pathname.startsWith('/user')) {
    if (!user) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // If we have JWT user, use role from JWT (more reliable)
    let userRole: string | null = null
    let userStatus: string | null = null
    
    if (jwtUser) {
      userRole = jwtUser.role
      userStatus = jwtUser.status || 'DRAFT'
    } else {
      // Fallback: Get user profile and status from Supabase
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, status')
        .eq('id', user.id)
        .single()

      if (profile) {
        userRole = profile.role
        userStatus = profile.status
      }
    }

    if (!userRole) {
      // New user, redirect to onboarding
      if (pathname !== '/user/onboarding') {
        return NextResponse.redirect(new URL('/user/onboarding', request.url))
      }
      return supabaseResponse
    }

    // Check if user is TALENT or CANDIDATE
    if (userRole !== 'TALENT' && userRole !== 'CANDIDATE') {
      // Not a talent user, redirect based on role
      if (userRole === 'CLIENT' || userRole === 'RECRUITER') {
        return NextResponse.redirect(new URL('/client', request.url))
      } else if (isAdmin(userRole)) {
        return NextResponse.redirect(new URL('/admin', request.url))
      } else {
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('error', 'invalid_role')
        return NextResponse.redirect(loginUrl)
      }
    }

    // Status-based route gating
    const profileStatus = userStatus || 'DRAFT'
    const isApproved = profileStatus === 'APPROVED'
    
    // Routes that require APPROVED status
    const lockedRoutes = ['/user/jobs', '/user/apply']
    const isLockedRoute = lockedRoutes.some(route => pathname.startsWith(route))

    if (isLockedRoute && !isApproved) {
      // Redirect to status page if trying to access locked routes
      return NextResponse.redirect(new URL('/user/status', request.url))
    }

    // Allow access to onboarding, profile, status, and applications pages regardless of status
    const allowedRoutes = ['/user/onboarding', '/user/profile', '/user/status', '/user/applications']
    const isAllowedRoute = allowedRoutes.some(route => pathname.startsWith(route))

    if (!isAllowedRoute && !isApproved) {
      // For other routes, redirect based on status
      if (profileStatus === 'DRAFT') {
        return NextResponse.redirect(new URL('/user/onboarding', request.url))
      } else {
        return NextResponse.redirect(new URL('/user/status', request.url))
      }
    }
  }

  return supabaseResponse
}
