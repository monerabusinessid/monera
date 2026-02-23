import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { markOnboardingComplete } from '@/lib/user-state';
export const runtime = 'edge'

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET!)) as any;
    
    if (decoded.role !== 'CANDIDATE') {
      return NextResponse.json(
        { success: false, error: 'Only candidates can complete onboarding' },
        { status: 403 }
      );
    }

    await markOnboardingComplete(decoded.userId);

    return NextResponse.json({
      success: true,
      data: {
        message: 'Onboarding completed',
        redirectTo: '/talent',
      },
    });
  } catch (error) {
    console.error('Onboarding complete error:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}