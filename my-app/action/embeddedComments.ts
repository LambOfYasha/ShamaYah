'use server';

import { getUser } from "@/lib/user/getUser";
import { adminClient } from "@/sanity/lib/adminClient";
import { defineQuery } from "groq";

export async function addEmbeddedComment(postId: string, postType: 'blog' | 'community', content: string, parentCommentId?: string) {
    try {
        const user = await getUser();
        
        if ("error" in user) {
            return { error: user.error };
        }

        const commentData = {
            content,
            author: {
                _type: 'reference',
                _ref: user._id,
            },
            authorId: user.id,
            authorUsername: user.username,
            authorRole: user.role,
            parentCommentId,
            replies: [],
            likes: 0,
            likedBy: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        // Get the current post
        const postQuery = defineQuery(`
            *[_type == $postType && _id == $postId][0] {
                _id,
                comments
            }
        `);

        const post = await adminClient.fetch(postQuery, { postId, postType });

        if (!post) {
            return { error: "Post not found" };
        }

        // Add the new comment to the comments array
        const updatedComments = post.comments || [];
        updatedComments.push(commentData);

        // Update the post with the new comment
        await adminClient.patch(postId).set({
            comments: updatedComments
        }).commit();

        return { success: true, comment: commentData };
    } catch (error) {
        console.error("Error adding embedded comment:", error);
        return { error: "Failed to add comment" };
    }
}

export async function editEmbeddedComment(postId: string, postType: 'blog' | 'community', commentIndex: number, content: string) {
    try {
        const user = await getUser();
        
        if ("error" in user) {
            return { error: user.error };
        }

        // Get the current post
        const postQuery = defineQuery(`
            *[_type == $postType && _id == $postId][0] {
                _id,
                comments
            }
        `);

        const post = await adminClient.fetch(postQuery, { postId, postType });

        if (!post) {
            return { error: "Post not found" };
        }

        const comments = post.comments || [];
        
        if (commentIndex >= comments.length) {
            return { error: "Comment not found" };
        }

        const comment = comments[commentIndex];
        
        // Check if user is the author of the comment
        if (comment.authorId !== user.id && user.role !== "admin" && user.role !== "teacher") {
            return { error: "You don't have permission to edit this comment" };
        }

        // Update the comment
        comments[commentIndex] = {
            ...comment,
            content,
            updatedAt: new Date().toISOString(),
        };

        // Update the post
        await adminClient.patch(postId).set({
            comments: comments
        }).commit();

        return { success: true, comment: comments[commentIndex] };
    } catch (error) {
        console.error("Error editing embedded comment:", error);
        return { error: "Failed to edit comment" };
    }
}

export async function deleteEmbeddedComment(postId: string, postType: 'blog' | 'community', commentIndex: number) {
    try {
        const user = await getUser();
        
        if ("error" in user) {
            return { error: user.error };
        }

        // Get the current post
        const postQuery = defineQuery(`
            *[_type == $postType && _id == $postId][0] {
                _id,
                comments
            }
        `);

        const post = await adminClient.fetch(postQuery, { postId, postType });

        if (!post) {
            return { error: "Post not found" };
        }

        const comments = post.comments || [];
        
        if (commentIndex >= comments.length) {
            return { error: "Comment not found" };
        }

        const comment = comments[commentIndex];
        
        // Check if user is the author of the comment or an admin
        if (comment.authorId !== user.id && user.role !== "admin") {
            return { error: "You don't have permission to delete this comment" };
        }

        // Remove the comment from the array
        comments.splice(commentIndex, 1);

        // Update the post
        await adminClient.patch(postId).set({
            comments: comments
        }).commit();

        return { success: true };
    } catch (error) {
        console.error("Error deleting embedded comment:", error);
        return { error: "Failed to delete comment" };
    }
}

export async function likeEmbeddedComment(postId: string, postType: 'blog' | 'community', commentIndex: number) {
    try {
        const user = await getUser();
        
        if ("error" in user) {
            return { error: user.error };
        }

        // Get the current post
        const postQuery = defineQuery(`
            *[_type == $postType && _id == $postId][0] {
                _id,
                comments
            }
        `);

        const post = await adminClient.fetch(postQuery, { postId, postType });

        if (!post) {
            return { error: "Post not found" };
        }

        const comments = post.comments || [];
        
        if (commentIndex >= comments.length) {
            return { error: "Comment not found" };
        }

        const comment = comments[commentIndex];
        const likedBy = comment.likedBy || [];
        const userLiked = likedBy.includes(user.id);

        if (userLiked) {
            // Unlike
            const newLikedBy = likedBy.filter(id => id !== user.id);
            comments[commentIndex] = {
                ...comment,
                likes: comment.likes - 1,
                likedBy: newLikedBy,
            };
        } else {
            // Like
            comments[commentIndex] = {
                ...comment,
                likes: comment.likes + 1,
                likedBy: [...likedBy, user.id],
            };
        }

        // Update the post
        await adminClient.patch(postId).set({
            comments: comments
        }).commit();

        return { success: true, liked: !userLiked };
    } catch (error) {
        console.error("Error liking embedded comment:", error);
        return { error: "Failed to like comment" };
    }
}

export async function getEmbeddedComments(postId: string, postType: 'blog' | 'community') {
    try {
        const postQuery = defineQuery(`
            *[_type == $postType && _id == $postId][0] {
                comments
            }
        `);

        const post = await adminClient.fetch(postQuery, { postId, postType });

        if (!post) {
            return { error: "Post not found" };
        }

        return { success: true, comments: post.comments || [] };
    } catch (error) {
        console.error("Error getting embedded comments:", error);
        return { error: "Failed to get comments" };
    }
} 