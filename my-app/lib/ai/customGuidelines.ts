import { ModerationResult } from './moderation';

export interface CustomGuideline {
  _id: string;
  name: string;
  description: string;
  category: 'content' | 'behavior' | 'language' | 'spam' | 'custom';
  severity: 'low' | 'medium' | 'high' | 'critical';
  keywords: string[];
  patterns: string[]; // Regex patterns
  conditions: {
    contentType?: 'post' | 'response' | 'comment' | 'blog' | 'community';
    userRole?: 'user' | 'teacher' | 'admin';
    contentLength?: {
      min?: number;
      max?: number;
    };
    timeOfDay?: {
      start?: string; // HH:MM format
      end?: string;
    };
  };
  actions: {
    suggestedAction: 'allow' | 'flag' | 'block';
    confidenceThreshold: number;
    customMessage?: string;
    requireReview: boolean;
  };
  isActive: boolean;
  priority: number; // Higher number = higher priority
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
  successRate: number;
}

export interface GuidelineMatch {
  guideline: CustomGuideline;
  matchedKeywords: string[];
  matchedPatterns: string[];
  confidence: number;
  reason: string;
}

export class CustomGuidelinesService {
  private static guidelines: CustomGuideline[] = [];

  /**
   * Initialize default guidelines
   */
  static initializeDefaultGuidelines(): void {
    const defaultGuidelines: Omit<CustomGuideline, '_id' | 'createdAt' | 'updatedAt'>[] = [
      {
        name: 'Spam Detection',
        description: 'Detect and flag spam content',
        category: 'spam',
        severity: 'medium',
        keywords: ['buy now', 'click here', 'limited time', 'act now', 'free money'],
        patterns: [
          '\\b(buy|purchase|order)\\s+now\\b',
          '\\b(click|visit)\\s+(here|link)\\b',
          '\\b(free|no cost|no charge)\\s+(money|cash|gift)\\b'
        ],
        conditions: {
          contentType: 'post'
        },
        actions: {
          suggestedAction: 'flag',
          confidenceThreshold: 0.7,
          customMessage: 'This content appears to be promotional or spam.',
          requireReview: true
        },
        isActive: true,
        priority: 5,
        createdBy: 'system',
        usageCount: 0,
        successRate: 0.85
      },
      {
        name: 'Inappropriate Language',
        description: 'Flag inappropriate or offensive language',
        category: 'language',
        severity: 'high',
        keywords: ['hate', 'discrimination', 'offensive', 'inappropriate'],
        patterns: [
          '\\b(hate|discriminate|offensive)\\s+(speech|language|content)\\b',
          '\\b(inappropriate|offensive)\\s+(words|language|terms)\\b'
        ],
        conditions: {
          contentType: 'comment'
        },
        actions: {
          suggestedAction: 'block',
          confidenceThreshold: 0.8,
          customMessage: 'This content contains inappropriate language.',
          requireReview: false
        },
        isActive: true,
        priority: 8,
        createdBy: 'system',
        usageCount: 0,
        successRate: 0.92
      },
      {
        name: 'Personal Attacks',
        description: 'Detect personal attacks and harassment',
        category: 'behavior',
        severity: 'critical',
        keywords: ['attack', 'harass', 'bully', 'threaten'],
        patterns: [
          '\\b(attack|harass|bully|threaten)\\s+(you|them|someone)\\b',
          '\\b(personal|direct)\\s+(attack|insult|threat)\\b'
        ],
        conditions: {
          contentType: 'comment'
        },
        actions: {
          suggestedAction: 'block',
          confidenceThreshold: 0.75,
          customMessage: 'This content appears to be a personal attack.',
          requireReview: true
        },
        isActive: true,
        priority: 10,
        createdBy: 'system',
        usageCount: 0,
        successRate: 0.88
      }
    ];

    defaultGuidelines.forEach((guideline, index) => {
      const newGuideline: CustomGuideline = {
        ...guideline,
        _id: `guideline_${index + 1}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.guidelines.push(newGuideline);
    });
  }

  /**
   * Get all active guidelines
   */
  static getActiveGuidelines(): CustomGuideline[] {
    return this.guidelines.filter(g => g.isActive).sort((a, b) => b.priority - a.priority);
  }

  /**
   * Get guidelines by category
   */
  static getGuidelinesByCategory(category: string): CustomGuideline[] {
    return this.guidelines.filter(g => g.category === category && g.isActive);
  }

  /**
   * Add a new custom guideline
   */
  static async addGuideline(guideline: Omit<CustomGuideline, '_id' | 'createdAt' | 'updatedAt' | 'usageCount' | 'successRate'>): Promise<CustomGuideline> {
    const newGuideline: CustomGuideline = {
      ...guideline,
      _id: `guideline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 0,
      successRate: 0
    };

    this.guidelines.push(newGuideline);
    return newGuideline;
  }

  /**
   * Update an existing guideline
   */
  static async updateGuideline(id: string, updates: Partial<CustomGuideline>): Promise<CustomGuideline | null> {
    const index = this.guidelines.findIndex(g => g._id === id);
    if (index === -1) return null;

    this.guidelines[index] = {
      ...this.guidelines[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return this.guidelines[index];
  }

  /**
   * Delete a guideline
   */
  static async deleteGuideline(id: string): Promise<boolean> {
    const index = this.guidelines.findIndex(g => g._id === id);
    if (index === -1) return false;

    this.guidelines.splice(index, 1);
    return true;
  }

  /**
   * Check content against custom guidelines
   */
  static checkContentAgainstGuidelines(
    content: string,
    contentType: string,
    userRole: string,
    contentLength: number
  ): GuidelineMatch[] {
    const matches: GuidelineMatch[] = [];
    const activeGuidelines = this.getActiveGuidelines();

    for (const guideline of activeGuidelines) {
      // Check if guideline applies to this content type and user role
      if (guideline.conditions.contentType && guideline.conditions.contentType !== contentType) {
        continue;
      }

      if (guideline.conditions.userRole && guideline.conditions.userRole !== userRole) {
        continue;
      }

      // Check content length conditions
      if (guideline.conditions.contentLength) {
        const { min, max } = guideline.conditions.contentLength;
        if (min && contentLength < min) continue;
        if (max && contentLength > max) continue;
      }

      // Check time conditions (if implemented)
      // This would require timezone handling in a real implementation

      // Check keywords
      const matchedKeywords: string[] = [];
      for (const keyword of guideline.keywords) {
        if (content.toLowerCase().includes(keyword.toLowerCase())) {
          matchedKeywords.push(keyword);
        }
      }

      // Check patterns
      const matchedPatterns: string[] = [];
      for (const pattern of guideline.patterns) {
        try {
          const regex = new RegExp(pattern, 'gi');
          if (regex.test(content)) {
            matchedPatterns.push(pattern);
          }
        } catch (error) {
          console.error(`Invalid regex pattern: ${pattern}`);
        }
      }

      // Calculate confidence based on matches
      let confidence = 0;
      let reason = '';

      if (matchedKeywords.length > 0 || matchedPatterns.length > 0) {
        const keywordScore = (matchedKeywords.length / guideline.keywords.length) * 0.6;
        const patternScore = (matchedPatterns.length / guideline.patterns.length) * 0.4;
        confidence = Math.min(keywordScore + patternScore, 1);

        reason = `Matched ${matchedKeywords.length} keywords and ${matchedPatterns.length} patterns`;
      }

      if (confidence >= guideline.actions.confidenceThreshold) {
        matches.push({
          guideline,
          matchedKeywords,
          matchedPatterns,
          confidence,
          reason
        });
      }
    }

    // Sort by priority and confidence
    return matches.sort((a, b) => {
      if (a.guideline.priority !== b.guideline.priority) {
        return b.guideline.priority - a.guideline.priority;
      }
      return b.confidence - a.confidence;
    });
  }

  /**
   * Apply custom guidelines to moderation result
   */
  static applyCustomGuidelines(
    baseResult: ModerationResult,
    content: string,
    contentType: string,
    userRole: string,
    contentLength: number
  ): ModerationResult {
    const guidelineMatches = this.checkContentAgainstGuidelines(content, contentType, userRole, contentLength);

    if (guidelineMatches.length === 0) {
      return baseResult;
    }

    // Get the highest priority match
    const topMatch = guidelineMatches[0];
    const guideline = topMatch.guideline;

    // Update the moderation result based on the guideline
    const enhancedResult: ModerationResult = {
      ...baseResult,
      suggestedAction: guideline.actions.suggestedAction,
      confidence: Math.max(baseResult.confidence, topMatch.confidence),
      reason: guideline.actions.customMessage || baseResult.reason,
      flags: [...baseResult.flags, `Custom guideline: ${guideline.name}`],
      customGuidelineApplied: {
        guidelineId: guideline._id,
        guidelineName: guideline.name,
        matchedKeywords: topMatch.matchedKeywords,
        matchedPatterns: topMatch.matchedPatterns,
        confidence: topMatch.confidence
      }
    };

    // Update usage statistics
    guideline.usageCount++;
    // In a real implementation, you'd also track success/failure rates

    return enhancedResult;
  }

  /**
   * Get guideline statistics
   */
  static getGuidelineStats(): {
    total: number;
    active: number;
    byCategory: Record<string, number>;
    averageSuccessRate: number;
  } {
    const activeGuidelines = this.guidelines.filter(g => g.isActive);
    const byCategory: Record<string, number> = {};
    
    this.guidelines.forEach(g => {
      byCategory[g.category] = (byCategory[g.category] || 0) + 1;
    });

    const averageSuccessRate = this.guidelines.length > 0 
      ? this.guidelines.reduce((sum, g) => sum + g.successRate, 0) / this.guidelines.length 
      : 0;

    return {
      total: this.guidelines.length,
      active: activeGuidelines.length,
      byCategory,
      averageSuccessRate
    };
  }
} 