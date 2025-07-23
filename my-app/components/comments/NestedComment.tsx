'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRole } from '@/hooks/useRole'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Reply, MoreHorizontal, Edit, Trash2, Heart } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ReportButton } from '@/components/ui/report-button'
import { useModeration } from '@/hooks/useModeration'
import { ModerationFeedback } from '@/components/ui/moderation-feedback'
import { getImageUrl } from '@/lib/utils';

interface Comment {
  _id: string;
  content: string
  author: {
    _id: string
    username: string
    imageURL?: string
  }
  authorRole: string
  parentCommentId?: string
  replies?: Comment[]
  createdAt: string
  updatedAt?: string
}

interface NestedCommentProps {
  comment: Comment
  commentIndex: number
  postId: string
  postType: 'communityQuestion' | 'blogPost'
  onCommentAdded: () => void
  onAddComment: (content: string, parentCommentId?: string) => Promise<void>
  onEditComment: (commentPath: string, content: string) => Promise<void>
  onDeleteComment: (commentPath: string) => Promise<void>
  onAddFavorite: (commentPath: string) => Promise<void>
  onRemoveFavorite: (commentPath: string) => Promise<void>
  onCheckFavorite: (commentPath: string) => Promise<boolean>
  level?: number
  commentPath?: string
}

export default function NestedComment({ 
  comment, 
  commentIndex,
  postId, 
  postType, 
  onCommentAdded,
  onAddComment,
  onEditComment,
  onDeleteComment,
  onAddFavorite,
  onRemoveFavorite,
  onCheckFavorite,
  level = 0,
  commentPath
}: NestedCommentProps) {
  console.log('NestedComment received comment:', comment);
  console.log('NestedComment author data:', comment.author);
  
  const { user } = useUser()
  const { user: userWithRole } = useRole()
  const [isReplying, setIsReplying] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [editContent, setEditContent] = useState(comment.content)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [isCheckingFavorite, setIsCheckingFavorite] = useState(false)

  // Initialize moderation for replies
  const {
    content: moderatedReplyContent,
    updateContent: updateModeratedReplyContent,
    moderationState: replyModerationState,
    checkModeration: checkReplyModeration,
    clearModeration: clearReplyModeration,
    getModerationFeedback: getReplyModerationFeedback,
    canSubmit: canSubmitReply
  } = useModeration({
    contentType: 'comment',
    debounceMs: 1000,
    autoCheck: true
  });

  // Initialize moderation for edits
  const {
    content: moderatedEditContent,
    updateContent: updateModeratedEditContent,
    moderationState: editModerationState,
    checkModeration: checkEditModeration,
    clearModeration: clearEditModeration,
    getModerationFeedback: getEditModerationFeedback,
    canSubmit: canSubmitEdit
  } = useModeration({
    contentType: 'comment',
    debounceMs: 1000,
    autoCheck: true
  });

  // Update moderated content when reply changes
  const handleReplyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value;
    setReplyContent(content);
    updateModeratedReplyContent(content);
  };

  // Update moderated content when edit changes
  const handleEditChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value;
    setEditContent(content);
    updateModeratedEditContent(content);
  };

  // Check if comment is favorited when component mounts
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (user) {
        setIsCheckingFavorite(true)
        try {
          const favoritePath = level === 0 ? commentIndex.toString() : (commentPath || commentIndex.toString())
          console.log(`Checking favorite for comment path: "${favoritePath}" (level: ${level}, commentIndex: ${commentIndex}, commentPath: ${commentPath})`)
          const favorited = await onCheckFavorite(favoritePath)
          setIsFavorited(favorited)
        } catch (error) {
          console.error('Failed to check favorite status:', error)
        } finally {
          setIsCheckingFavorite(false)
        }
      }
    }

    checkFavoriteStatus()
  }, [user, commentIndex, commentPath, level, onCheckFavorite])

  const handleReply = async () => {
    if (!user || !replyContent.trim()) return

    // Check if content is appropriate before submitting
    if (!canSubmitReply) {
      alert('Please review the content guidelines before submitting.');
      return;
    }

    setIsSubmitting(true)
    try {
      // Create the path to this comment for the reply
      // For top-level comments, use just the commentIndex
      // For nested comments, use the commentPath (which already includes the full path)
      const replyPath = level === 0 ? commentIndex.toString() : (commentPath || commentIndex.toString())

      await onAddComment(replyContent, replyPath)
      setReplyContent('')
      clearReplyModeration()
      setIsReplying(false)
      onCommentAdded()
    } catch (error) {
      console.error('Failed to create reply:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = async () => {
    if (!editContent.trim()) return

    // Check if content is appropriate before submitting
    if (!canSubmitEdit) {
      alert('Please review the content guidelines before submitting.');
      return;
    }

    setIsSubmitting(true)
    try {
      // Create the path to this comment for editing
      const editPath = level === 0 ? commentIndex.toString() : (commentPath || commentIndex.toString())
      await onEditComment(editPath, editContent.trim())
      clearEditModeration()
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to edit comment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this comment?')) return

    setIsSubmitting(true)
    try {
      // Create the path to this comment for deletion
      const deletePath = level === 0 ? commentIndex.toString() : (commentPath || commentIndex.toString())
      await onDeleteComment(deletePath)
      onCommentAdded()
    } catch (error) {
      console.error('Failed to delete comment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleFavorite = async () => {
    if (!user) return

    setIsSubmitting(true)
    try {
      const favoritePath = level === 0 ? commentIndex.toString() : (commentPath || commentIndex.toString())
      console.log(`Toggling favorite for comment path: "${favoritePath}" (level: ${level}, commentIndex: ${commentIndex}, commentPath: ${commentPath})`)
      
      if (isFavorited) {
        await onRemoveFavorite(favoritePath)
        setIsFavorited(false)
      } else {
        await onAddFavorite(favoritePath)
        setIsFavorited(true)
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const canEdit = user && (comment.author._id === user.id || userWithRole?.role === 'admin' || userWithRole?.role === 'teacher' || userWithRole?.role === 'junior_teacher' || userWithRole?.role === 'senior_teacher' || userWithRole?.role === 'lead_teacher')
  const canDelete = user && (comment.author._id === user.id || userWithRole?.role === 'admin')
  const maxLevel = 3 // Maximum nesting level

  return (
    <div className={`${level > 0 ? 'ml-6 border-l-2 border-gray-200 pl-4' : ''}`}>
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
              {comment.author.imageURL && getImageUrl(comment.author.imageURL) ? (
                <AvatarImage 
                  src={getImageUrl(comment.author.imageURL)!} 
                  alt={comment.author.username}
                />
              ) : null}
              <AvatarFallback>
                {comment.author.username?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">
                    {comment.author.username}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {comment.author._id === user?.id ? 'You' : comment.authorRole}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleToggleFavorite}
                    disabled={isCheckingFavorite || isSubmitting}
                    className={`${isFavorited ? 'text-red-500' : 'text-gray-500'} hover:text-red-500`}
                  >
                    <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current' : ''}`} />
                  </Button>
                  
                  {user && level < maxLevel && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsReplying(!isReplying)}
                      disabled={isSubmitting}
                    >
                      <Reply className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {(canEdit || canDelete) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {canEdit && (
                          <DropdownMenuItem onClick={() => setIsEditing(!isEditing)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        {canDelete && (
                          <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  
                  <ReportButton 
                    contentType="comment"
                    contentId={comment._id}
                    size="sm"
                  />
                </div>
              </div>
              
              {isEditing ? (
                <div className="space-y-2">
                  <Textarea
                    value={editContent}
                    onChange={handleEditChange}
                    className="min-h-[80px]"
                    placeholder="Edit your comment..."
                  />
                  
                  {/* Moderation Feedback for Edit */}
                  {editContent.trim() && (
                    <div className="mt-2">
                      <ModerationFeedback
                        isChecking={editModerationState.isChecking}
                        result={editModerationState.result}
                        error={editModerationState.error}
                        showDetails={false}
                      />
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleEdit}
                      disabled={isSubmitting || !canSubmitEdit}
                    >
                      {isSubmitting ? 'Saving...' : 'Save'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsEditing(false)
                        setEditContent(comment.content)
                        clearEditModeration()
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 text-sm">{comment.content}</p>
              )}
              
              {isReplying && (
                <div className="mt-4 space-y-2">
                  <Textarea
                    placeholder="Write a reply..."
                    value={replyContent}
                    onChange={handleReplyChange}
                    className="min-h-[80px]"
                  />
                  
                  {/* Moderation Feedback for Reply */}
                  {replyContent.trim() && (
                    <div className="mt-2">
                      <ModerationFeedback
                        isChecking={replyModerationState.isChecking}
                        result={replyModerationState.result}
                        error={replyModerationState.error}
                        showDetails={false}
                      />
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleReply}
                      disabled={isSubmitting || !canSubmitReply}
                    >
                      {isSubmitting ? 'Posting...' : 'Post Reply'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsReplying(false)
                        setReplyContent('')
                        clearReplyModeration()
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Render nested replies */}
      {comment.replies && comment.replies.length > 0 && level < maxLevel && (
        <div className="space-y-2">
          {comment.replies.map((reply, replyIndex) => {
            const newCommentPath = level === 0 ? `${commentIndex}.${replyIndex}` : `${commentPath}.${replyIndex}`
            console.log(`Rendering reply with commentPath: "${newCommentPath}" (level: ${level}, commentIndex: ${commentIndex}, commentPath: ${commentPath}, replyIndex: ${replyIndex})`)
            return (
              <NestedComment
                key={`${reply.author._id}-${reply.createdAt}-${replyIndex}`}
                comment={reply}
                commentIndex={replyIndex}
                postId={postId}
                postType={postType}
                onCommentAdded={onCommentAdded}
                onAddComment={onAddComment}
                onEditComment={onEditComment}
                onDeleteComment={onDeleteComment}
                onAddFavorite={onAddFavorite}
                onRemoveFavorite={onRemoveFavorite}
                onCheckFavorite={onCheckFavorite}
                level={level + 1}
                commentPath={newCommentPath}
              />
            )
          })}
        </div>
      )}
    </div>
  )
} 