'use client';

import { useState, useEffect } from 'react';
import CommentSection from './CommentSection';
import { getEmbeddedComments } from '@/action/embeddedComments';
import { addCommentAction, editCommentAction, deleteCommentAction, likeCommentAction } from '@/action/embeddedCommentActions';

interface EmbeddedComment {
  content: string;
  author: {
    _type: 'reference';
    _ref: string;
  };
  authorId: string;
  authorUsername: string;
  authorRole: string;
  parentCommentId?: string;
  replies: EmbeddedComment[];
  likes: number;
  likedBy: string[];
  createdAt: string;
  updatedAt?: string;
}

interface CommentSectionWrapperProps {
  postId: string;
  postType: 'community' | 'blog';
}

export default function EmbeddedCommentSectionWrapper({
  postId,
  postType
}: CommentSectionWrapperProps) {
  const [comments, setComments] = useState<EmbeddedComment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    try {
      const result = await getEmbeddedComments(postId, postType);
      if ("success" in result) {
        setComments(result.comments);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId, postType]);

  const handleAddComment = async (content: string, parentCommentId?: string) => {
    try {
      await addCommentAction(postId, postType, content, parentCommentId);
      // Refresh comments after adding
      await fetchComments();
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleEditComment = async (commentIndex: number, content: string) => {
    try {
      await editCommentAction(postId, postType, commentIndex, content);
      // Refresh comments after editing
      await fetchComments();
    } catch (error) {
      console.error('Failed to edit comment:', error);
    }
  };

  const handleDeleteComment = async (commentIndex: number) => {
    try {
      await deleteCommentAction(postId, postType, commentIndex);
      // Refresh comments after deleting
      await fetchComments();
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const handleLikeComment = async (commentIndex: number) => {
    try {
      await likeCommentAction(postId, postType, commentIndex);
      // Refresh comments after liking
      await fetchComments();
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
      onCommentAdded={fetchComments}
    />
  );
} 