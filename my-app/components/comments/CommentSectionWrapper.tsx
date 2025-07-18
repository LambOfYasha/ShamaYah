'use client';

import { useState, useEffect } from 'react';
import CommentSection from './CommentSection';
import { getComments } from '@/action/comments';

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

interface CommentSectionWrapperProps {
  postId: string;
  postType: 'community' | 'blog';
  onAddComment: (content: string) => Promise<void>;
  onEditComment: (commentId: string, content: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
  onLikeComment: (commentId: string) => Promise<void>;
}

export default function CommentSectionWrapper({
  postId,
  postType,
  onAddComment,
  onEditComment,
  onDeleteComment,
  onLikeComment
}: CommentSectionWrapperProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchComments() {
      try {
        const result = await getComments(postId, postType);
        if ("success" in result) {
          setComments(result.comments);
        }
      } catch (error) {
        console.error('Failed to fetch comments:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchComments();
  }, [postId, postType]);

  const handleAddComment = async (content: string) => {
    try {
      await onAddComment(content);
      // Refresh comments after adding
      const result = await getComments(postId, postType);
      if ("success" in result) {
        setComments(result.comments);
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleEditComment = async (commentId: string, content: string) => {
    try {
      await onEditComment(commentId, content);
      // Refresh comments after editing
      const result = await getComments(postId, postType);
      if ("success" in result) {
        setComments(result.comments);
      }
    } catch (error) {
      console.error('Failed to edit comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await onDeleteComment(commentId);
      // Remove comment from state after deleting
      setComments(prev => prev.filter(comment => comment._id !== commentId));
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      await onLikeComment(commentId);
      // Update comment like status
      setComments(prev => prev.map(comment => 
        comment._id === commentId 
          ? { ...comment, isLiked: !comment.isLiked, likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1 }
          : comment
      ));
    } catch (error) {
      console.error('Failed to like comment:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-32 h-6 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-100 rounded-lg p-4 animate-pulse">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="space-y-2">
                  <div className="w-24 h-4 bg-gray-200 rounded"></div>
                  <div className="w-16 h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="w-full h-4 bg-gray-200 rounded"></div>
                <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <CommentSection
      postId={postId}
      postType={postType}
      comments={comments}
      onAddComment={handleAddComment}
      onEditComment={handleEditComment}
      onDeleteComment={handleDeleteComment}
      onLikeComment={handleLikeComment}
    />
  );
} 