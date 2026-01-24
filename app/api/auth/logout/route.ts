import { NextRequest, NextResponse } from 'next/server'
import { successResponse } from '@/lib/api-utils'


export async function POST(request: NextRequest) {
  const response = successResponse({ message: 'Logged out successfully' })
  
  // Clear auth token cookie
  response.cookies.set('auth-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0, // Expire immediately
  })

  return response
}
