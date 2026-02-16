'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  role: 'TALENT' | 'CLIENT' | 'SUPER_ADMIN' | 'QUALITY_ADMIN' | 'SUPPORT_ADMIN' | 'ANALYST' | 'ADMIN'
  talentProfile?: any
  recruiterProfile?: any
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<{
    success: boolean
    user?: User
    requiresVerification?: boolean
    email?: string
    error?: string
  }>
  register: (email: string, password: string, role: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false)

  useEffect(() => {
    console.log('[Auth] useEffect triggered', { hasCheckedAuth, loading, hasUser: !!user })
    
    // Check for OAuth user data in sessionStorage (from OAuth callback)
    if (!hasCheckedAuth && typeof window !== 'undefined') {
      try {
        console.log('[Auth] Checking sessionStorage for oauth_user...')
        const oauthUserStr = sessionStorage.getItem('oauth_user')
        
        if (oauthUserStr) {
          console.log('[Auth] ✅ Found OAuth user in sessionStorage')
          const oauthUser = JSON.parse(oauthUserStr)
          
          setUser(oauthUser)
          setHasCheckedAuth(true)
          setLoading(false)
          
          sessionStorage.removeItem('oauth_user')
          
          // Fetch latest data in background
          fetchUser().catch((err) => {
            console.warn('[Auth] ⚠️ Failed to fetch user after OAuth:', err)
          })
          return
        }
      } catch (e) {
        console.error('[Auth] ❌ Error reading OAuth user from sessionStorage:', e)
      }
    }
    
    if (!hasCheckedAuth) {
      console.log('[Auth] hasCheckedAuth is false, calling fetchUser')
      fetchUser()
    } else {
      if (loading) {
        console.log('[Auth] Loading is still true after hasCheckedAuth, setting to false')
        setLoading(false)
      }
    }

    // Fallback timeout: if loading is still true after 3 seconds, force it to false
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn('[Auth] Loading timeout - forcing loading to false after 3 seconds')
        setLoading(false)
        setHasCheckedAuth(true)
      }
    }, 3000)

    return () => {
      clearTimeout(timeoutId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  const fetchUser = async (authToken?: string) => {
    console.log('[Auth] fetchUser called', { hasToken: !!authToken, hasCheckedAuth })
    
    try {
      const headers: HeadersInit = { 'Content-Type': 'application/json' }
      
      // If token provided (for backward compatibility), use it
      // Otherwise, rely on httpOnly cookie
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`
      }
      
      console.log('[Auth] Fetching from /api/auth/me...')
      const response = await fetch('/api/auth/me', {
        headers,
        credentials: 'include', // Important: include cookies
      })
      
      console.log('[Auth] Response status:', response.status)
      
      // 401 is normal if user is not logged in, don't treat it as error
      if (response.status === 401) {
        console.log('[Auth] 401 Unauthorized - user not authenticated')
        setToken(null)
        setUser(null)
        setHasCheckedAuth(true)
        setLoading(false)
        return
      }
      
      // Handle 404 as not authenticated (endpoint might not exist or user not found)
      if (response.status === 404) {
        console.warn('[Auth] 404 from /api/auth/me - endpoint not found or user not found')
        setToken(null)
        setUser(null)
        setHasCheckedAuth(true)
        setLoading(false)
        return
      }
      
      if (!response.ok) {
        // Only throw error for non-401, non-404 errors
        if (response.status !== 401 && response.status !== 404) {
          throw new Error(`HTTP error! status: ${response.status}`)
        } else {
          // 401 or 404 - treat as not authenticated
          setToken(null)
          setUser(null)
          setHasCheckedAuth(true)
          setLoading(false)
          return
        }
      }
      
      const data = await response.json()
      console.log('[Auth] Response data:', { success: data.success, hasData: !!data.data })
      
      if (data.success && data.data) {
        console.log('[Auth] User authenticated:', { id: data.data.id, email: data.data.email, role: data.data.role })
        setUser(data.data)
        // Token is in httpOnly cookie, we don't need to store it
        setToken(null) // Token is managed by cookie
        setHasCheckedAuth(true)
        setLoading(false)
      } else {
        console.log('[Auth] Response success=false or no data')
        setToken(null)
        setUser(null)
        setHasCheckedAuth(true)
        setLoading(false)
      }
    } catch (error) {
      console.error('[Auth] Error in fetchUser:', error)
      setToken(null)
      setUser(null)
      setHasCheckedAuth(true)
      setLoading(false)
    }
    
    console.log('[Auth] fetchUser completed, loading set to false')
  }

  const login = async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include', // Important: include cookies
    })
    const data = await response.json()
    if (data.success) {
      // Token is stored in httpOnly cookie, not in response body
      setUser(data.data.user)
      setToken(null) // Token is managed by cookie
      // Remove any old localStorage token (cleanup)
      localStorage.removeItem('token')
      return { success: true, user: data.data.user }
    }

    if (data.requiresVerification && data.email) {
      return {
        success: false,
        requiresVerification: true,
        email: data.email,
        error: data.error || 'Please verify your email before logging in.',
      }
    }

    return { success: false, error: data.error || 'Login failed' }
  }

  const register = async (email: string, password: string, role: string) => {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role }),
      credentials: 'include', // Important: include cookies
    })
    const data = await response.json()
    if (data.success) {
      // Check if email verification is required
      if (data.data.requiresVerification) {
        // Redirect to verification page
        router.push(`/verify-email?email=${encodeURIComponent(email)}`)
        throw new Error('Please check your email to verify your account before signing in.')
      }
      
      // Don't auto-login after registration
      // User must login manually
      // Don't set user state - user needs to login first
      // Don't set token - no cookie is set by register route
      localStorage.removeItem('token') // Cleanup any old token
      
      // Return success message for UI to handle
      return data.data.message || 'Registration successful! Please sign in to continue.'
    } else {
      throw new Error(data.error || 'Registration failed')
    }
  }

  const logout = async () => {
    // Call logout endpoint to clear cookie
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.error('Logout error:', error)
    }
    
    setUser(null)
    setToken(null)
    // Cleanup localStorage (backward compatibility)
    localStorage.removeItem('token')
    
    // Direct redirect to login (no navbar will show)
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
