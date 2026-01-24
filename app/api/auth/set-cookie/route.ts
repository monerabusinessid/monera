import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'edge'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const token = body.token

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token is required' },
        { status: 400 }
      )
    }

    // Create response with cookie
    const response = NextResponse.json({ success: true })

    // Set the auth-token cookie
    // Use same settings as OAuth route for consistency
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    console.log('[API /auth/set-cookie] Cookie set successfully:', {
      hasToken: !!token,
      tokenLength: token.length,
      environment: process.env.NODE_ENV,
      cookieOptions: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7
      }
    })
    return response
  } catch (error) {
    console.error('[API /auth/set-cookie] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to set cookie' },
      { status: 500 }
    )
  }
}
