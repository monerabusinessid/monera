import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { getUserState } from '@/lib/user-state';
export const runtime = 'edge'

export async function GET(request: NextRequest) {
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
    
    const userState = await getUserState(decoded.userId);

    return NextResponse.json({
      success: true,
      data: userState,
    });
  } catch (error) {
    console.error('Get user state error:', error);
    
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