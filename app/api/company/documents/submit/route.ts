import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { markDocumentsSubmitted } from '@/lib/user-state';

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
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    if (decoded.role !== 'RECRUITER') {
      return NextResponse.json(
        { success: false, error: 'Only recruiters can submit documents' },
        { status: 403 }
      );
    }

    await markDocumentsSubmitted(decoded.userId);

    return NextResponse.json({
      success: true,
      data: {
        message: 'Documents submitted for review',
        status: 'PENDING',
        redirectTo: '/client',
      },
    });
  } catch (error) {
    console.error('Documents submit error:', error);
    
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