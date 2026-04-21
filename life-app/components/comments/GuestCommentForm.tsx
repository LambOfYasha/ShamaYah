'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useModeration } from '@/hooks/useModeration';
import { ModerationFeedback } from '@/components/ui/moderation-feedback';

interface GuestCommentFormProps {
  postId: string;
  postType: 'blog' | 'community';
  onCommentAdded: () => void;
}

export default function GuestCommentForm({ postId, postType, onCommentAdded }: GuestCommentFormProps) {
  const [comment, setComment] = useState('');
  const [guestName, setGuestName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGuestForm, setShowGuestForm] = useState(false);
  const { toast } = useToast();

  // Initialize moderation for guest comment content
  const {
    content: moderatedContent,
    updateContent: updateModeratedContent,
    moderationState,
    checkModeration,
    clearModeration,
    getModerationFeedback,
    canSubmit
  } = useModeration({
    contentType: 'comment',
    debounceMs: 1000,
    autoCheck: true
  });

  // Update moderated content when comment changes
  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setComment(value);
    // Check comment and guest name together
    updateModeratedContent(`${value}\n\nGuest: ${guestName}`);
  };

  // Update moderated content when guest name changes
  const handleGuestNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setGuestName(value);
    // Check comment and guest name together
    updateModeratedContent(`${comment}\n\nGuest: ${value}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comment.trim()) {
      toast({
        title: "Error",
        description: "Please enter a comment",
        variant: "destructive",
      });
      return;
    }

    if (!guestName.trim()) {
      toast({
        title: "Error",
        description: "Please enter your name",
        variant: "destructive",
      });
      return;
    }

    if (!canSubmit) {
      toast({
        title: "Error",
        description: "Please wait for content moderation to complete",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // First create a guest user
      const guestResponse = await fetch('/api/user/guest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ guestName: guestName.trim() }),
      });

      if (!guestResponse.ok) {
        const error = await guestResponse.json();
        throw new Error(error.error || 'Failed to create guest user');
      }

      const guestData = await guestResponse.json();
      const guestUser = guestData.user;

      // Now create the comment using the guest user
      const commentResponse = await fetch('/api/comments/guest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId,
          postType,
          content: comment.trim(),
          guestUser,
        }),
      });

      if (!commentResponse.ok) {
        const error = await commentResponse.json();
        throw new Error(error.error || 'Failed to add comment');
      }

      setComment('');
      setGuestName('');
      setShowGuestForm(false);
      clearModeration();
      onCommentAdded();
      
      toast({
        title: "Success",
        description: "Comment added successfully!",
      });
    } catch (error) {
      console.error('Error adding guest comment:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add comment",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!showGuestForm) {
    return (
      <Card>
        <CardContent className="p-6">
          <Button 
            onClick={() => setShowGuestForm(true)}
            variant="outline"
            className="w-full"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Comment as Guest
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-4 h-4" />
          Comment as Guest
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="guestName" className="block text-sm font-medium text-gray-700 mb-1">
              Your Name *
            </label>
            <Input
              id="guestName"
              type="text"
              value={guestName}
              onChange={handleGuestNameChange}
              placeholder="Enter your name"
              required
              minLength={2}
              maxLength={50}
            />
          </div>
          
          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
              Comment *
            </label>
            <Textarea
              id="comment"
              value={comment}
              onChange={handleCommentChange}
              placeholder="Share your thoughts..."
              required
              rows={4}
            />
            
            {/* Moderation Feedback */}
            {(comment.trim() || guestName.trim()) && (
              <div className="mt-2">
                <ModerationFeedback
                  isChecking={moderationState.isChecking}
                  result={moderationState.result}
                  error={moderationState.error}
                  showDetails={false}
                />
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button 
              type="submit" 
              disabled={isSubmitting || !comment.trim() || !guestName.trim() || !canSubmit}
            >
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setShowGuestForm(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 