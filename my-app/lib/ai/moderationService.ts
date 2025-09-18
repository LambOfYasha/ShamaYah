import OpenAI from 'openai';
import { ModerationResult, ContentModerationRequest } from './moderation';

export class ModerationService {
  private static openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  /**
   * Analyze content using GPT-4 for appropriateness
   */
  static async getModerationAnalysis(request: ContentModerationRequest): Promise<ModerationResult> {
    try {
      const { content, contentType, userId, userRole } = request;

      // Create context-aware prompt based on content type
      const prompt = this.createPrompt(contentType, content, userRole);

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: prompt
          },
          {
            role: 'user',
            content: `Please analyze this ${contentType} content for appropriateness:\n\n${content}`
          }
        ],
        max_tokens: 500,
        temperature: 0.1,
      });

      const analysis = response.choices[0]?.message?.content;
      
      if (!analysis) {
        throw new Error('No response from GPT-4');
      }

      // Parse the JSON response
      let result: ModerationResult;
      try {
        result = JSON.parse(analysis);
      } catch (parseError) {
        console.error('Failed to parse moderation response:', analysis);
        return this.fallbackModeration(request);
      }

      return result;

    } catch (error: any) {
      console.error('Moderation error:', error);
      
      // Handle quota exceeded or other OpenAI errors
      if (error?.code === 'insufficient_quota' || error?.status === 429) {
        console.log('OpenAI quota exceeded, using fallback moderation');
        return this.fallbackModeration(request);
      }
      
      return this.fallbackModeration(request);
    }
  }

  /**
   * Create context-aware prompt based on content type
   */
  private static createPrompt(contentType: string, content: string, userRole: string): string {
    const baseGuidelines = `
You are an AI moderator for a Christian community platform. Analyze content for appropriateness.

Community Guidelines:
- Content should be respectful and edifying
- No explicit sexual content, graphic violence, or inappropriate material
- No hate speech, discrimination, or offensive symbols
- No spam, commercial content, or self-promotion
- Content should align with Christian values and community standards
- No personal attacks or harassment
- No misinformation or conspiracy theories
- No excessive profanity or vulgar language

User Role: ${userRole}
Content Type: ${contentType}

Analyze the content and respond with a JSON object:
{
  "isAppropriate": boolean,
  "confidence": number (0-1),
  "flags": ["any", "issues", "found"],
  "reason": "Explanation of moderation decision",
  "suggestedAction": "allow" | "flag" | "block"
}`;

    // Add specific guidelines based on content type
    switch (contentType) {
      case 'response':
        return baseGuidelines + `

Additional Guidelines for Community Responses:
- Responses should be helpful and constructive
- No off-topic or irrelevant content
- No duplicate or repetitive responses
- Should contribute meaningfully to the discussion
- No excessive self-promotion or advertising`;

      case 'comment':
        return baseGuidelines + `

Additional Guidelines for Comments:
- Comments should be relevant to the post
- No excessive negativity or trolling
- No personal attacks on other users
- Should add value to the conversation
- No spam or repetitive comments`;

      case 'blog':
        return baseGuidelines + `

Additional Guidelines for Blog Posts:
- Content should be educational or informative
- No clickbait or misleading titles
- Should be well-written and coherent
- No excessive self-promotion
- Should provide value to the community
- No plagiarized content`;

      case 'community':
        return baseGuidelines + `

Additional Guidelines for Community Questions:
- Questions should be clear and specific
- No duplicate questions
- Should be relevant to the community
- No overly broad or vague questions
- Should encourage meaningful discussion
- No questions that could be easily answered with a simple search`;

      default:
        return baseGuidelines;
    }
  }

  /**
   * Fallback moderation when OpenAI is unavailable
   */
  private static fallbackModeration(request: ContentModerationRequest): ModerationResult {
    const { content, contentType } = request;
    
    // Basic keyword-based fallback
    const inappropriateKeywords = [
      'inappropriate', 'spam', 'hate', 'violence', 'explicit', 'offensive',
      'harassment', 'discrimination', 'misinformation', 'conspiracy'
    ];
    
    const contentLower = content.toLowerCase();
    const foundKeywords = inappropriateKeywords.filter(keyword => 
      contentLower.includes(keyword)
    );
    
    if (foundKeywords.length > 0) {
      return {
        isAppropriate: false,
        confidence: 0.7,
        flags: foundKeywords,
        reason: `Content contains potentially inappropriate keywords: ${foundKeywords.join(', ')}`,
        suggestedAction: 'flag'
      };
    }
    
    // Allow most content in fallback mode
    return {
      isAppropriate: true,
      confidence: 0.6,
      flags: ['fallback_moderation'],
      reason: 'Content reviewed using fallback moderation (OpenAI unavailable)',
      suggestedAction: 'allow'
    };
  }
} 