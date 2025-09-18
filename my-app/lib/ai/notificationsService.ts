import { ModerationResult } from './moderation';
import { 
  createNotification, 
  getUserNotifications as getSanityNotifications,
  markNotificationAsRead as markSanityNotificationAsRead,
  markAllNotificationsAsRead as markAllSanityNotificationsAsRead,
  deleteNotification as deleteSanityNotification,
  getNotificationStats as getSanityNotificationStats,
  type Notification as SanityNotification
} from '@/sanity/lib/notifications';

export interface Notification {
  _id: string;
  type: 'moderation' | 'appeal' | 'guideline' | 'system' | 'bulk' | 'ticket' | 'feedback';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  recipientId: string;
  recipientRole: 'user' | 'teacher' | 'admin';
  data?: {
    contentId?: string;
    contentType?: string;
    moderationResult?: ModerationResult;
    appealId?: string;
    guidelineId?: string;
    batchId?: string;
    ticketId?: string;
    ticketTitle?: string;
    ticketCategory?: string;
    ticketPriority?: string;
    adminResponse?: string;
    feedbackId?: string;
    feedbackTitle?: string;
    feedbackCategory?: string;
    feedbackPriority?: string;
  };
  isRead: boolean;
  createdAt: string;
  expiresAt?: string;
}

export interface NotificationTemplate {
  type: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'success';
}

export class NotificationsService {
  private static templates: Map<string, NotificationTemplate> = new Map();

  /**
   * Initialize notification templates
   */
  static initializeTemplates(): void {
    const templates: NotificationTemplate[] = [
      {
        type: 'content_flagged',
        title: 'Content Flagged for Review',
        message: 'Your content has been flagged for review by our moderation system.',
        severity: 'warning'
      },
      {
        type: 'content_blocked',
        title: 'Content Blocked',
        message: 'Your content has been blocked as it violates our community guidelines.',
        severity: 'error'
      },
      {
        type: 'appeal_submitted',
        title: 'Appeal Submitted',
        message: 'Your appeal has been submitted and is under review.',
        severity: 'info'
      },
      {
        type: 'appeal_approved',
        title: 'Appeal Approved',
        message: 'Your appeal has been approved and your content has been restored.',
        severity: 'success'
      },
      {
        type: 'appeal_rejected',
        title: 'Appeal Rejected',
        message: 'Your appeal has been rejected. The original moderation decision stands.',
        severity: 'error'
      },
      {
        type: 'bulk_completed',
        title: 'Bulk Operation Completed',
        message: 'Your bulk moderation operation has been completed successfully.',
        severity: 'success'
      },
      {
        type: 'bulk_failed',
        title: 'Bulk Operation Failed',
        message: 'Your bulk moderation operation encountered errors.',
        severity: 'error'
      },
      {
        type: 'guideline_created',
        title: 'Custom Guideline Created',
        message: 'A new custom moderation guideline has been created.',
        severity: 'info'
      },
      {
        type: 'system_maintenance',
        title: 'System Maintenance',
        message: 'The moderation system will be undergoing maintenance.',
        severity: 'warning'
      },
      {
        type: 'ticket_created',
        title: 'Support Ticket Created',
        message: 'Your support ticket has been created and is being reviewed by our team.',
        severity: 'info'
      },
      {
        type: 'ticket_updated',
        title: 'Support Ticket Updated',
        message: 'Your support ticket has been updated with a response from our team.',
        severity: 'info'
      },
      {
        type: 'ticket_resolved',
        title: 'Support Ticket Resolved',
        message: 'Your support ticket has been resolved. Please let us know if you need further assistance.',
        severity: 'success'
      },
      {
        type: 'ticket_closed',
        title: 'Support Ticket Closed',
        message: 'Your support ticket has been closed.',
        severity: 'info'
      },
      {
        type: 'new_ticket_admin',
        title: 'New Support Ticket',
        message: 'A new support ticket has been submitted and requires attention.',
        severity: 'info'
      },
      {
        type: 'urgent_ticket_admin',
        title: 'Urgent Support Ticket',
        message: 'An urgent support ticket has been submitted and requires immediate attention.',
        severity: 'warning'
      }
    ];

    templates.forEach(template => {
      this.templates.set(template.type, template);
    });
  }

  /**
   * Create a notification
   */
  static async createNotification(
    type: string,
    recipientId: string,
    recipientRole: 'user' | 'teacher' | 'admin',
    data?: any
  ): Promise<Notification> {
    const template = this.templates.get(type);
    if (!template) {
      throw new Error(`Unknown notification type: ${type}`);
    }

    const notificationData = {
      type: type as any,
      title: template.title,
      message: template.message,
      severity: template.severity,
      recipientId,
      recipientRole,
      data,
      isRead: false,
    };

    const notification = await createNotification(notificationData);
    return notification;
  }

  /**
   * Get notifications for a user
   */
  static async getUserNotifications(
    userId: string,
    limit: number = 50,
    unreadOnly: boolean = false
  ): Promise<Notification[]> {
    return await getSanityNotifications(userId, limit, unreadOnly);
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    return await markSanityNotificationAsRead(notificationId, userId);
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: string): Promise<number> {
    return await markAllSanityNotificationsAsRead(userId);
  }

  /**
   * Delete a notification
   */
  static async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
    return await deleteSanityNotification(notificationId, userId);
  }

  /**
   * Get notification statistics for a user
   */
  static async getUserNotificationStats(userId: string): Promise<{
    total: number;
    unread: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
  }> {
    return await getSanityNotificationStats(userId);
  }

  /**
   * Send moderation notification
   */
  static async sendModerationNotification(
    contentId: string,
    contentType: string,
    userId: string,
    userRole: string,
    moderationResult: ModerationResult
  ): Promise<void> {
    let notificationType: string;
    
    if (moderationResult.suggestedAction === 'block') {
      notificationType = 'content_blocked';
    } else if (moderationResult.suggestedAction === 'flag') {
      notificationType = 'content_flagged';
    } else {
      return; // Don't send notification for allowed content
    }

    await this.createNotification(notificationType, userId, userRole as any, {
      contentId,
      contentType,
      moderationResult
    });
  }

  /**
   * Send appeal notification
   */
  static async sendAppealNotification(
    appealId: string,
    userId: string,
    userRole: string,
    status: 'submitted' | 'approved' | 'rejected'
  ): Promise<void> {
    const notificationType = `appeal_${status}`;
    
    await this.createNotification(notificationType, userId, userRole as any, {
      appealId
    });
  }

  /**
   * Send bulk operation notification
   */
  static async sendBulkOperationNotification(
    batchId: string,
    userId: string,
    userRole: string,
    success: boolean,
    summary?: any
  ): Promise<void> {
    const notificationType = success ? 'bulk_completed' : 'bulk_failed';
    
    await this.createNotification(notificationType, userId, userRole as any, {
      batchId,
      summary
    });
  }

  /**
   * Send system notification to all admins
   */
  static async sendSystemNotification(
    type: string,
    message: string,
    severity: 'info' | 'warning' | 'error' | 'success' = 'info'
  ): Promise<void> {
    // In a real implementation, you would get all admin users from the database
    const adminUsers = [
      { id: 'admin_1', role: 'admin' },
      { id: 'admin_2', role: 'admin' }
    ];

    for (const admin of adminUsers) {
      await this.createNotification(type, admin.id, admin.role as any, {
        systemMessage: message
      });
    }
  }

  /**
   * Clean up old notifications (older than 30 days)
   */
  static async cleanupOldNotifications(): Promise<number> {
    // This would be implemented with a Sanity query to delete old notifications
    // For now, we'll return 0 as this is handled by Sanity's built-in cleanup
    return 0;
  }

  /**
   * Send ticket notification to user
   */
  static async sendTicketNotification(
    ticketId: string,
    ticketTitle: string,
    ticketCategory: string,
    ticketPriority: string,
    userId: string,
    userRole: string,
    status: 'created' | 'updated' | 'resolved' | 'closed',
    adminResponse?: string
  ): Promise<void> {
    const notificationType = `ticket_${status}`;
    
    await this.createNotification(notificationType, userId, userRole as any, {
      ticketId,
      ticketTitle,
      ticketCategory,
      ticketPriority,
      adminResponse
    });
  }

  /**
   * Send ticket notification to admins
   */
  static async sendTicketAdminNotification(
    ticketId: string,
    ticketTitle: string,
    ticketCategory: string,
    ticketPriority: string,
    userId: string,
    userName: string,
    userEmail: string,
    isUrgent: boolean = false
  ): Promise<void> {
    const notificationType = isUrgent ? 'urgent_ticket_admin' : 'new_ticket_admin';
    
    // Get all admin users
    const adminUsers = await this.getAdminUsers();
    
    for (const admin of adminUsers) {
      await this.createNotification(notificationType, admin.id, 'admin', {
        ticketId,
        ticketTitle,
        ticketCategory,
        ticketPriority,
        userId,
        userName,
        userEmail
      });
    }
  }

  /**
   * Get all admin users
   */
  private static async getAdminUsers(): Promise<{ id: string; role: string }[]> {
    try {
      // Import adminClient dynamically to avoid circular dependencies
      const { adminClient } = await import('@/sanity/lib/adminClient');
      
      const adminUsers = await adminClient.fetch(`
        *[_type == "user" && role in ["admin", "moderator"] && isDeleted != true && isActive == true] {
          _id,
          id,
          role
        }
      `);

      return adminUsers.map((user: any) => ({
        id: user._id,
        role: user.role
      }));
    } catch (error) {
      console.error('Error fetching admin users:', error);
      // Return empty array if we can't fetch admin users
      return [];
    }
  }

  /**
   * Get notification templates
   */
  static getNotificationTemplates(): NotificationTemplate[] {
    return Array.from(this.templates.values());
  }
} 