import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { getUserFromToken } from './auth'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  errors?: Record<string, string[]>
}

export function successResponse<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data }, { status })
}

export function errorResponse(
  error: string,
  status = 400,
  errors?: Record<string, string[]>
): NextResponse<ApiResponse> {
  return NextResponse.json(
    { success: false, error, errors },
    { status }
  )
}

export function handleApiError(error: unknown): NextResponse<ApiResponse> {
  if (error instanceof ZodError) {
    const errors: Record<string, string[]> = {}
    error.errors.forEach((err) => {
      const path = err.path.join('.')
      if (!errors[path]) {
        errors[path] = []
      }
      errors[path].push(err.message)
    })
    return errorResponse('Validation error', 400, errors)
  }

  if (error instanceof Error) {
    console.error('API Error:', error)
    console.error('Error stack:', error.stack)
    
    // Handle Supabase errors specifically
    if (error.message && error.message.includes('duplicate key')) {
      return errorResponse('This record already exists. Please check for duplicates.', 409)
    }
    
    if (error.message && error.message.includes('foreign key')) {
      return errorResponse('Invalid reference. Please check related records exist.', 400)
    }
    
    if (error.message && error.message.includes('null value')) {
      return errorResponse('Required field is missing. Please fill all required fields.', 400)
    }
    
    // Return the actual error message if available
    return errorResponse(error.message || 'Internal server error', 500)
  }

  // Handle non-Error objects (like Supabase PostgrestError)
  if (error && typeof error === 'object' && 'message' in error) {
    const errorObj = error as { message?: string; code?: string; details?: string }
    console.error('API Error Object:', errorObj)
    
    // Format Supabase/PostgreSQL errors
    if (errorObj.message) {
      let errorMessage = errorObj.message
      
      // Make error messages more user-friendly
      if (errorMessage.includes('duplicate key')) {
        errorMessage = 'This record already exists. Please check for duplicates.'
      } else if (errorMessage.includes('foreign key')) {
        errorMessage = 'Invalid reference. Please check related records exist.'
      } else if (errorMessage.includes('null value')) {
        errorMessage = 'Required field is missing. Please fill all required fields.'
      } else if (errorMessage.includes('violates not-null constraint')) {
        errorMessage = 'Required field is missing. Please fill all required fields.'
      }
      
      return errorResponse(errorMessage, 500)
    }
  }

  console.error('Unknown error type:', error)
  return errorResponse('An unexpected error occurred. Please try again or contact support.', 500)
}

export async function getAuthUser(request: NextRequest) {
  // Try to get token from Authorization header first (for backward compatibility)
  const authHeader = request.headers.get('authorization')
  let token: string | null = null
  let tokenSource = 'none'

  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.substring(7)
    tokenSource = 'header'
  } else {
    // Try to get token from httpOnly cookie
    const cookies = request.cookies
    token = cookies.get('auth-token')?.value || null
    tokenSource = token ? 'cookie' : 'none'
  }

  console.log('[getAuthUser] Token source:', tokenSource, token ? 'present' : 'missing')

  if (!token) {
    console.log('[getAuthUser] No token found')
    return null
  }

  try {
    const user = await getUserFromToken(token)
    if (!user) {
      console.log('[getAuthUser] Token invalid or user not found')
    } else {
      console.log('[getAuthUser] User found:', { id: user.id, email: user.email, role: user.role })
    }
    return user
  } catch (error) {
    console.error('[getAuthUser] Error getting user from token:', error)
    return null
  }
}

export function requireAuth(handler: (req: NextRequest, userId: string) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    const user = await getAuthUser(req)
    if (!user) {
      return errorResponse('Unauthorized', 401)
    }
    return handler(req, user.id)
  }
}

export function requireRole(
  allowedRoles: string[],
  handler: (req: NextRequest, userId: string, userRole: string) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const user = await getAuthUser(req)
    if (!user) {
      return errorResponse('Unauthorized', 401)
    }
    if (!allowedRoles.includes(user.role)) {
      return errorResponse('Forbidden', 403)
    }
    return handler(req, user.id, user.role)
  }
}
