import { NextRequest, NextResponse } from 'next/server';
import { createCommunityResponse } from '@/action/postActions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      communityQuestionId, 
      title, 
      body, 
      imageBase64, 
      imageFilename, 
      imageContentType, 
      guestUser 
    } = body;

    // Validate required fields
    if (!communityQuestionId || !title || !body || !guestUser) {
      return NextResponse.json({ 
        error: 'Missing required fields: communityQuestionId, title, body, guestUser' 
      }, { status: 400 });
    }

    // Validate guest user structure
    if (!guestUser._id || !guestUser.username || !guestUser.role) {
      return NextResponse.json({ 
        error: 'Invalid guest user data' 
      }, { status: 400 });
    }

    // Validate that the guest user has the guest role
    if (guestUser.role !== 'guest') {
      return NextResponse.json({ 
        error: 'Invalid user role for guest post creation' 
      }, { status: 400 });
    }

    // Create the community response using the guest user
    const result = await createCommunityResponse(
      communityQuestionId, 
      title, 
      body, 
      imageBase64, 
      imageFilename, 
      imageContentType, 
      guestUser
    );

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      response: result.response
    });

  } catch (error) {
    console.error('Error creating guest post:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
} 