'use server';

import { getUser } from "@/lib/user/getUser";
import { adminClient } from "@/sanity/lib/adminClient";
import { defineQuery } from "groq";

export async function addEmbeddedComment(postId: string, postType: 'blog' | 'community', content: string, parentCommentPath?: string) {
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
            parentCommentId: parentCommentPath,
            replies: [],
            likes: 0,
            likedBy: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        // Map postType to actual Sanity document type
        const sanityPostType = postType === 'community' ? 'communityQuestion' : postType;
        
        // Get the current post
        const postQuery = defineQuery(`
            *[_type == $sanityPostType && _id == $postId][0] {
                _id,
                comments
            }
        `);

        const post = await adminClient.fetch(postQuery, { postId, sanityPostType });

        if (!post) {
            return { error: "Post not found" };
        }

        const updatedComments = post.comments || [];
        
        if (parentCommentPath) {
            // Parse the parent comment path (e.g., "0" for first comment, "0.1" for first reply of first comment)
            const pathParts = parentCommentPath.split('.');
            const parentIndex = parseInt(pathParts[0]);
            

            
            if (parentIndex >= 0 && parentIndex < updatedComments.length) {
                const parentComment = updatedComments[parentIndex];
                if (pathParts.length === 1) {
                    // Reply to top-level comment
                    const replies = parentComment.replies || [];
                    replies.push(commentData);
                    updatedComments[parentIndex] = {
                        ...parentComment,
                        replies: replies
                    };
                } else {
                    // For now, let's only support one level of nesting to keep it simple
                    // Reply to a reply of a top-level comment
                    const replyIndex = parseInt(pathParts[1]);
                    if (parentComment.replies && replyIndex < parentComment.replies.length) {
                        const targetReply = parentComment.replies[replyIndex];
                        const replies = targetReply.replies || [];
                        replies.push(commentData);
                        
                        const updatedReplies = [...parentComment.replies];
                        updatedReplies[replyIndex] = {
                            ...targetReply,
                            replies: replies
                        };
                        
                        updatedComments[parentIndex] = {
                            ...parentComment,
                            replies: updatedReplies
                        };
                    } else {
                        return { error: "Parent comment not found" };
                    }
                }
            } else {
                return { error: "Parent comment not found" };
            }
        } else {
            // This is a top-level comment
            updatedComments.push(commentData);
        }

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

export async function editEmbeddedComment(postId: string, postType: 'blog' | 'community', commentPath: string, content: string) {
    try {
        const user = await getUser();
        
        if ("error" in user) {
            return { error: user.error };
        }

        // Map postType to actual Sanity document type
        const sanityPostType = postType === 'community' ? 'communityQuestion' : postType;
        
        // Get the current post
        const postQuery = defineQuery(`
            *[_type == $sanityPostType && _id == $postId][0] {
                _id,
                comments
            }
        `);

        const post = await adminClient.fetch(postQuery, { postId, sanityPostType });

        if (!post) {
            return { error: "Post not found" };
        }

        const comments = post.comments || [];
        
        // Parse the comment path
        const pathParts = commentPath.split('.');
        const parentIndex = parseInt(pathParts[0]);
        
        if (parentIndex >= 0 && parentIndex < comments.length) {
            const parentComment = comments[parentIndex];
            
            if (pathParts.length === 1) {
                // Editing a top-level comment
                const comment = parentComment;
                
                // Check if user is the author of the comment
                if (comment.authorId !== user.id && user.role !== "admin" && user.role !== "teacher") {
                    return { error: "You don't have permission to edit this comment" };
                }

                // Update the comment
                comments[parentIndex] = {
                    ...comment,
                    content,
                    updatedAt: new Date().toISOString(),
                };
            } else {
                // Editing a nested comment
                const replyIndex = parseInt(pathParts[1]);
                if (parentComment.replies && replyIndex < parentComment.replies.length) {
                    const targetReply = parentComment.replies[replyIndex];
                    
                    // Check if user is the author of the comment
                    if (targetReply.authorId !== user.id && user.role !== "admin" && user.role !== "teacher") {
                        return { error: "You don't have permission to edit this comment" };
                    }

                    // Update the reply
                    const updatedReplies = [...parentComment.replies];
                    updatedReplies[replyIndex] = {
                        ...targetReply,
                        content,
                        updatedAt: new Date().toISOString(),
                    };
                    
                    comments[parentIndex] = {
                        ...parentComment,
                        replies: updatedReplies
                    };
                } else {
                    return { error: "Comment not found" };
                }
            }
        } else {
            return { error: "Comment not found" };
        }

        // Update the post
        await adminClient.patch(postId).set({
            comments: comments
        }).commit();

        return { success: true };
    } catch (error) {
        console.error("Error editing embedded comment:", error);
        return { error: "Failed to edit comment" };
    }
}

export async function deleteEmbeddedComment(postId: string, postType: 'blog' | 'community', commentPath: string) {
    try {
        const user = await getUser();
        
        if ("error" in user) {
            return { error: user.error };
        }

        // Map postType to actual Sanity document type
        const sanityPostType = postType === 'community' ? 'communityQuestion' : postType;
        
        // Get the current post
        const postQuery = defineQuery(`
            *[_type == $sanityPostType && _id == $postId][0] {
                _id,
                comments
            }
        `);

        const post = await adminClient.fetch(postQuery, { postId, sanityPostType });

        if (!post) {
            return { error: "Post not found" };
        }

        const comments = post.comments || [];
        
        // Parse the comment path
        const pathParts = commentPath.split('.');
        const parentIndex = parseInt(pathParts[0]);
        
        if (parentIndex >= 0 && parentIndex < comments.length) {
            const parentComment = comments[parentIndex];
            
            if (pathParts.length === 1) {
                // Deleting a top-level comment
                const comment = parentComment;
                
                // Check if user is the author of the comment or an admin
                if (comment.authorId !== user.id && user.role !== "admin") {
                    return { error: "You don't have permission to delete this comment" };
                }

                // Remove the comment from the array
                comments.splice(parentIndex, 1);
            } else {
                // Deleting a nested comment
                const replyIndex = parseInt(pathParts[1]);
                if (parentComment.replies && replyIndex < parentComment.replies.length) {
                    const targetReply = parentComment.replies[replyIndex];
                    
                    // Check if user is the author of the comment or an admin
                    if (targetReply.authorId !== user.id && user.role !== "admin") {
                        return { error: "You don't have permission to delete this comment" };
                    }

                    // Remove the reply from the array
                    const updatedReplies = [...parentComment.replies];
                    updatedReplies.splice(replyIndex, 1);
                    
                    comments[parentIndex] = {
                        ...parentComment,
                        replies: updatedReplies
                    };
                } else {
                    return { error: "Comment not found" };
                }
            }
        } else {
            return { error: "Comment not found" };
        }

        // Clean up favorites for the deleted comment
        console.log("Cleaning up favorites for deleted comment:", commentPath);
        const cleanupResult = await cleanupFavoritesForDeletedComment(postId, commentPath);
        if ("error" in cleanupResult) {
            console.warn("Warning: Failed to cleanup favorites for comment:", cleanupResult.error);
        } else {
            console.log(`Cleaned up ${cleanupResult.cleanedCount} favorites for comment:`, commentPath);
        }

        // Update comment paths for remaining comments that were affected by the deletion
        if (pathParts.length === 1) {
            // For top-level comment deletion, update paths of subsequent comments
            const deletedIndex = parentIndex;
            for (let i = deletedIndex; i < comments.length; i++) {
                const oldPath = i.toString();
                const newPath = (i - 1).toString();
                
                if (i > deletedIndex) {
                    console.log(`Updating comment path from ${oldPath} to ${newPath}`);
                    const updateResult = await updateCommentPathFavorites(postId, oldPath, newPath);
                    if ("error" in updateResult) {
                        console.warn("Warning: Failed to update comment path favorites:", updateResult.error);
                    } else {
                        console.log(`Updated ${updateResult.updatedCount} favorites for path change`);
                    }
                }
            }
        } else {
            // For nested comment deletion, update paths of subsequent replies
            const replyIndex = parseInt(pathParts[1]);
            const parentComment = comments[parentIndex];
            
            if (parentComment.replies && replyIndex < parentComment.replies.length) {
                for (let i = replyIndex; i < parentComment.replies.length; i++) {
                    const oldPath = `${parentIndex}.${i}`;
                    const newPath = `${parentIndex}.${i - 1}`;
                    
                    if (i > replyIndex) {
                        console.log(`Updating reply path from ${oldPath} to ${newPath}`);
                        const updateResult = await updateCommentPathFavorites(postId, oldPath, newPath);
                        if ("error" in updateResult) {
                            console.warn("Warning: Failed to update reply path favorites:", updateResult.error);
                        } else {
                            console.log(`Updated ${updateResult.updatedCount} favorites for reply path change`);
                        }
                    }
                }
            }
        }

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

export async function addFavorite(postId: string, postType: 'blog' | 'community', commentPath: string) {
    try {
        const user = await getUser();
        
        if ("error" in user) {
            return { error: user.error };
        }

        // Map postType to actual Sanity document type
        const sanityPostType = postType === 'community' ? 'communityQuestion' : postType;
        
        // Get the current post to find the comment
        const postQuery = defineQuery(`
            *[_type == $sanityPostType && _id == $postId][0] {
                _id,
                comments
            }
        `);

        const post = await adminClient.fetch(postQuery, { postId, sanityPostType });

        if (!post) {
            return { error: "Post not found" };
        }

        const comments = post.comments || [];
        
        // Parse the comment path
        const pathParts = commentPath.split('.');
        const parentIndex = parseInt(pathParts[0]);
        
        if (parentIndex >= 0 && parentIndex < comments.length) {
            const parentComment = comments[parentIndex];
            
            let targetComment;
            if (pathParts.length === 1) {
                // Favoriting a top-level comment
                targetComment = parentComment;
            } else {
                // Favoriting a nested comment
                const replyIndex = parseInt(pathParts[1]);
                if (parentComment.replies && replyIndex < parentComment.replies.length) {
                    targetComment = parentComment.replies[replyIndex];
                } else {
                    return { error: "Comment not found" };
                }
            }

            // Check if favorite already exists using post ID and comment path
            const existingFavoriteQuery = defineQuery(`
                *[_type == "favorite" && user._ref == $userId && post._ref == $postId && commentPath == $commentPath && isActive == true][0] {
                    _id
                }
            `);

            const existingFavorite = await adminClient.fetch(existingFavoriteQuery, { 
                userId: user._id, 
                postId: postId,
                commentPath: commentPath
            });

            if (existingFavorite) {
                return { error: "Comment already favorited" };
            }

            // Create the favorite document
            const favoriteDoc = {
                _type: "favorite",
                user: {
                    _type: "reference",
                    _ref: user._id,
                },
                post: {
                    _type: "reference",
                    _ref: postId,
                },
                commentPath: commentPath,
                savedAt: new Date().toISOString(),
                isActive: true,
            };

            const createdFavorite = await adminClient.create(favoriteDoc);

            return { success: true, favorite: createdFavorite };
        } else {
            return { error: "Comment not found" };
        }
    } catch (error) {
        console.error("Error adding favorite:", error);
        return { error: "Failed to add favorite" };
    }
}

export async function removeFavorite(postId: string, postType: 'blog' | 'community', commentPath: string) {
    try {
        const user = await getUser();
        
        if ("error" in user) {
            return { error: user.error };
        }

        // Map postType to actual Sanity document type
        const sanityPostType = postType === 'community' ? 'communityQuestion' : postType;
        
        // Get the current post to find the comment
        const postQuery = defineQuery(`
            *[_type == $sanityPostType && _id == $postId][0] {
                _id,
                comments
            }
        `);

        const post = await adminClient.fetch(postQuery, { postId, sanityPostType });

        if (!post) {
            return { error: "Post not found" };
        }

        const comments = post.comments || [];
        
        // Parse the comment path
        const pathParts = commentPath.split('.');
        const parentIndex = parseInt(pathParts[0]);
        
        if (parentIndex >= 0 && parentIndex < comments.length) {
            const parentComment = comments[parentIndex];
            
            let targetComment;
            if (pathParts.length === 1) {
                // Unfavoriting a top-level comment
                targetComment = parentComment;
            } else {
                // Unfavoriting a nested comment
                const replyIndex = parseInt(pathParts[1]);
                if (parentComment.replies && replyIndex < parentComment.replies.length) {
                    targetComment = parentComment.replies[replyIndex];
                } else {
                    return { error: "Comment not found" };
                }
            }

            // Find and deactivate the favorite
            const favoriteQuery = defineQuery(`
                *[_type == "favorite" && user._ref == $userId && post._ref == $postId && commentPath == $commentPath && isActive == true][0] {
                    _id
                }
            `);

            const favorite = await adminClient.fetch(favoriteQuery, { 
                userId: user._id, 
                postId: postId,
                commentPath: commentPath
            });

            if (!favorite) {
                return { error: "Favorite not found" };
            }

            // Deactivate the favorite
            await adminClient
                .patch(favorite._id)
                .set({ isActive: false })
                .commit();

            return { success: true };
        } else {
            return { error: "Comment not found" };
        }
    } catch (error) {
        console.error("Error removing favorite:", error);
        return { error: "Failed to remove favorite" };
    }
}

export async function checkFavorite(postId: string, postType: 'blog' | 'community', commentPath: string) {
    try {
        const user = await getUser();
        
        if ("error" in user) {
            return { error: user.error };
        }

        // Map postType to actual Sanity document type
        const sanityPostType = postType === 'community' ? 'communityQuestion' : postType;
        
        // Get the current post to find the comment
        const postQuery = defineQuery(`
            *[_type == $sanityPostType && _id == $postId][0] {
                _id,
                comments
            }
        `);

        const post = await adminClient.fetch(postQuery, { postId, sanityPostType });

        if (!post) {
            return { error: "Post not found" };
        }

        const comments = post.comments || [];
        
        // Parse the comment path
        const pathParts = commentPath.split('.');
        const parentIndex = parseInt(pathParts[0]);
        
        if (parentIndex >= 0 && parentIndex < comments.length) {
            const parentComment = comments[parentIndex];
            
            let targetComment;
            if (pathParts.length === 1) {
                // Checking a top-level comment
                targetComment = parentComment;
            } else {
                // Checking a nested comment
                const replyIndex = parseInt(pathParts[1]);
                if (parentComment.replies && replyIndex < parentComment.replies.length) {
                    targetComment = parentComment.replies[replyIndex];
                } else {
                    return { error: "Comment not found" };
                }
            }

            // Check if favorite exists
            const favoriteQuery = defineQuery(`
                *[_type == "favorite" && user._ref == $userId && post._ref == $postId && commentPath == $commentPath && isActive == true][0] {
                    _id
                }
            `);

            const favorite = await adminClient.fetch(favoriteQuery, { 
                userId: user._id, 
                postId: postId,
                commentPath: commentPath
            });

            return { success: true, isFavorited: !!favorite };
        } else {
            return { error: "Comment not found" };
        }
    } catch (error) {
        console.error("Error checking favorite:", error);
        return { error: "Failed to check favorite" };
    }
}

export async function getEmbeddedComments(postId: string, postType: 'blog' | 'community') {
    try {
        // Map postType to actual Sanity document type
        const sanityPostType = postType === 'community' ? 'communityQuestion' : postType;
        
        const postQuery = defineQuery(`
            *[_type == $sanityPostType && _id == $postId][0] {
                comments
            }
        `);

        const post = await adminClient.fetch(postQuery, { postId, sanityPostType });

        if (!post) {
            return { error: "Post not found" };
        }

        // Ensure all comments have proper structure for replies
        const comments = post.comments || [];
        const structuredComments = comments.map(comment => ({
            ...comment,
            replies: comment.replies || []
        }));

        return { success: true, comments: structuredComments };
    } catch (error) {
        console.error("Error getting embedded comments:", error);
        return { error: "Failed to get comments" };
    }
}

// Post-level favorite functions
export async function addPostFavorite(postId: string, postType: 'blog' | 'community' | 'response') {
    try {
        const user = await getUser();
        
        if ("error" in user) {
            return { error: user.error };
        }

        // Map postType to actual Sanity document type
        const sanityPostType = postType === 'community' ? 'communityQuestion' : postType === 'response' ? 'post' : postType;
        
        // Check if post exists
        const postQuery = defineQuery(`
            *[_type == $sanityPostType && _id == $postId][0] {
                _id
            }
        `);

        const post = await adminClient.fetch(postQuery, { postId, sanityPostType });

        if (!post) {
            return { error: "Post not found" };
        }

        // Check if favorite already exists
        const existingFavoriteQuery = defineQuery(`
            *[_type == "favorite" && user._ref == $userId && post._ref == $postId && isActive == true][0] {
                _id
            }
        `);

        const existingFavorite = await adminClient.fetch(existingFavoriteQuery, { 
            userId: user._id, 
            postId: postId
        });

        if (existingFavorite) {
            return { error: "Post already favorited" };
        }

        // Create the favorite document
        const favoriteDoc = {
            _type: "favorite",
            user: {
                _type: "reference",
                _ref: user._id,
            },
            post: {
                _type: "reference",
                _ref: postId,
            },
            savedAt: new Date().toISOString(),
            isActive: true,
        };

        const createdFavorite = await adminClient.create(favoriteDoc);

        return { success: true, favorite: createdFavorite };
    } catch (error) {
        console.error("Error adding post favorite:", error);
        return { error: "Failed to add post favorite" };
    }
}

export async function removePostFavorite(postId: string, postType: 'blog' | 'community' | 'response') {
    try {
        const user = await getUser();
        
        if ("error" in user) {
            return { error: user.error };
        }

        // Find and deactivate the favorite
        const favoriteQuery = defineQuery(`
            *[_type == "favorite" && user._ref == $userId && post._ref == $postId && isActive == true][0] {
                _id
            }
        `);

        const favorite = await adminClient.fetch(favoriteQuery, { 
            userId: user._id, 
            postId: postId
        });

        if (!favorite) {
            return { error: "Post favorite not found" };
        }

        // Deactivate the favorite
        await adminClient
            .patch(favorite._id)
            .set({ isActive: false })
            .commit();

        return { success: true };
    } catch (error) {
        console.error("Error removing post favorite:", error);
        return { error: "Failed to remove post favorite" };
    }
}

export async function checkPostFavorite(postId: string, postType: 'blog' | 'community' | 'response') {
    try {
        const user = await getUser();
        
        if ("error" in user) {
            return { error: user.error };
        }

        // Check if favorite exists
        const favoriteQuery = defineQuery(`
            *[_type == "favorite" && user._ref == $userId && post._ref == $postId && isActive == true][0] {
                _id
            }
        `);

        const favorite = await adminClient.fetch(favoriteQuery, { 
            userId: user._id, 
            postId: postId
        });

        return { success: true, isFavorited: !!favorite };
    } catch (error) {
        console.error("Error checking post favorite:", error);
        return { error: "Failed to check post favorite" };
    }
}

export async function getUserFavorites() {
    try {
        const user = await getUser();
        
        if ("error" in user) {
            return { error: user.error };
        }

        // Get all active favorites for the user
        const favoritesQuery = defineQuery(`
            *[_type == "favorite" && user._ref == $userId && isActive == true] {
                _id,
                savedAt,
                commentPath,
                post->{
                    _id,
                    _type,
                    title,
                    description,
                    slug,
                    image,
                    author->{
                        _id,
                        username,
                        imageURL
                    },
                    moderator->{
                        _id,
                        username,
                        imageURL
                    }
                }
            } | order(savedAt desc)
        `);

        const favorites = await adminClient.fetch(favoritesQuery, { 
            userId: user._id
        });

        return { success: true, favorites };
    } catch (error) {
        console.error("Error getting user favorites:", error);
        return { error: "Failed to get user favorites" };
    }
}

// Cleanup functions for when posts or comments are deleted
export async function cleanupFavoritesForDeletedPost(postId: string) {
    try {
        console.log("Cleaning up favorites for deleted post:", postId);
        
        // Find all favorites for this post (both post-level and comment-level)
        const favoritesQuery = defineQuery(`
            *[_type == "favorite" && post._ref == $postId && isActive == true] {
                _id
            }
        `);

        const favorites = await adminClient.fetch(favoritesQuery, { postId });

        if (favorites && favorites.length > 0) {
            console.log(`Found ${favorites.length} favorites to deactivate for post:`, postId);
            
            // Deactivate all favorites for this post
            for (const favorite of favorites) {
                await adminClient
                    .patch(favorite._id)
                    .set({ isActive: false })
                    .commit();
            }
            
            console.log(`Successfully deactivated ${favorites.length} favorites for post:`, postId);
        } else {
            console.log("No favorites found for post:", postId);
        }

        return { success: true, cleanedCount: favorites?.length || 0 };
    } catch (error) {
        console.error("Error cleaning up favorites for deleted post:", error);
        return { error: "Failed to cleanup favorites for deleted post" };
    }
}

export async function cleanupFavoritesForDeletedComment(postId: string, commentPath: string) {
    try {
        console.log("Cleaning up favorites for deleted comment:", commentPath, "in post:", postId);
        
        // Find all favorites for this specific comment
        const favoritesQuery = defineQuery(`
            *[_type == "favorite" && post._ref == $postId && commentPath == $commentPath && isActive == true] {
                _id
            }
        `);

        const favorites = await adminClient.fetch(favoritesQuery, { 
            postId, 
            commentPath 
        });

        if (favorites && favorites.length > 0) {
            console.log(`Found ${favorites.length} favorites to deactivate for comment:`, commentPath);
            
            // Deactivate all favorites for this comment
            for (const favorite of favorites) {
                await adminClient
                    .patch(favorite._id)
                    .set({ isActive: false })
                    .commit();
            }
            
            console.log(`Successfully deactivated ${favorites.length} favorites for comment:`, commentPath);
        } else {
            console.log("No favorites found for comment:", commentPath);
        }

        return { success: true, cleanedCount: favorites?.length || 0 };
    } catch (error) {
        console.error("Error cleaning up favorites for deleted comment:", error);
        return { error: "Failed to cleanup favorites for deleted comment" };
    }
}

export async function updateCommentPathFavorites(postId: string, oldCommentPath: string, newCommentPath: string) {
    try {
        console.log("Updating comment path favorites from:", oldCommentPath, "to:", newCommentPath);
        
        // Find all favorites for the old comment path
        const favoritesQuery = defineQuery(`
            *[_type == "favorite" && post._ref == $postId && commentPath == $oldCommentPath && isActive == true] {
                _id
            }
        `);

        const favorites = await adminClient.fetch(favoritesQuery, { 
            postId, 
            oldCommentPath 
        });

        if (favorites && favorites.length > 0) {
            console.log(`Found ${favorites.length} favorites to update for comment path change`);
            
            // Update all favorites to use the new comment path
            for (const favorite of favorites) {
                await adminClient
                    .patch(favorite._id)
                    .set({ commentPath: newCommentPath })
                    .commit();
            }
            
            console.log(`Successfully updated ${favorites.length} favorites for comment path change`);
        } else {
            console.log("No favorites found for comment path:", oldCommentPath);
        }

        return { success: true, updatedCount: favorites?.length || 0 };
    } catch (error) {
        console.error("Error updating comment path favorites:", error);
        return { error: "Failed to update comment path favorites" };
    }
}

export async function deleteIndividualFavorite(favoriteId: string) {
    try {
        const user = await getUser();
        
        if ("error" in user) {
            return { error: user.error };
        }

        // Check if the favorite exists and belongs to the current user
        const favoriteQuery = defineQuery(`
            *[_type == "favorite" && _id == $favoriteId && user._ref == $userId && isActive == true][0] {
                _id
            }
        `);

        const favorite = await adminClient.fetch(favoriteQuery, { 
            favoriteId, 
            userId: user._id 
        });

        if (!favorite) {
            return { error: "Favorite not found or you don't have permission to delete it" };
        }

        // Deactivate the favorite
        await adminClient
            .patch(favoriteId)
            .set({ isActive: false })
            .commit();

        console.log("Successfully deleted favorite:", favoriteId);
        return { success: true };
    } catch (error) {
        console.error("Error deleting individual favorite:", error);
        return { error: "Failed to delete favorite" };
    }
}

export async function clearAllFavorites() {
    try {
        const user = await getUser();
        
        if ("error" in user) {
            return { error: user.error };
        }

        // Find all active favorites for the current user
        const favoritesQuery = defineQuery(`
            *[_type == "favorite" && user._ref == $userId && isActive == true] {
                _id
            }
        `);

        const favorites = await adminClient.fetch(favoritesQuery, { 
            userId: user._id 
        });

        if (favorites && favorites.length > 0) {
            console.log(`Found ${favorites.length} favorites to clear for user:`, user._id);
            
            // Deactivate all favorites for the user
            for (const favorite of favorites) {
                await adminClient
                    .patch(favorite._id)
                    .set({ isActive: false })
                    .commit();
            }
            
            console.log(`Successfully cleared ${favorites.length} favorites for user:`, user._id);
        } else {
            console.log("No favorites found for user:", user._id);
        }

        return { success: true, clearedCount: favorites?.length || 0 };
    } catch (error) {
        console.error("Error clearing all favorites:", error);
        return { error: "Failed to clear all favorites" };
    }
} 