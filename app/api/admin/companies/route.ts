import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/db';

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
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
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
    const status = searchParams.get('status') || 'PENDING';
    const skip = (page - 1) * limit;

    // Get companies with pending documents
    const companies = await db.recruiterProfile.findMany({
      where: {
        documentsSubmitted: true,
        documentsStatus: status as any,
      },
      include: {
        user: true,
        company: {
          include: {
            documents: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { updatedAt: 'desc' },
    });

    const total = await db.recruiterProfile.count({
      where: {
        documentsSubmitted: true,
        documentsStatus: status as any,
      },
    });

    const formattedCompanies = companies.map(profile => ({
      id: profile.company?.id,
      name: profile.company?.name,
      email: profile.user.email,
      documentsStatus: profile.documentsStatus,
      documentsSubmittedAt: profile.updatedAt,
      adminNotes: profile.adminNotes,
      documents: profile.company?.documents || [],
    }));

    return NextResponse.json({
      success: true,
      data: {
        companies: formattedCompanies,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get pending companies error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}