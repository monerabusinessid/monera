import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { db } from '@/lib/db';
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
    
    // Check if user is admin
    const user = await db.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || !user.role.includes('ADMIN')) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Get companies
    const companies = await db.company.findMany({
      skip,
      take: limit,
    });

    const total = companies.length;

    return NextResponse.json({
      success: true,
      data: {
        companies,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get companies error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}