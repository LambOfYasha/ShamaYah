import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ImageModerationService } from '@/lib/ai/imageModeration';
import { getUser } from '@/lib/user/getUser';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { imageUrl, contentType } = body;

    // Validate required fields
    if (!imageUrl || !contentType) {
      return NextResponse.json({ 
        error: 'Missing required fields: imageUrl, contentType' 
      }, { status: 400 });
    }

    // Validate image URL
    try {
      new URL(imageUrl);
    } catch {
      return NextResponse.json({ 
        error: 'Invalid image URL' 
      }, { status: 400 });
    }

    // Get user information
    const userResult = await getUser();
    if ('error' in userResult) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Perform image moderation
    const moderationResult = await ImageModerationService.getImageAnalysis({
      imageUrl,
      contentType,
      userId: userResult._id,
      userRole: userResult.role
    });

    return NextResponse.json({
      success: true,
      moderation: moderationResult
    });

  } catch (error) {
    console.error('Image moderation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
} 