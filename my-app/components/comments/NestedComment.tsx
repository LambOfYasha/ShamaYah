'use client'

import { useState } from 'react'
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


interface Comment {
  content: string
  author: {
    _type: 'reference'
    _ref: string
  }
  authorId: string
  authorUsername: string
  authorRole: string
  parentCommentId?: string
  replies: Comment[]
  likes: number
  likedBy: string[]
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
  onLikeComment: (commentPath: string) => Promise<void>
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
  onLikeComment,
  level = 0,
  commentPath
}: NestedCommentProps) {
  const { user } = useUser()
  const { user: userWithRole } = useRole()
  const [isReplying, setIsReplying] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [editContent, setEditContent] = useState(comment.content)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleReply = async () => {
    if (!user || !replyContent.trim()) return

    setIsSubmitting(true)
    try {
      // Create the path to this comment for the reply
      // For top-level comments, use just the commentIndex
      // For nested comments, use the commentPath (which already includes the full path)
      const replyPath = level === 0 ? commentIndex.toString() : (commentPath || commentIndex.toString())

      await onAddComment(replyContent, replyPath)
      setReplyContent('')
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

    setIsSubmitting(true)
    try {
      // Create the path to this comment for editing
      const editPath = level === 0 ? commentIndex.toString() : (commentPath || commentIndex.toString())
      await onEditComment(editPath, editContent.trim())
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

  const canEdit = user && (comment.authorId === user.id || userWithRole?.role === 'admin' || userWithRole?.role === 'teacher')
  const canDelete = user && (comment.authorId === user.id || userWithRole?.role === 'admin')
  const maxLevel = 3 // Maximum nesting level

  return (
    <div className={`${level > 0 ? 'ml-6 border-l-2 border-gray-200 pl-4' : ''}`}>
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={comment.authorUsername} />
              <AvatarFallback>
                {comment.authorUsername?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">
                    {comment.authorUsername}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {comment.authorId === user?.id ? 'You' : comment.authorRole}
                  </Badge>
                </div>
                
                {(canEdit || canDelete) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 px-2">
                        <MoreHorizontal className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {canEdit && (
                        <DropdownMenuItem onClick={() => setIsEditing(true)}>
                          <Edit className="h-3 w-3 mr-2" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      {canDelete && (
                        <DropdownMenuItem 
                          onClick={handleDelete}
                          className="text-red-600"
                        >
                          <Trash2 className="h-3 w-3 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              
              {isEditing ? (
                <div className="space-y-2">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleEdit}
                      disabled={isSubmitting || !editContent.trim()}
                    >
                      {isSubmitting ? 'Saving...' : 'Save'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsEditing(false)
                        setEditContent(comment.content)
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-700 mb-3">
                    {comment.content}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                    {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                      <span className="text-xs text-gray-400">
                        (edited)
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const likePath = level === 0 ? commentIndex.toString() : (commentPath || commentIndex.toString())
                        onLikeComment(likePath)
                      }}
                      className="flex items-center gap-1"
                    >
                      <Heart className={`w-4 h-4 ${comment.likedBy.includes(user?.id || '') ? 'text-red-500 fill-current' : ''}`} />
                      {comment.likes}
                    </Button>
                    {level < maxLevel && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsReplying(!isReplying)}
                        className="h-8 px-2 text-xs"
                      >
                        <Reply className="h-3 w-3 mr-1" />
                        Reply
                      </Button>
                    )}
                  </div>
                </>
              )}
              
              {isReplying && (
                <div className="mt-4 space-y-2">
                  <Textarea
                    placeholder="Write a reply..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleReply}
                      disabled={isSubmitting || !replyContent.trim()}
                    >
                      {isSubmitting ? 'Posting...' : 'Post Reply'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsReplying(false)
                        setReplyContent('')
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
          {comment.replies.map((reply, replyIndex) => (
            <NestedComment
              key={`${reply.authorId}-${reply.createdAt}-${replyIndex}`}
              comment={reply}
              commentIndex={replyIndex}
              postId={postId}
              postType={postType}
              onCommentAdded={onCommentAdded}
              onAddComment={onAddComment}
              onEditComment={onEditComment}
              onDeleteComment={onDeleteComment}
              onLikeComment={onLikeComment}
              level={level + 1}
              commentPath={commentPath ? `${commentPath}.${commentIndex}` : commentIndex.toString()}
            />
          ))}
        </div>
      )}
    </div>
  )
} 