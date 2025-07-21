import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { NotificationsService } from '@/lib/ai/notificationsService';
import { getUser } from '@/lib/user/getUser';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userResult = await getUser();
    if ('error' in userResult) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Initialize notifications if not already done
    NotificationsService.initializeTemplates();

    // Create a test notification
    const notification = await NotificationsService.createNotification(
      'system_maintenance',
      userResult._id,
      userResult.role,
      { 
        testMessage: 'This is a test notification from the AI moderation system',
        timestamp: new Date().toISOString()
      }
    );

    return NextResponse.json({
      success: true,
      notification
    });

  } catch (error) {
    console.error('Test notification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 