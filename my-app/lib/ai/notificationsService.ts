import { ModerationResult } from './moderation';

export interface Notification {
  _id: string;
  type: 'moderation' | 'appeal' | 'guideline' | 'system' | 'bulk';
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
  private static notifications: Notification[] = [];
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

    const notification: Notification = {
      _id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: type as any,
      title: template.title,
      message: template.message,
      severity: template.severity,
      recipientId,
      recipientRole,
      data,
      isRead: false,
      createdAt: new Date().toISOString()
    };

    this.notifications.push(notification);

    // In a real implementation, you would:
    // 1. Save to database
    // 2. Send real-time notification via WebSocket
    // 3. Send email notification if configured
    // 4. Send push notification if mobile app

    console.log('Notification created:', notification);

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
    let notifications = this.notifications.filter(n => n.recipientId === userId);

    if (unreadOnly) {
      notifications = notifications.filter(n => !n.isRead);
    }

    // Sort by creation date (newest first)
    notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return notifications.slice(0, limit);
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    const notification = this.notifications.find(n => n._id === notificationId && n.recipientId === userId);
    if (!notification) return false;

    notification.isRead = true;
    return true;
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: string): Promise<number> {
    const userNotifications = this.notifications.filter(n => n.recipientId === userId && !n.isRead);
    userNotifications.forEach(n => n.isRead = true);
    return userNotifications.length;
  }

  /**
   * Delete a notification
   */
  static async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
    const index = this.notifications.findIndex(n => n._id === notificationId && n.recipientId === userId);
    if (index === -1) return false;

    this.notifications.splice(index, 1);
    return true;
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
    const userNotifications = this.notifications.filter(n => n.recipientId === userId);
    const unread = userNotifications.filter(n => !n.isRead).length;

    const byType: Record<string, number> = {};
    const bySeverity: Record<string, number> = {};

    userNotifications.forEach(n => {
      byType[n.type] = (byType[n.type] || 0) + 1;
      bySeverity[n.severity] = (bySeverity[n.severity] || 0) + 1;
    });

    return {
      total: userNotifications.length,
      unread,
      byType,
      bySeverity
    };
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
    // In a real implementation, you would get all admin users
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
  static cleanupOldNotifications(): number {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const initialCount = this.notifications.length;
    this.notifications = this.notifications.filter(n => 
      new Date(n.createdAt) > thirtyDaysAgo
    );

    return initialCount - this.notifications.length;
  }

  /**
   * Get notification templates
   */
  static getNotificationTemplates(): NotificationTemplate[] {
    return Array.from(this.templates.values());
  }
} 