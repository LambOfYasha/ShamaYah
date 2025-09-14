'use server';

import { auth } from '@clerk/nextjs/server';
import { getUser } from '@/lib/user/getUser';
import { NotificationsService } from '@/lib/ai/notificationsService';

export async function sendTicketCreatedNotification(
  ticketId: string,
  ticketTitle: string,
  ticketCategory: string,
  ticketPriority: string,
  userId: string,
  userName: string,
  userEmail: string
) {
  try {
    const { userId: currentUserId } = await auth();
    if (!currentUserId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get current user to determine role
    const currentUser = await getUser();
    if ('error' in currentUser) {
      return { success: false, error: 'User not found' };
    }

    // Map user role for notification
    const mapRoleForNotification = (role: string): 'user' | 'teacher' | 'admin' => {
      if (role === 'admin') return 'admin';
      if (role === 'teacher' || role === 'junior_teacher' || role === 'senior_teacher' || role === 'lead_teacher') return 'teacher';
      return 'user';
    };

    // Send notification to user
    await NotificationsService.sendTicketNotification(
      ticketId,
      ticketTitle,
      ticketCategory,
      ticketPriority,
      userId,
      mapRoleForNotification(currentUser.role),
      'created'
    );

    // Send notification to admins
    await NotificationsService.sendTicketAdminNotification(
      ticketId,
      ticketTitle,
      ticketCategory,
      ticketPriority,
      userId,
      userName,
      userEmail,
      ticketPriority === 'urgent'
    );

    return { success: true };
  } catch (error) {
    console.error('Error sending ticket created notification:', error);
    return { success: false, error: 'Failed to send notification' };
  }
}

export async function sendTicketUpdatedNotification(
  ticketId: string,
  ticketTitle: string,
  ticketCategory: string,
  ticketPriority: string,
  userId: string,
  status: 'updated' | 'resolved' | 'closed',
  adminResponse?: string
) {
  try {
    const { userId: currentUserId } = await auth();
    if (!currentUserId) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get user role for notification
    const user = await getUser();
    if ('error' in user) {
      return { success: false, error: 'User not found' };
    }

    // Map user role for notification
    const mapRoleForNotification = (role: string): 'user' | 'teacher' | 'admin' => {
      if (role === 'admin') return 'admin';
      if (role === 'teacher' || role === 'junior_teacher' || role === 'senior_teacher' || role === 'lead_teacher') return 'teacher';
      return 'user';
    };

    // Send notification to user
    await NotificationsService.sendTicketNotification(
      ticketId,
      ticketTitle,
      ticketCategory,
      ticketPriority,
      userId,
      mapRoleForNotification(user.role),
      status,
      adminResponse
    );

    return { success: true };
  } catch (error) {
    console.error('Error sending ticket updated notification:', error);
    return { success: false, error: 'Failed to send notification' };
  }
}

export async function getTicketNotifications(userId?: string) {
  try {
    const { userId: currentUserId } = await auth();
    if (!currentUserId) {
      return { success: false, error: 'Unauthorized' };
    }

    const user = await getUser();
    if ('error' in user) {
      return { success: false, error: 'User not found' };
    }

    // If userId is provided, check if current user is admin or the user themselves
    if (userId && userId !== currentUserId && !['admin', 'moderator'].includes(user.role)) {
      return { success: false, error: 'Insufficient permissions' };
    }

    const targetUserId = userId || currentUserId;
    
    // Get ticket-related notifications
    const notifications = await NotificationsService.getUserNotifications(targetUserId, 50, false);
    
    // Filter for ticket-related notifications
    const ticketNotifications = notifications.filter(notification => 
      notification.type === 'ticket' || 
      notification.data?.ticketId
    );

    return { success: true, notifications: ticketNotifications };
  } catch (error) {
    console.error('Error getting ticket notifications:', error);
    return { success: false, error: 'Failed to get notifications' };
  }
}
