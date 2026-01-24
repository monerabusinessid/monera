'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')
    const googleAuth = searchParams.get('google')
    const error = searchParams.get('error')
    const isRegister = searchParams.get('register') === 'true'

    console.log('[AuthCallback] Starting callback processing:', { 
      hasToken: !!token, 
      googleAuth, 
      error,
      isRegister,
      cookies: document.cookie ? 'present' : 'missing'
    })

    if (error) {
      console.error('[AuthCallback] Error parameter found:', error)
      const errorDetails = searchParams.get('details')
      
      const errorPath = isRegister ? '/register' : '/login'
      const errorQuery = errorDetails 
        ? `error=${encodeURIComponent(error)}&details=${encodeURIComponent(errorDetails)}`
        : `error=${encodeURIComponent(error)}`
      
      console.error('[AuthCallback] Redirecting to error page:', { errorPath, error, errorDetails })
      router.push(`${errorPath}?${errorQuery}`)
      return
    }

    if (token && googleAuth === 'true') {
      // First, set the cookie via API route to ensure it's properly set
      const setCookieAndFetchUser = async () => {
        try {
          console.log('[AuthCallback] Setting cookie via API...')
          
          // Set cookie via API route
          const setCookieResponse = await fetch('/api/auth/set-cookie', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ token }),
          })

          if (!setCookieResponse.ok) {
            const errorData = await setCookieResponse.json().catch(() => ({}))
            console.error('[AuthCallback] Failed to set cookie:', errorData)
            throw new Error(errorData.error || 'Failed to set authentication cookie')
          }

          console.log('[AuthCallback] Cookie set successfully, waiting before fetch...')
          
          // Wait a bit for cookie to be fully set and propagate
          // Increased delay to ensure cookie is available for subsequent requests
          await new Promise(resolve => setTimeout(resolve, 2000))
          
          console.log('[AuthCallback] Wait completed, proceeding to fetch user data')

          // Verify cookie is set by checking document.cookie (though httpOnly cookies won't show)
          console.log('[AuthCallback] Cookies after setting:', document.cookie ? 'present' : 'missing (httpOnly cookies not visible)')

          // Now fetch user data using the cookie (or Authorization header as fallback)
          // Add retry logic because profile might not be immediately available after creation
          console.log('[AuthCallback] Fetching user data with Authorization header (with retry)...')
          
          let meData = null
          let meResponse = null
          const maxRetries = 5
          let retryCount = 0
          
          while (retryCount < maxRetries && !meData) {
            try {
              if (retryCount > 0) {
                console.log(`[AuthCallback] Retry attempt ${retryCount}...`)
                await new Promise(resolve => setTimeout(resolve, retryCount * 500)) // Increasing delay: 500ms, 1000ms, 1500ms, 2000ms
              }
              
              meResponse = await fetch('/api/auth/me', {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  // Always include Authorization header as primary method
                  Authorization: `Bearer ${token}`,
                },
                credentials: 'include', // Include cookies as fallback
              })

              console.log(`[AuthCallback] User data response status (attempt ${retryCount + 1}):`, meResponse.status)

              if (meResponse.ok) {
                const responseData = await meResponse.json()
                console.log('[AuthCallback] Response data:', {
                  success: responseData.success,
                  hasData: !!responseData.data,
                  role: responseData.data?.role,
                  status: responseData.data?.status
                })
                
                if (responseData.success && responseData.data) {
                  meData = responseData
                  console.log('[AuthCallback] User data received successfully:', { 
                    success: meData.success, 
                    hasData: !!meData.data,
                    role: meData.data?.role,
                    status: meData.data?.status,
                    id: meData.data?.id,
                    email: meData.data?.email
                  })
                  break
                } else {
                  console.log('[AuthCallback] Response OK but no data or invalid structure:', responseData)
                  // Still retry if we haven't reached max retries
                  if (retryCount < maxRetries - 1) {
                    retryCount++
                    continue
                  }
                }
              } else if (meResponse.status === 401 || meResponse.status === 404) {
                // 401 or 404 might mean profile not ready yet or token not valid, retry
                const errorText = await meResponse.text().catch(() => 'No error text')
                console.log(`[AuthCallback] ${meResponse.status} received (attempt ${retryCount + 1}/${maxRetries}), will retry...`, errorText)
                if (retryCount < maxRetries - 1) {
                  retryCount++
                  continue
                } else {
                  throw new Error(`Failed to fetch user data after ${maxRetries} attempts: ${meResponse.status} - ${errorText}`)
                }
              } else {
                const errorText = await meResponse.text()
                console.error('[AuthCallback] Failed to fetch user data:', {
                  status: meResponse.status,
                  error: errorText,
                  attempt: retryCount + 1
                })
                if (retryCount < maxRetries - 1) {
                  retryCount++
                  continue
                } else {
                  throw new Error(`Failed to fetch user data after ${maxRetries} attempts: ${meResponse.status} - ${errorText}`)
                }
              }
            } catch (fetchError) {
              console.error(`[AuthCallback] Error fetching user data (attempt ${retryCount + 1}):`, fetchError)
              if (retryCount < maxRetries - 1) {
                retryCount++
                continue
              } else {
                throw fetchError
              }
            }
          }

          if (meData && meData.success && meData.data) {
            const role = meData.data.role
            const status = meData.data.status || 'DRAFT'
            
            console.log('[AuthCallback] User authenticated, determining redirect path:', { 
              role, 
              status,
              fullData: meData.data 
            })
            
            // Determine redirect path
            let redirectPath = '/'
            if (role === 'SUPER_ADMIN' || role === 'QUALITY_ADMIN' || role === 'SUPPORT_ADMIN' || role === 'ANALYST' || role === 'ADMIN') {
              redirectPath = '/admin/dashboard'
            } else if (role === 'TALENT') {
                // For TALENT users from signup, check if they need onboarding
                // If status is DRAFT (or missing), redirect to onboarding
                if (status === 'DRAFT' || !status) {
                redirectPath = '/talent/onboarding'
              } else {
                redirectPath = '/talent'
              }
            } else if (role === 'CLIENT') {
              // CLIENT users go directly to dashboard
              // Onboarding is optional and can be accessed from dashboard if needed
              redirectPath = '/client'
              console.log('[AuthCallback] CLIENT user detected, redirecting to /client dashboard')
            } else {
              console.error('[AuthCallback] Unknown role:', role)
              // Fallback: redirect to login if role is unknown
              redirectPath = '/login?error=unknown_role'
            }
            
            console.log('[AuthCallback] Final redirect path:', redirectPath)
            
            // Store user data in sessionStorage FIRST - before any delays or redirects
            // This ensures auth context can recognize user immediately after redirect
            // CRITICAL: Must be done BEFORE redirect to ensure it's available when new page loads
            try {
              const userData = {
                id: meData.data.id,
                email: meData.data.email,
                role: meData.data.role,
                name: meData.data.name || null,
                status: meData.data.status || 'ACTIVE'
              }
              
              console.log('[AuthCallback] Setting sessionStorage BEFORE redirect...')
              sessionStorage.setItem('oauth_user', JSON.stringify(userData))
              console.log('[AuthCallback] ✅ Stored user data in sessionStorage:', userData)
              
              // Verify it was stored immediately
              const verify = sessionStorage.getItem('oauth_user')
              if (verify) {
                console.log('[AuthCallback] ✅ Verified sessionStorage contains user data')
                console.log('[AuthCallback] SessionStorage value:', verify)
              } else {
                console.error('[AuthCallback] ❌ CRITICAL: Failed to verify sessionStorage - data not found after setting!')
                // Don't proceed with redirect if sessionStorage failed
                throw new Error('Failed to set sessionStorage')
              }
            } catch (e) {
              console.error('[AuthCallback] ❌ CRITICAL ERROR: Could not store in sessionStorage:', e)
              console.error('[AuthCallback] Error details:', {
                message: e instanceof Error ? e.message : String(e),
                name: e instanceof Error ? e.name : 'Unknown',
                stack: e instanceof Error ? e.stack : undefined
              })
              // Still proceed with redirect, but log the error
            }
            
            // Ensure cookie is fully set before redirect
            // Also trigger auth context refresh by dispatching storage event
            // This helps auth context recognize the new session immediately
            try {
              // Dispatch a custom event to trigger auth context refresh
              window.dispatchEvent(new Event('storage'))
              
              // Small delay to ensure sessionStorage is fully committed
              // This is important for some browsers
              await new Promise(resolve => setTimeout(resolve, 500))
              
              // Verify sessionStorage is still there after delay
              const verifyAfterDelay = sessionStorage.getItem('oauth_user')
              if (verifyAfterDelay) {
                console.log('[AuthCallback] ✅ SessionStorage still present after delay, ready for redirect')
              } else {
                console.error('[AuthCallback] ❌ WARNING: SessionStorage lost after delay!')
              }
            } catch (e) {
              console.warn('[AuthCallback] Error in pre-redirect setup:', e)
            }
            
            // Use window.location.replace for immediate hard redirect (no back button history)
            // This ensures a full page reload and auth context will fetch user on mount
            // SessionStorage will persist across this redirect (same origin)
            console.log('[AuthCallback] Performing hard redirect to:', redirectPath)
            
            // Final verification of sessionStorage before redirect
            const finalCheck = sessionStorage.getItem('oauth_user')
            if (finalCheck) {
              console.log('[AuthCallback] ✅ Final check: SessionStorage confirmed present before redirect')
              console.log('[AuthCallback] SessionStorage value:', finalCheck.substring(0, 100) + '...')
            } else {
              console.error('[AuthCallback] ❌ CRITICAL: SessionStorage lost before redirect!')
              // Try to set it again
              try {
                const userData = {
                  id: meData.data.id,
                  email: meData.data.email,
                  role: meData.data.role,
                  name: meData.data.name || null,
                  status: meData.data.status || 'ACTIVE'
                }
                sessionStorage.setItem('oauth_user', JSON.stringify(userData))
                console.log('[AuthCallback] ✅ Re-set sessionStorage before redirect')
              } catch (e) {
                console.error('[AuthCallback] ❌ Failed to re-set sessionStorage:', e)
              }
            }
            
            console.log('[AuthCallback] SessionStorage should be available in new page')
            // Use setTimeout to ensure sessionStorage is fully committed
            setTimeout(() => {
              window.location.replace(redirectPath)
            }, 100)
          } else {
            console.error('[AuthCallback] Invalid response after retries:', {
              hasMeData: !!meData,
              success: meData?.success,
              hasData: !!meData?.data,
              fullResponse: meData
            })
            throw new Error('Failed to authenticate: Invalid response from server after retries')
          }
        } catch (err) {
          console.error('[AuthCallback] Error in callback processing:', err)
          const errorMessage = err instanceof Error ? err.message : 'Unknown error'
          
          // Use the register flag from URL params (more reliable than referrer)
          const errorPath = isRegister ? '/register' : '/login'
          console.error('[AuthCallback] Redirecting to error page:', { errorPath, errorMessage })
          
          router.push(`${errorPath}?error=oauth_failed&details=${encodeURIComponent(errorMessage)}`)
        }
      }

      setCookieAndFetchUser()
    } else {
      console.error('[AuthCallback] Missing token or google flag', { 
        hasToken: !!token, 
        googleAuth,
        isRegister,
        searchParams: Object.fromEntries(searchParams.entries())
      })
      
      const errorPath = isRegister ? '/register' : '/login'
      router.push(`${errorPath}?error=oauth_failed&details=${encodeURIComponent('Missing authentication token')}`)
    }
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-purple"></div>
        <p className="mt-4 text-gray-600">Completing authentication...</p>
      </div>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-brand-purple"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <AuthCallback />
    </Suspense>
  )
}
