'use client';

import { useState, useEffect } from 'react';
import CommentSection from './CommentSection';
import { getEmbeddedComments } from '@/action/embeddedComments';
import { addCommentAction, editCommentAction, deleteCommentAction, addFavoriteAction, removeFavoriteAction, checkFavoriteAction } from '@/action/embeddedCommentActions';

interface EmbeddedComment {
  _id: string;
  content: string;
  author: {
    _id: string;
    username: string;
    imageURL?: string;
  };
  authorRole: string;
  parentCommentId?: string;
  replies: EmbeddedComment[];
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
      console.log('getEmbeddedComments result:', result);
      if ("success" in result) {
        console.log('Comments received:', result.comments);
        setComments(result.comments || []);
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

  const handleEditComment = async (commentPath: string, content: string) => {
    try {
      await editCommentAction(postId, postType, commentPath, content);
      // Refresh comments after editing
      await fetchComments();
    } catch (error) {
      console.error('Failed to edit comment:', error);
    }
  };

  const handleDeleteComment = async (commentPath: string) => {
    try {
      await deleteCommentAction(postId, postType, commentPath);
      // Refresh comments after deleting
      await fetchComments();
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const handleAddFavorite = async (commentPath: string) => {
    try {
      await addFavoriteAction(postId, postType, commentPath);
      // Refresh comments after adding favorite
      await fetchComments();
    } catch (error) {
      console.error('Failed to add favorite:', error);
    }
  };

  const handleRemoveFavorite = async (commentPath: string) => {
    try {
      await removeFavoriteAction(postId, postType, commentPath);
      // Refresh comments after removing favorite
      await fetchComments();
    } catch (error) {
      console.error('Failed to remove favorite:', error);
    }
  };

  const handleCheckFavorite = async (commentPath: string) => {
    try {
      const result = await checkFavoriteAction(postId, postType, commentPath);
      return result.isFavorited;
    } catch (error) {
      console.error('Failed to check favorite:', error);
      return false;
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
      onAddFavorite={handleAddFavorite}
      onRemoveFavorite={handleRemoveFavorite}
      onCheckFavorite={handleCheckFavorite}
      onCommentAdded={fetchComments}
    />
  );
} 