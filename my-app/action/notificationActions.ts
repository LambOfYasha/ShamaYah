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
      // Provide more specific error messages based on the error type
      if (userResult.error.includes('not authenticated')) {
        return { success: false, error: 'Please sign in to view notifications' };
      } else if (userResult.error.includes('timeout')) {
        return { success: false, error: 'Network timeout - please try again' };
      } else if (userResult.error.includes('permission')) {
        return { success: false, error: 'Permission denied - please contact support' };
      } else {
        return { success: false, error: 'User profile not found - please sign in again' };
      }
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
    // Don't log authentication errors as errors
    const errorMessage = error?.message?.toLowerCase() || '';
    const isAuthError = errorMessage.includes('unauthorized') || 
                       errorMessage.includes('user not found') ||
                       errorMessage.includes('authentication') ||
                       errorMessage.includes('not authenticated');
    
    if (isAuthError) {
      console.log('Authentication error in notifications:', error);
    } else {
      console.error('Get notifications error:', error);
    }
    
    // Handle specific authentication errors
    if (error?.message?.includes('Unauthorized') || error?.message?.includes('User not found')) {
      return { success: false, error: 'Please sign in to view notifications' };
    }
    
    // Handle network errors
    if (error?.message?.includes('timeout') || error?.message?.includes('network')) {
      return { success: false, error: 'Network error - please check your connection' };
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
    // Don't log authentication errors as errors
    const errorMessage = error?.message?.toLowerCase() || '';
    const isAuthError = errorMessage.includes('unauthorized') || 
                       errorMessage.includes('user not found') ||
                       errorMessage.includes('authentication') ||
                       errorMessage.includes('not authenticated');
    
    if (isAuthError) {
      console.log('Authentication error in mark notification as read:', error);
    } else {
      console.error('Mark notification as read error:', error);
    }
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
    // Don't log authentication errors as errors
    const errorMessage = error?.message?.toLowerCase() || '';
    const isAuthError = errorMessage.includes('unauthorized') || 
                       errorMessage.includes('user not found') ||
                       errorMessage.includes('authentication') ||
                       errorMessage.includes('not authenticated');
    
    if (isAuthError) {
      console.log('Authentication error in mark all notifications as read:', error);
    } else {
      console.error('Mark all notifications as read error:', error);
    }
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
    // Don't log authentication errors as errors
    const errorMessage = error?.message?.toLowerCase() || '';
    const isAuthError = errorMessage.includes('unauthorized') || 
                       errorMessage.includes('user not found') ||
                       errorMessage.includes('authentication') ||
                       errorMessage.includes('not authenticated');
    
    if (isAuthError) {
      console.log('Authentication error in delete notification:', error);
    } else {
      console.error('Delete notification error:', error);
    }
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
    // Don't log authentication errors as errors
    const errorMessage = error?.message?.toLowerCase() || '';
    const isAuthError = errorMessage.includes('unauthorized') || 
                       errorMessage.includes('user not found') ||
                       errorMessage.includes('authentication') ||
                       errorMessage.includes('not authenticated');
    
    if (isAuthError) {
      console.log('Authentication error in get notification stats:', error);
    } else {
      console.error('Get notification stats error:', error);
    }
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
    // Don't log authentication errors as errors
    const errorMessage = error?.message?.toLowerCase() || '';
    const isAuthError = errorMessage.includes('unauthorized') || 
                       errorMessage.includes('user not found') ||
                       errorMessage.includes('authentication') ||
                       errorMessage.includes('not authenticated');
    
    if (isAuthError) {
      console.log('Authentication error in send test notification:', error);
    } else {
      console.error('Send test notification error:', error);
    }
    return { success: false, error: error.message || 'Failed to send test notification' };
  }
} 