'use client';

import { AlertCircle, CheckCircle, Clock, XCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ModerationFeedbackProps {
  isChecking: boolean;
  result: any;
  error: string | null;
  showDetails?: boolean;
}

export function ModerationFeedback({ 
  isChecking, 
  result, 
  error, 
  showDetails = false 
}: ModerationFeedbackProps) {
  if (isChecking) {
    return (
      <Alert className="border-blue-200 bg-blue-50">
        <Loader2 className="h-4 w-4 animate-spin" />
        <AlertDescription>
          Analyzing content for community guidelines...
        </AlertDescription>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert className="border-orange-200 bg-orange-50">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Moderation service temporarily unavailable. Please try again.
        </AlertDescription>
      </Alert>
    );
  }

  if (!result) {
    return null;
  }

  const { suggestedAction, reason, flags, confidence } = result;

  if (suggestedAction === 'block') {
    return (
      <Alert className="border-red-200 bg-red-50">
        <XCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <div className="font-medium mb-1">Content cannot be posted</div>
          <div className="text-sm">{reason}</div>
          {showDetails && flags.length > 0 && (
            <div className="mt-2">
              <div className="text-xs font-medium mb-1">Issues detected:</div>
              <div className="flex flex-wrap gap-1">
                {flags.map((flag: string, index: number) => (
                  <Badge key={index} variant="destructive" className="text-xs">
                    {flag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  if (suggestedAction === 'flag') {
    return (
      <Alert className="border-orange-200 bg-orange-50">
        <AlertCircle className="h-4 w-4 text-orange-600" />
        <AlertDescription className="text-orange-800">
          <div className="font-medium mb-1">Content needs review</div>
          <div className="text-sm">{reason}</div>
          {showDetails && flags.length > 0 && (
            <div className="mt-2">
              <div className="text-xs font-medium mb-1">Potential issues:</div>
              <div className="flex flex-wrap gap-1">
                {flags.map((flag: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {flag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  if (result.isAppropriate) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <div className="font-medium">Content looks good!</div>
          <div className="text-sm">Your content aligns with community guidelines.</div>
          {showDetails && confidence && (
            <div className="mt-1 text-xs">
              Confidence: {Math.round(confidence * 100)}%
              {flags.includes('fallback_moderation') && (
                <span className="ml-2 text-orange-600">(Fallback moderation used)</span>
              )}
            </div>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="border-gray-200 bg-gray-50">
      <Clock className="h-4 h-4 text-gray-600" />
      <AlertDescription className="text-gray-700">
        Content is being reviewed...
        {flags.includes('fallback_moderation') && (
          <div className="text-xs mt-1 text-orange-600">
            Using fallback moderation (OpenAI unavailable)
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
} 