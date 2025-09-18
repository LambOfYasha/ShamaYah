'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, User, Calendar, Heart, Reply, Edit, Trash2, MoreVertical } from 'lucide-react';
import { useModeration } from '@/hooks/useModeration';
import { ModerationFeedback } from '@/components/ui/moderation-feedback';
import { formatDistanceToNow } from 'date-fns';
import { useUser } from '@clerk/nextjs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NestedComment from './NestedComment';
import { getImageUrl } from '@/lib/utils';

interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    username: string;
    imageURL?: string;
  };
  authorRole: string;
  createdAt: string;
  updatedAt?: string;
  replies?: Comment[];
}

interface CommentSectionProps {
  postId: string;
  postType: 'community' | 'blog';
  comments: Comment[];
  onAddComment: (content: string, parentCommentId?: string) => Promise<void>;
  onEditComment: (commentId: string, content: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
  onAddFavorite?: (commentPath: string) => Promise<void>;
  onRemoveFavorite?: (commentPath: string) => Promise<void>;
  onCheckFavorite?: (commentPath: string) => Promise<boolean>;
  onCommentAdded?: () => void;
}

export default function CommentSection({
  postId,
  postType,
  comments,
  onAddComment,
  onEditComment,
  onDeleteComment,
  onAddFavorite,
  onRemoveFavorite,
  onCheckFavorite,
  onCommentAdded
}: CommentSectionProps) {
  const { user } = useUser();
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize moderation for comments
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
    const content = e.target.value;
    setNewComment(content);
    updateModeratedContent(content);
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.trim()) {
      alert('Please enter a comment');
      return;
    }

    // Check if content is appropriate before submitting
    if (!canSubmit) {
      alert('Please review the content guidelines before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddComment(newComment.trim());
      setNewComment('');
      clearModeration();
      onCommentAdded?.();
    } catch (error) {
      console.error('Failed to add comment:', error);
      alert('Failed to add comment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Comment Form */}
      {user && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Add a Comment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitComment} className="space-y-4">
              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Comment
                </label>
                <Textarea
                  id="comment"
                  placeholder="Share your thoughts..."
                  value={newComment}
                  onChange={handleCommentChange}
                  className="min-h-[100px] resize-none"
                  disabled={isSubmitting}
                />
                
                {/* Moderation Feedback */}
                {newComment.trim() && (
                  <div className="mt-3">
                    <ModerationFeedback
                      isChecking={moderationState.isChecking}
                      result={moderationState.result}
                      error={moderationState.error}
                      showDetails={false}
                    />
                  </div>
                )}
              </div>
              
              <div className="flex justify-end">
                <Button 
                  type="submit"
                  disabled={!newComment.trim() || isSubmitting || !canSubmit}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Posting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Post Comment
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          <h3 className="text-lg font-semibold">
            Comments ({comments.length})
          </h3>
        </div>

        {comments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No comments yet. Be the first to share your thoughts!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {comments.map((comment, index) => {
              console.log('Rendering comment:', comment);
              return (
                <NestedComment
                  key={`${comment.author._id}-${comment.createdAt}-${index}`}
                  comment={comment}
                  commentIndex={index}
                  postId={postId}
                  postType={postType === 'community' ? 'communityQuestion' : 'blogPost'}
                  onCommentAdded={onCommentAdded || (() => {})}
                  onAddComment={onAddComment}
                  onEditComment={onEditComment}
                  onDeleteComment={onDeleteComment}
                  onAddFavorite={onAddFavorite || (async () => {})}
                  onRemoveFavorite={onRemoveFavorite || (async () => {})}
                  onCheckFavorite={onCheckFavorite || (async () => false)}
                  commentPath={index.toString()}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
} 