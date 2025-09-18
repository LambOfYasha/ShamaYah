import { ModerationResult } from './moderation';

export interface AppealRequest {
  contentId: string;
  contentType: 'post' | 'response' | 'comment' | 'blog' | 'community';
  originalContent: string;
  originalModeration: ModerationResult;
  appealReason: string;
  userId: string;
  userRole: string;
  timestamp: string;
}

export interface AppealDecision {
  appealId: string;
  originalDecision: ModerationResult;
  appealReason: string;
  adminDecision: 'approved' | 'rejected' | 'pending';
  adminNotes?: string;
  adminId: string;
  decisionTimestamp: string;
  finalModeration: ModerationResult;
}

export interface Appeal {
  _id: string;
  contentId: string;
  contentType: string;
  originalContent: string;
  originalModeration: ModerationResult;
  appealReason: string;
  userId: string;
  userRole: string;
  status: 'pending' | 'approved' | 'rejected';
  adminDecision?: AppealDecision;
  createdAt: string;
  updatedAt: string;
}

export class AppealService {
  /**
   * Create a new appeal
   */
  static async createAppeal(request: AppealRequest): Promise<{ success: boolean; appealId?: string; error?: string }> {
    try {
      // Validate appeal request
      if (!request.contentId || !request.appealReason.trim()) {
        return { success: false, error: 'Missing required fields' };
      }

      // Check if appeal already exists for this content
      const existingAppeal = await this.getAppealByContentId(request.contentId);
      if (existingAppeal) {
        return { success: false, error: 'Appeal already exists for this content' };
      }

      // Create appeal document
      const appeal: Omit<Appeal, '_id'> = {
        contentId: request.contentId,
        contentType: request.contentType,
        originalContent: request.originalContent,
        originalModeration: request.originalModeration,
        appealReason: request.appealReason,
        userId: request.userId,
        userRole: request.userRole,
        status: 'pending',
        createdAt: request.timestamp,
        updatedAt: request.timestamp
      };

      // Here you would save to your database (Sanity)
      // For now, we'll simulate the save
      const appealId = `appeal_${Date.now()}`;
      
      console.log('Appeal created:', { appealId, appeal });
      
      return { success: true, appealId };
    } catch (error) {
      console.error('Error creating appeal:', error);
      return { success: false, error: 'Failed to create appeal' };
    }
  }

  /**
   * Get appeal by content ID
   */
  static async getAppealByContentId(contentId: string): Promise<Appeal | null> {
    try {
      // Here you would query your database
      // For now, return null (no existing appeal)
      return null;
    } catch (error) {
      console.error('Error getting appeal:', error);
      return null;
    }
  }

  /**
   * Get all pending appeals
   */
  static async getPendingAppeals(): Promise<Appeal[]> {
    try {
      // Here you would query your database for pending appeals
      // For now, return empty array
      return [];
    } catch (error) {
      console.error('Error getting pending appeals:', error);
      return [];
    }
  }

  /**
   * Process appeal decision by admin
   */
  static async processAppeal(
    appealId: string, 
    decision: 'approved' | 'rejected', 
    adminId: string, 
    adminNotes?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Here you would update the appeal in your database
      // For now, we'll simulate the update
      console.log('Appeal processed:', { appealId, decision, adminId, adminNotes });
      
      return { success: true };
    } catch (error) {
      console.error('Error processing appeal:', error);
      return { success: false, error: 'Failed to process appeal' };
    }
  }

  /**
   * Get appeal statistics
   */
  static async getAppealStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    approvalRate: number;
  }> {
    try {
      // Here you would query your database for statistics
      // For now, return mock data
      return {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        approvalRate: 0
      };
    } catch (error) {
      console.error('Error getting appeal stats:', error);
      return {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        approvalRate: 0
      };
    }
  }
} 