'use server';

import { getUser } from "@/lib/user/getUser";
import { adminClient } from "@/sanity/lib/adminClient";
import { defineQuery } from "groq";
import { sanityFetch } from "@/sanity/lib/live";

export async function addComment(
    postId: string,
    postType: 'community' | 'blog',
    content: string
) {
    try {
        const user = await getUser();

        if ("error" in user) {
            return { error: user.error };
        }

        // Create the comment document
        const commentDoc = {
            _type: "comment",
            content,
            author: {
                _type: "reference",
                _ref: user._id,
            },
            post: {
                _type: "reference",
                _ref: postId,
            },
            postType,
            createdAt: new Date().toISOString(),
            likes: 0,
            isLiked: false,
        };

        const createdComment = await adminClient.create(commentDoc);

        return { success: true, comment: createdComment };
    } catch (error) {
        console.error("Failed to add comment:", error);
        return { error: "Failed to add comment" };
    }
}

export async function editComment(
    commentId: string,
    content: string
) {
    try {
        const user = await getUser();

        if ("error" in user) {
            return { error: user.error };
        }

        // Check if user has permission to edit this comment
        const commentQuery = defineQuery(`
            *[_type == "comment" && _id == $commentId][0] {
                _id,
                author->{_id},
                content
            }
        `);

        const comment = await sanityFetch({
            query: commentQuery,
            params: { commentId },
        });

        if (!comment.data) {
            return { error: "Comment not found" };
        }

        // Check if user is the author or an admin
        if (comment.data.author?._id !== user._id && user.role !== "admin") {
            return { error: "You don't have permission to edit this comment" };
        }

        // Update the comment
        const updatedComment = await adminClient
            .patch(commentId)
            .set({
                content,
                updatedAt: new Date().toISOString(),
            })
            .commit();

        return { success: true, comment: updatedComment };
    } catch (error) {
        console.error("Failed to edit comment:", error);
        return { error: "Failed to edit comment" };
    }
}

export async function deleteComment(
    commentId: string
) {
    try {
        const user = await getUser();

        if ("error" in user) {
            return { error: user.error };
        }

        // Check if user has permission to delete this comment
        const commentQuery = defineQuery(`
            *[_type == "comment" && _id == $commentId][0] {
                _id,
                author->{_id}
            }
        `);

        const comment = await sanityFetch({
            query: commentQuery,
            params: { commentId },
        });

        if (!comment.data) {
            return { error: "Comment not found" };
        }

        // Check if user is the author or an admin
        if (comment.data.author?._id !== user._id && user.role !== "admin") {
            return { error: "You don't have permission to delete this comment" };
        }

        // Delete the comment
        await adminClient.delete(commentId);

        return { success: true };
    } catch (error) {
        console.error("Failed to delete comment:", error);
        return { error: "Failed to delete comment" };
    }
}

export async function likeComment(
    commentId: string
) {
    try {
        const user = await getUser();

        if ("error" in user) {
            return { error: user.error };
        }

        // Get the current comment
        const commentQuery = defineQuery(`
            *[_type == "comment" && _id == $commentId][0] {
                _id,
                likes,
                likedBy
            }
        `);

        const comment = await sanityFetch({
            query: commentQuery,
            params: { commentId },
        });

        if (!comment.data) {
            return { error: "Comment not found" };
        }

        const currentLikes = comment.data.likes || 0;
        const likedBy = comment.data.likedBy || [];
        const userLiked = likedBy.includes(user._id);

        // Toggle like
        const newLikes = userLiked ? currentLikes - 1 : currentLikes + 1;
        const newLikedBy = userLiked 
            ? likedBy.filter((id: string) => id !== user._id)
            : [...likedBy, user._id];

        // Update the comment
        const updatedComment = await adminClient
            .patch(commentId)
            .set({
                likes: newLikes,
                likedBy: newLikedBy,
            })
            .commit();

        return { 
            success: true, 
            comment: updatedComment,
            isLiked: !userLiked,
            likes: newLikes
        };
    } catch (error) {
        console.error("Failed to like comment:", error);
        return { error: "Failed to like comment" };
    }
}

export async function getComments(
    postId: string,
    postType: 'community' | 'blog'
) {
    try {
        const user = await getUser();
        const userId = user && !("error" in user) ? user._id : null;

        const commentsQuery = defineQuery(`
            *[_type == "comment" && post._ref == $postId && postType == $postType] | order(createdAt asc) {
                _id,
                content,
                createdAt,
                updatedAt,
                likes,
                "author": author->{
                    _id,
                    username,
                    imageURL
                },
                "isLiked": $userId in likedBy
            }
        `);

        const comments = await sanityFetch({
            query: commentsQuery,
            params: { postId, postType, userId },
        });

        return { success: true, comments: comments.data || [] };
    } catch (error) {
        console.error("Failed to get comments:", error);
        return { error: "Failed to get comments" };
    }
} 