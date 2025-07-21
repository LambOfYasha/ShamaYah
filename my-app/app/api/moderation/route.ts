import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { ModerationService } from '@/lib/ai/moderationService';
import { DevModerationService } from '@/lib/ai/devModeration';
import { ContentModerationRequest } from '@/lib/ai/moderation';
import { getUser } from '@/lib/user/getUser';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { content, contentType } = body;

    // Validate required fields
    if (!content || !contentType) {
      return NextResponse.json({ 
        error: 'Missing required fields: content, contentType' 
      }, { status: 400 });
    }

    // Get user information
    const userResult = await getUser();
    if ('error' in userResult) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create moderation request
    const moderationRequest: ContentModerationRequest = {
      content,
      contentType,
      userId: userResult._id,
      userRole: userResult.role
    };

    // Check if we should use development mode
    const useDevMode = process.env.NODE_ENV === 'development' || !process.env.OPENAI_API_KEY;
    
    let moderationResult;
    
    if (useDevMode) {
      console.log('Using development mode moderation');
      moderationResult = await DevModerationService.getModerationAnalysis(moderationRequest);
    } else {
      console.log('Using OpenAI moderation');
      moderationResult = await ModerationService.getModerationAnalysis(moderationRequest);
    }

    return NextResponse.json({
      success: true,
      moderation: moderationResult,
      mode: useDevMode ? 'development' : 'openai'
    });

  } catch (error) {
    console.error('Moderation API error:', error);
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

    // Return moderation guidelines for frontend
    return NextResponse.json({
      success: true,
      guidelines: {
        inappropriateTopics: [
          'explicit sexual content',
          'graphic violence',
          'illegal activities',
          'personal attacks',
          'harassment',
          'discrimination',
          'spam',
          'self-promotion without value',
          'offensive language',
          'religious intolerance'
        ],
        communityGuidelines: `
          This is a Christian community focused on spiritual growth and biblical discussion.
          Content should be:
          - Respectful and edifying
          - Biblically sound
          - Encouraging to others
          - Relevant to the community topic
          - Free from personal attacks or divisive language
        `
      }
    });

  } catch (error) {
    console.error('Moderation guidelines API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
} 