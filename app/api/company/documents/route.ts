import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { db } from '@/lib/db';
import { markDocumentsSubmitted } from '@/lib/user-state';
export const runtime = 'edge'

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
    const decoded = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET!)) as any;
    
    if (decoded.role !== 'RECRUITER' && decoded.role !== 'CLIENT') {
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

    // Get user
    const user = await db.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // For now, store placeholder - in production upload to Supabase Storage
    const fileUrl = `/uploads/documents/${user.id}/${file.name}`;

    const document = await db.companyDocument.create({
      data: {
        companyId: user.id,
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
    const decoded = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET!)) as any;

    const user = await db.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const documents = await db.companyDocument.findMany({
      where: { companyId: user.id },
    });

    return NextResponse.json({
      success: true,
      data: { documents },
    });
  } catch (error) {
    console.error('Get documents error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}