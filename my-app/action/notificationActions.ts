'use server';

import { auth } from '@clerk/nextjs/server';
import { getUser } from '@/lib/user/getUser';
import { NotificationsService } from '@/lib/ai/notificationsService';

export async function getUserNotifications(limit: number = 50, unreadOnly: boolean = false) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error('Unauthorized');
    }

    const userResult = await getUser();
    if ('error' in userResult) {
      throw new Error('User not found');
    }

    // Initialize notifications if not already done
    NotificationsService.initializeTemplates();

    const notifications = await NotificationsService.getUserNotifications(
      userResult._id,
      limit,
      unreadOnly
    );

    return { success: true, notifications };
  } catch (error: any) {
    console.error('Get notifications error:', error);
    return { success: false, error: error.message };
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error('Unauthorized');
    }

    const userResult = await getUser();
    if ('error' in userResult) {
      throw new Error('User not found');
    }

    const success = await NotificationsService.markAsRead(notificationId, userResult._id);
    if (!success) {
      throw new Error('Notification not found');
    }

    return { success: true };
  } catch (error: any) {
    console.error('Mark notification as read error:', error);
    return { success: false, error: error.message };
  }
}

export async function markAllNotificationsAsRead() {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error('Unauthorized');
    }

    const userResult = await getUser();
    if ('error' in userResult) {
      throw new Error('User not found');
    }

    const count = await NotificationsService.markAllAsRead(userResult._id);
    return { success: true, count };
  } catch (error: any) {
    console.error('Mark all notifications as read error:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteNotification(notificationId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error('Unauthorized');
    }

    const userResult = await getUser();
    if ('error' in userResult) {
      throw new Error('User not found');
    }

    const success = await NotificationsService.deleteNotification(notificationId, userResult._id);
    if (!success) {
      throw new Error('Notification not found');
    }

    return { success: true };
  } catch (error: any) {
    console.error('Delete notification error:', error);
    return { success: false, error: error.message };
  }
}

export async function getNotificationStats() {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error('Unauthorized');
    }

    const userResult = await getUser();
    if ('error' in userResult) {
      throw new Error('User not found');
    }

    const stats = await NotificationsService.getUserNotificationStats(userResult._id);
    return { success: true, stats };
  } catch (error: any) {
    console.error('Get notification stats error:', error);
    return { success: false, error: error.message };
  }
}

export async function sendTestNotification() {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error('Unauthorized');
    }

    const userResult = await getUser();
    if ('error' in userResult) {
      throw new Error('User not found');
    }

    if (userResult.role !== 'admin') {
      throw new Error('Admin access required');
    }

    const notification = await NotificationsService.createNotification(
      'system_maintenance',
      userResult._id,
      userResult.role,
      { testMessage: 'This is a test notification' }
    );

    return { success: true, notification };
  } catch (error: any) {
    console.error('Send test notification error:', error);
    return { success: false, error: error.message };
  }
} 