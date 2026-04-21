import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { AppealService } from '@/lib/ai/appealSystem';
import { getUser } from '@/lib/user/getUser';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { contentId, contentType, originalContent, originalModeration, appealReason } = body;

    // Validate required fields
    if (!contentId || !contentType || !originalContent || !originalModeration || !appealReason) {
      return NextResponse.json({ 
        error: 'Missing required fields: contentId, contentType, originalContent, originalModeration, appealReason' 
      }, { status: 400 });
    }

    // Get user information
    const userResult = await getUser();
    if ('error' in userResult) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create appeal
    const result = await AppealService.createAppeal({
      contentId,
      contentType,
      originalContent,
      originalModeration,
      appealReason,
      userId: userResult._id,
      userRole: userResult.role,
      timestamp: new Date().toISOString()
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      appealId: result.appealId
    });

  } catch (error) {
    console.error('Appeal creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user information
    const userResult = await getUser();
    if ('error' in userResult) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is admin or teacher
    if (userResult.role !== 'admin' && userResult.role !== 'teacher' && userResult.role !== 'junior_teacher' && userResult.role !== 'senior_teacher' && userResult.role !== 'lead_teacher') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let appeals;
    if (status === 'pending') {
      appeals = await AppealService.getPendingAppeals();
    } else {
      appeals = await AppealService.getPendingAppeals(); // For now, just get pending
    }

    return NextResponse.json({
      success: true,
      appeals
    });

  } catch (error) {
    console.error('Appeal retrieval error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
} 