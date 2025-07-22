import { NextRequest, NextResponse } from 'next/server';
import { NotificationsService } from '@/lib/ai/notificationsService';

export async function POST(request: NextRequest) {
  try {
    // Initialize notifications if not already done
    NotificationsService.initializeTemplates();

    // Create test notifications for a demo user
    const demoUserId = 'demo-user-123';
    const demoUserRole = 'user' as const;

    const testNotifications = [];
    
    // Test notification 1: System maintenance
    const notification1 = await NotificationsService.createNotification(
      'system_maintenance',
      demoUserId,
      demoUserRole,
      { 
        testMessage: 'This is a test system maintenance notification',
        timestamp: new Date().toISOString()
      }
    );
    testNotifications.push(notification1);

    // Test notification 2: Content flagged
    const notification2 = await NotificationsService.createNotification(
      'content_flagged',
      demoUserId,
      demoUserRole,
      { 
        testMessage: 'This is a test content flagged notification',
        contentId: 'test-content-123',
        contentType: 'blog'
      }
    );
    testNotifications.push(notification2);

    // Test notification 3: Appeal submitted
    const notification3 = await NotificationsService.createNotification(
      'appeal_submitted',
      demoUserId,
      demoUserRole,
      { 
        testMessage: 'This is a test appeal notification',
        appealId: 'test-appeal-456'
      }
    );
    testNotifications.push(notification3);

    return NextResponse.json({
      success: true,
      message: 'Test notifications created successfully',
      notifications: testNotifications
    });

  } catch (error) {
    console.error('Test notification error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 