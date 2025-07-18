'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Send, 
  MoreVertical, 
  Edit, 
  Trash2,
  Heart,
  Reply
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NestedComment from './NestedComment';

interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    username: string;
    imageURL?: string;
  };
  createdAt: string;
  updatedAt?: string;
  likes: number;
  isLiked: boolean;
  replies?: Comment[];
}

interface CommentSectionProps {
  postId: string;
  postType: 'community' | 'blog';
  comments: Comment[];
  onAddComment: (content: string, parentCommentId?: string) => Promise<void>;
  onEditComment: (commentId: string, content: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
  onLikeComment: (commentId: string) => Promise<void>;
}

export default function CommentSection({
  postId,
  postType,
  comments,
  onAddComment,
  onEditComment,
  onDeleteComment,
  onLikeComment
}: CommentSectionProps) {
  const { user } = useUser();
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setIsSubmitting(true);
    try {
      await onAddComment(newComment.trim());
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return;

    setIsSubmitting(true);
    try {
      await onEditComment(commentId, editContent.trim());
      setEditingComment(null);
      setEditContent('');
    } catch (error) {
      console.error('Failed to edit comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    setIsSubmitting(true);
    try {
      await onDeleteComment(commentId);
    } catch (error) {
      console.error('Failed to delete comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditing = (comment: Comment) => {
    setEditingComment(comment._id);
    setEditContent(comment.content);
  };

  const canEditComment = (comment: Comment) => {
    return user && comment.author._id === user.id;
  };

  const canDeleteComment = (comment: Comment) => {
    return user && (comment.author._id === user.id || user.publicMetadata?.role === 'admin');
  };

  const handleCommentAdded = () => {
    // This will be handled by the parent component to refresh comments
    window.location.reload();
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
              <Textarea
                placeholder="Share your thoughts..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[100px]"
                disabled={isSubmitting}
              />
              <div className="flex justify-end">
                <Button type="submit" disabled={!newComment.trim() || isSubmitting}>
                  <Send className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Posting...' : 'Post Comment'}
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
            {comments.map((comment) => (
              <NestedComment
                key={comment._id}
                comment={comment}
                postId={postId}
                postType={postType === 'community' ? 'communityQuestion' : 'blogPost'}
                onCommentAdded={handleCommentAdded}
                onEditComment={onEditComment}
                onDeleteComment={onDeleteComment}
                onLikeComment={onLikeComment}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 