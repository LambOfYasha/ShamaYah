'use client';

import { useState, useCallback, useEffect } from 'react';
import { ModerationResult } from '@/lib/ai/moderation';

interface UseModerationOptions {
  contentType: 'post' | 'response' | 'comment';
  debounceMs?: number;
  autoCheck?: boolean;
}

interface ModerationState {
  isChecking: boolean;
  result: ModerationResult | null;
  error: string | null;
  lastChecked: string;
}

export function useModeration(options: UseModerationOptions) {
  const { contentType, debounceMs = 1000, autoCheck = true } = options;
  
  const [content, setContent] = useState('');
  const [moderationState, setModerationState] = useState<ModerationState>({
    isChecking: false,
    result: null,
    error: null,
    lastChecked: ''
  });

  // Debounced moderation check
  const checkModeration = useCallback(async (text: string) => {
    if (!text.trim()) {
      setModerationState(prev => ({ ...prev, result: null, error: null }));
      return;
    }

    setModerationState(prev => ({ ...prev, isChecking: true, error: null }));

    try {
      const response = await fetch('/api/moderation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: text,
          contentType
        }),
      });

      if (!response.ok) {
        throw new Error('Moderation check failed');
      }

      const data = await response.json();
      
      if (data.success) {
        setModerationState(prev => ({
          ...prev,
          result: data.moderation,
          isChecking: false,
          lastChecked: new Date().toISOString()
        }));
      } else {
        throw new Error(data.error || 'Moderation check failed');
      }
    } catch (error) {
      setModerationState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Moderation check failed',
        isChecking: false
      }));
    }
  }, [contentType]);

  // Debounced effect for auto-checking
  useEffect(() => {
    if (!autoCheck || !content) return;

    const timeoutId = setTimeout(() => {
      checkModeration(content);
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [content, autoCheck, debounceMs, checkModeration]);

  // Manual moderation check
  const checkModerationManually = useCallback(() => {
    return checkModeration(content);
  }, [content, checkModeration]);

  // Update content
  const updateContent = useCallback((newContent: string) => {
    setContent(newContent);
  }, []);

  // Clear moderation state
  const clearModeration = useCallback(() => {
    setContent('');
    setModerationState({
      isChecking: false,
      result: null,
      error: null,
      lastChecked: ''
    });
  }, []);

  // Get moderation feedback for UI
  const getModerationFeedback = useCallback(() => {
    if (!moderationState.result) return null;

    const { result } = moderationState;
    
    if (result.suggestedAction === 'block') {
      return {
        type: 'error' as const,
        message: result.reason || 'This content violates community guidelines and cannot be posted.',
        canSubmit: false
      };
    }

    if (result.suggestedAction === 'flag') {
      return {
        type: 'warning' as const,
        message: result.reason || 'This content may need review before posting.',
        canSubmit: false
      };
    }

    if (result.isAppropriate) {
      return {
        type: 'success' as const,
        message: 'Content looks good!',
        canSubmit: true
      };
    }

    return {
      type: 'info' as const,
      message: 'Content is being reviewed...',
      canSubmit: false
    };
  }, [moderationState.result]);

  return {
    content,
    updateContent,
    moderationState,
    checkModeration: checkModerationManually,
    clearModeration,
    getModerationFeedback,
    isAppropriate: moderationState.result?.isAppropriate ?? false,
    canSubmit: moderationState.result?.suggestedAction === 'allow'
  };
} 