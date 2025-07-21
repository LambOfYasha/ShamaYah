'use server';

import { auth } from '@clerk/nextjs/server';
import { getUser } from '@/lib/user/getUser';
import { NotificationsService } from '@/lib/ai/notificationsService';

export async function getUserNotifications(limit: number = 50, unreadOnly: boolean = false) {
  try {
    const { userId } = await auth();
    if (!userId) {
      console.log('No user ID found in auth context');
      return { success: false, error: 'Please sign in to view notifications' };
    }

    const userResult = await getUser();
    if ('error' in userResult) {
      console.log('User not found in database:', userResult.error);
      return { success: false, error: 'User profile not found - please sign in again' };
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
    
    // Handle specific authentication errors
    if (error?.message?.includes('Unauthorized') || error?.message?.includes('User not found')) {
      return { success: false, error: 'Please sign in to view notifications' };
    }
    
    return { success: false, error: error.message || 'Failed to load notifications' };
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Please sign in to mark notifications as read' };
    }

    const userResult = await getUser();
    if ('error' in userResult) {
      return { success: false, error: 'User profile not found - please sign in again' };
    }

    const success = await NotificationsService.markAsRead(notificationId, userResult._id);
    if (!success) {
      return { success: false, error: 'Notification not found' };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Mark notification as read error:', error);
    return { success: false, error: error.message || 'Failed to mark notification as read' };
  }
}

export async function markAllNotificationsAsRead() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Please sign in to mark notifications as read' };
    }

    const userResult = await getUser();
    if ('error' in userResult) {
      return { success: false, error: 'User profile not found - please sign in again' };
    }

    const count = await NotificationsService.markAllAsRead(userResult._id);
    return { success: true, count };
  } catch (error: any) {
    console.error('Mark all notifications as read error:', error);
    return { success: false, error: error.message || 'Failed to mark notifications as read' };
  }
}

export async function deleteNotification(notificationId: string) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Please sign in to delete notifications' };
    }

    const userResult = await getUser();
    if ('error' in userResult) {
      return { success: false, error: 'User profile not found - please sign in again' };
    }

    const success = await NotificationsService.deleteNotification(notificationId, userResult._id);
    if (!success) {
      return { success: false, error: 'Notification not found' };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Delete notification error:', error);
    return { success: false, error: error.message || 'Failed to delete notification' };
  }
}

export async function getNotificationStats() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Please sign in to view notification stats' };
    }

    const userResult = await getUser();
    if ('error' in userResult) {
      return { success: false, error: 'User profile not found - please sign in again' };
    }

    const stats = await NotificationsService.getUserNotificationStats(userResult._id);
    return { success: true, stats };
  } catch (error: any) {
    console.error('Get notification stats error:', error);
    return { success: false, error: error.message || 'Failed to load notification stats' };
  }
}

export async function sendTestNotification() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { success: false, error: 'Please sign in to send test notifications' };
    }

    const userResult = await getUser();
    if ('error' in userResult) {
      return { success: false, error: 'User profile not found - please sign in again' };
    }

    if (userResult.role !== 'admin') {
      return { success: false, error: 'Admin access required' };
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
    return { success: false, error: error.message || 'Failed to send test notification' };
  }
} 