import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { db } from '@/lib/db';
import { markDocumentsSubmitted } from '@/lib/user-state';

export async function POST(request: NextRequest) {
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
        { success: false, error: 'Only recruiters can upload documents' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const documentType = formData.get('documentType') as string;
    const file = formData.get('file') as File;

    if (!documentType || !file) {
      return NextResponse.json(
        { success: false, error: 'Document type and file are required' },
        { status: 400 }
      );
    }

    // Get user's company
    const user = await db.user.findUnique({
      where: { id: decoded.userId },
      include: { recruiterProfile: { include: { company: true } } },
    });

    if (!user?.recruiterProfile?.company) {
      return NextResponse.json(
        { success: false, error: 'Company not found' },
        { status: 404 }
      );
    }

    // For now, we'll just store a placeholder URL
    // In production, you'd upload to cloud storage
    const fileUrl = `/uploads/documents/${user.recruiterProfile.company.id}/${file.name}`;

    const document = await db.companyDocument.create({
      data: {
        companyId: user.recruiterProfile.company.id,
        documentType,
        fileName: file.name,
        fileUrl,
      },
    });

    return NextResponse.json({
      success: true,
      data: { document },
    });
  } catch (error) {
    console.error('Document upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    const user = await db.user.findUnique({
      where: { id: decoded.userId },
      include: { 
        recruiterProfile: { 
          include: { 
            company: { 
              include: { documents: true } 
            } 
          } 
        } 
      },
    });

    if (!user?.recruiterProfile) {
      return NextResponse.json(
        { success: false, error: 'Recruiter profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        documents: user.recruiterProfile.company?.documents || [],
        status: user.recruiterProfile.documentsStatus,
        adminNotes: user.recruiterProfile.adminNotes,
      },
    });
  } catch (error) {
    console.error('Get documents error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}