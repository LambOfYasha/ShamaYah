import { NextRequest, NextResponse } from 'next/server';
import { addEmbeddedComment } from '@/action/embeddedComments';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { postId, postType, content, guestUser } = body;

    // Validate required fields
    if (!postId || !postType || !content || !guestUser) {
      return NextResponse.json({ 
        error: 'Missing required fields: postId, postType, content, guestUser' 
      }, { status: 400 });
    }

    // Validate postType
    if (!['blog', 'community'].includes(postType)) {
      return NextResponse.json({ 
        error: 'Invalid postType. Must be "blog" or "community"' 
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
        error: 'Invalid user role for guest comment' 
      }, { status: 400 });
    }

    // Create the comment using the guest user
    const result = await addEmbeddedComment(postId, postType, content, undefined, guestUser);

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      comment: result.comment
    });

  } catch (error) {
    console.error('Error creating guest comment:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
} 