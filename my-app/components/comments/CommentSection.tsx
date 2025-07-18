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
  onAddComment: (content: string) => Promise<void>;
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
              <Card key={comment._id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={comment.author.imageURL} />
                      <AvatarFallback>
                        {comment.author.username?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {comment.author.username}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {comment.author._id === user?.id ? 'You' : 'Member'}
                          </Badge>
                        </div>
                        
                        {(canEditComment(comment) || canDeleteComment(comment)) && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {canEditComment(comment) && (
                                <DropdownMenuItem onClick={() => startEditing(comment)}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                              )}
                              {canDeleteComment(comment) && (
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteComment(comment._id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>

                      {editingComment === comment._id ? (
                        <div className="space-y-2">
                          <Textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="min-h-[80px]"
                          />
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => handleEditComment(comment._id)}
                              disabled={isSubmitting}
                            >
                              Save
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setEditingComment(null);
                                setEditContent('');
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-gray-700 mb-3">{comment.content}</p>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                            {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                              <span className="text-xs">(edited)</span>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onLikeComment(comment._id)}
                              className="flex items-center gap-1"
                            >
                              <Heart className={`w-4 h-4 ${comment.isLiked ? 'text-red-500 fill-current' : ''}`} />
                              {comment.likes}
                            </Button>
                            <Button variant="ghost" size="sm" className="flex items-center gap-1">
                              <Reply className="w-4 h-4" />
                              Reply
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 