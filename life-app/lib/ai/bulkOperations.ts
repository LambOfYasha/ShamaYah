import { ModerationResult, ContentModerationRequest } from './moderation';
import { ModerationService } from './moderationService';

export interface BulkModerationRequest {
  items: {
    id: string;
    content: string;
    contentType: 'post' | 'response' | 'comment' | 'blog' | 'community';
    userId: string;
    userRole: string;
  }[];
  batchSize?: number;
  priority?: 'low' | 'normal' | 'high';
}

export interface BulkModerationResult {
  batchId: string;
  totalItems: number;
  processedItems: number;
  successfulItems: number;
  failedItems: number;
  results: {
    id: string;
    success: boolean;
    moderation?: ModerationResult;
    error?: string;
  }[];
  summary: {
    allowed: number;
    flagged: number;
    blocked: number;
    averageConfidence: number;
  };
  processingTime: number;
  completedAt: string;
}

export interface BulkOperationStatus {
  batchId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  totalItems: number;
  processedItems: number;
  estimatedTimeRemaining?: number;
  startedAt: string;
  completedAt?: string;
}

export class BulkOperationsService {
  private static activeBatches = new Map<string, BulkOperationStatus>();

  /**
   * Process bulk moderation requests
   */
  static async processBulkModeration(request: BulkModerationRequest): Promise<BulkModerationResult> {
    const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();
    
    // Initialize batch status
    const batchStatus: BulkOperationStatus = {
      batchId,
      status: 'pending',
      progress: 0,
      totalItems: request.items.length,
      processedItems: 0,
      startedAt: new Date().toISOString()
    };

    this.activeBatches.set(batchId, batchStatus);

    try {
      // Update status to processing
      batchStatus.status = 'processing';
      this.activeBatches.set(batchId, batchStatus);

      const batchSize = request.batchSize || 10;
      const results: BulkModerationResult['results'] = [];
      let successfulItems = 0;
      let allowed = 0;
      let flagged = 0;
      let blocked = 0;
      let totalConfidence = 0;

      // Process items in batches
      for (let i = 0; i < request.items.length; i += batchSize) {
        const batch = request.items.slice(i, i + batchSize);
        
        // Process batch concurrently
        const batchPromises = batch.map(async (item) => {
          try {
            const moderationRequest: ContentModerationRequest = {
              content: item.content,
              contentType: item.contentType,
              userId: item.userId,
              userRole: item.userRole
            };

            const moderation = await ModerationService.getModerationAnalysis(moderationRequest);
            
            // Update counters
            if (moderation.suggestedAction === 'allow') allowed++;
            else if (moderation.suggestedAction === 'flag') flagged++;
            else if (moderation.suggestedAction === 'block') blocked++;
            
            totalConfidence += moderation.confidence;
            successfulItems++;

            return {
              id: item.id,
              success: true,
              moderation
            };
          } catch (error) {
            console.error(`Error processing item ${item.id}:`, error);
            return {
              id: item.id,
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error'
            };
          }
        });

        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);

        // Update progress
        batchStatus.processedItems = Math.min(i + batchSize, request.items.length);
        batchStatus.progress = (batchStatus.processedItems / request.items.length) * 100;
        this.activeBatches.set(batchId, batchStatus);

        // Add delay between batches to avoid rate limiting
        if (i + batchSize < request.items.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      // Calculate summary
      const averageConfidence = successfulItems > 0 ? totalConfidence / successfulItems : 0;
      const failedItems = request.items.length - successfulItems;

      const result: BulkModerationResult = {
        batchId,
        totalItems: request.items.length,
        processedItems: request.items.length,
        successfulItems,
        failedItems,
        results,
        summary: {
          allowed,
          flagged,
          blocked,
          averageConfidence
        },
        processingTime: Date.now() - startTime,
        completedAt: new Date().toISOString()
      };

      // Update final status
      batchStatus.status = 'completed';
      batchStatus.progress = 100;
      batchStatus.completedAt = result.completedAt;
      this.activeBatches.set(batchId, batchStatus);

      return result;

    } catch (error) {
      console.error('Bulk moderation error:', error);
      
      // Update status to failed
      batchStatus.status = 'failed';
      this.activeBatches.set(batchId, batchStatus);

      throw new Error('Bulk moderation failed');
    }
  }

  /**
   * Get status of a bulk operation
   */
  static getBatchStatus(batchId: string): BulkOperationStatus | null {
    return this.activeBatches.get(batchId) || null;
  }

  /**
   * Get all active batches
   */
  static getActiveBatches(): BulkOperationStatus[] {
    return Array.from(this.activeBatches.values());
  }

  /**
   * Clean up completed batches (older than 24 hours)
   */
  static cleanupCompletedBatches(): void {
    const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
    
    for (const [batchId, status] of this.activeBatches.entries()) {
      if (status.status === 'completed' || status.status === 'failed') {
        const completedAt = status.completedAt ? new Date(status.completedAt).getTime() : 0;
        if (completedAt < twentyFourHoursAgo) {
          this.activeBatches.delete(batchId);
        }
      }
    }
  }

  /**
   * Estimate processing time for bulk operation
   */
  static estimateProcessingTime(itemCount: number, batchSize: number = 10): number {
    // Rough estimate: 2 seconds per batch + 0.1 seconds per item
    const batches = Math.ceil(itemCount / batchSize);
    return (batches * 2) + (itemCount * 0.1);
  }

  /**
   * Validate bulk moderation request
   */
  static validateBulkRequest(request: BulkModerationRequest): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!request.items || request.items.length === 0) {
      errors.push('No items provided');
    }

    if (request.items && request.items.length > 1000) {
      errors.push('Maximum 1000 items per batch');
    }

    if (request.batchSize && (request.batchSize < 1 || request.batchSize > 50)) {
      errors.push('Batch size must be between 1 and 50');
    }

    // Validate each item
    request.items?.forEach((item, index) => {
      if (!item.id) {
        errors.push(`Item ${index + 1}: Missing ID`);
      }
      if (!item.content) {
        errors.push(`Item ${index + 1}: Missing content`);
      }
      if (!item.contentType) {
        errors.push(`Item ${index + 1}: Missing content type`);
      }
      if (!item.userId) {
        errors.push(`Item ${index + 1}: Missing user ID`);
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }
} 