'use server'

import { auth } from '@clerk/nextjs/server'
import { createClient } from '@sanity/client'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_ADMIN_API_TOKEN,
  useCdn: false,
})

interface CreateCommentParams {
  content: string
  postId: string
  postType: 'communityQuestion' | 'blog'
  parentCommentId?: string
}

export async function createComment({
  content,
  postId,
  postType,
  parentCommentId,
}: CreateCommentParams) {
  try {
    const { userId } = await auth()
    if (!userId) {
      throw new Error('Unauthorized')
    }

    // Get user details from Clerk
    const user = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
      },
    }).then(res => res.json())

    // Check if user exists in Sanity, create if not
    let sanityUser = await client.fetch(
      `*[_type == "user" && clerkId == $clerkId][0]`,
      { clerkId: userId }
    )

    if (!sanityUser) {
      sanityUser = await client.create({
        _type: 'user',
        clerkId: userId,
        name: user.first_name && user.last_name 
          ? `${user.first_name} ${user.last_name}`
          : user.username || 'Unknown User',
        email: user.email_addresses?.[0]?.email_address || '',
        image: user.image_url,
      })
    }

    const commentData: any = {
      _type: 'comment',
      content,
      author: {
        _type: 'reference',
        _ref: sanityUser._id,
      },
      post: {
        _type: 'reference',
        _ref: postId,
      },
      createdAt: new Date().toISOString(),
    }

    // Add parent comment reference if this is a reply
    if (parentCommentId) {
      commentData.parentComment = {
        _type: 'reference',
        _ref: parentCommentId,
      }
    }

    const comment = await client.create(commentData)

    // If this is a reply, update the parent comment's replies array
    if (parentCommentId) {
      await client
        .patch(parentCommentId)
        .setIfMissing({ replies: [] })
        .append('replies', [{
          _type: 'reference',
          _ref: comment._id,
        }])
        .commit()
    }

    return { success: true, comment }
  } catch (error) {
    console.error('Error creating comment:', error)
    throw new Error('Failed to create comment')
  }
}

export async function getComments(postId: string, postType: 'communityQuestion' | 'blog') {
  try {
    const comments = await client.fetch(`
      *[_type == "comment" && post._ref == $postId && !defined(parentComment)] | order(createdAt desc) {
        _id,
        content,
        createdAt,
        updatedAt,
        author->{
          _id,
          name,
          image
        },
        replies[]->{
          _id,
          content,
          createdAt,
          updatedAt,
          author->{
            _id,
            name,
            image
          },
          replies[]->{
            _id,
            content,
            createdAt,
            updatedAt,
            author->{
              _id,
              name,
              image
            }
          }
        }
      }
    `, { postId })

    return comments
  } catch (error) {
    console.error('Error fetching comments:', error)
    return []
  }
} 