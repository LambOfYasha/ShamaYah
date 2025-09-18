import { ModerationResult, ContentModerationRequest } from './moderation';

/**
 * Development mode moderation for testing without OpenAI API calls
 */
export class DevModerationService {
  static async moderateContent(request: ContentModerationRequest): Promise<ModerationResult> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const content = request.content.toLowerCase();
    
    // Test cases for development
    if (content.includes('test inappropriate')) {
      return {
        isAppropriate: false,
        confidence: 0.9,
        flags: ['inappropriate_content'],
        reason: 'Content contains inappropriate language (dev test)',
        suggestedAction: 'block'
      };
    }
    
    if (content.includes('test flag')) {
      return {
        isAppropriate: false,
        confidence: 0.7,
        flags: ['needs_review'],
        reason: 'Content may need review (dev test)',
        suggestedAction: 'flag'
      };
    }
    
    if (content.includes('test spam')) {
      return {
        isAppropriate: false,
        confidence: 0.8,
        flags: ['spam_detected'],
        reason: 'Content appears to be spam (dev test)',
        suggestedAction: 'flag'
      };
    }
    
    if (content.includes('test good')) {
      return {
        isAppropriate: true,
        confidence: 0.95,
        flags: [],
        reason: 'Content looks great! (dev test)',
        suggestedAction: 'allow'
      };
    }
    
    // Default behavior for development
    if (content.length < 10) {
      return {
        isAppropriate: true,
        confidence: 0.6,
        flags: ['short_content'],
        reason: 'Content is quite short (dev mode)',
        suggestedAction: 'flag'
      };
    }
    
    // Most content is allowed in dev mode
    return {
      isAppropriate: true,
      confidence: 0.8,
      flags: ['dev_mode'],
      reason: 'Content approved (development mode)',
      suggestedAction: 'allow'
    };
  }

  static async isContentAppropriate(request: ContentModerationRequest): Promise<boolean> {
    const result = await this.moderateContent(request);
    return result.isAppropriate && result.suggestedAction === 'allow';
  }

  static async getModerationAnalysis(request: ContentModerationRequest): Promise<ModerationResult> {
    return await this.moderateContent(request);
  }
} 