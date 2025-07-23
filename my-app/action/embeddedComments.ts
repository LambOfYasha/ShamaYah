'use server';

import { getUser } from "@/lib/user/getUser";
import { adminClient } from "@/sanity/lib/adminClient";
import { defineQuery } from "groq";
import { client } from "@/sanity/lib/client";

export async function addEmbeddedComment(postId: string, postType: 'blog' | 'community', content: string, parentCommentPath?: string) {
    try {
        const user = await getUser();
        
        if ("error" in user) {
            return { error: user.error };
        }

        const commentData = {
            content,
            author: {
                _id: user._id,
                username: user.username,
                imageURL: user.imageURL,
              },
            authorRole: user.role,
            parentCommentId: parentCommentPath,
            replies: [],
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
                if (comment.author._id !== user._id && user.role !== "admin" && user.role !== "teacher" && user.role !== "junior_teacher" && user.role !== "senior_teacher" && user.role !== "lead_teacher") {
                    return { error: "You don't have permission to edit this comment" };
                }

                // Junior teachers can only edit member content, not teacher content
                if (user.role === "junior_teacher" && comment.author._id !== user._id && comment.author.role && ["teacher", "junior_teacher", "senior_teacher", "lead_teacher"].includes(comment.author.role)) {
                    return { error: "Junior teachers cannot edit content from other teachers" };
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
                    if (targetReply.author._id !== user._id && user.role !== "admin" && user.role !== "teacher" && user.role !== "junior_teacher" && user.role !== "senior_teacher" && user.role !== "lead_teacher") {
                        return { error: "You don't have permission to edit this comment" };
                    }

                    // Junior teachers can only edit member content, not teacher content
                    if (user.role === "junior_teacher" && targetReply.author._id !== user._id && targetReply.author.role && ["teacher", "junior_teacher", "senior_teacher", "lead_teacher"].includes(targetReply.author.role)) {
                        return { error: "Junior teachers cannot edit content from other teachers" };
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
        console.log("=== DELETE EMBEDDED COMMENT START ===");
        console.log("PostId:", postId, "PostType:", postType, "CommentPath:", commentPath);
        
        const user = await getUser();
        
        if ("error" in user) {
            console.error("User error:", user.error);
            return { error: user.error };
        }

        console.log("User authenticated:", user._id, "Role:", user.role);

        // Map postType to actual Sanity document type
        const sanityPostType = postType === 'community' ? 'communityQuestion' : postType;
        
        // Get the current post - try both adminClient and regular client
        const postQuery = defineQuery(`
            *[_type == $sanityPostType && _id == $postId && (isDeleted == false || isDeleted == null)][0] {
                _id,
                comments
            }
        `);

        console.log("Fetching post with ID:", postId, "Type:", sanityPostType);
        
        let post;
        try {
            // First try with adminClient
            post = await adminClient.fetch(postQuery, { postId, sanityPostType });
            console.log("Post found with adminClient:", post ? "Yes" : "No");
        } catch (adminError) {
            console.log("Admin client failed, trying regular client");
            try {
                // If adminClient fails, try with regular client
                post = await client.fetch(postQuery, { postId, sanityPostType });
                console.log("Post found with regular client:", post ? "Yes" : "No");
            } catch (clientError) {
                console.error("Both clients failed to fetch post:", clientError);
                return { error: "Failed to fetch post" };
            }
        }

        if (!post) {
            console.error("Post not found:", postId);
            // Try to find the post with a broader query to debug
            try {
                const debugQuery = defineQuery(`
                    *[_type == $sanityPostType && _id == $postId] {
                        _id,
                        _type,
                        title,
                        isDeleted
                    }
                `);
                const debugResult = await client.fetch(debugQuery, { postId, sanityPostType });
                console.log("Debug query result:", debugResult);
                
                if (debugResult && debugResult.length > 0) {
                    const foundPost = debugResult[0];
                    console.log("Found post but it might be deleted:", foundPost);
                    
                    if (foundPost.isDeleted) {
                        console.log("Post is already soft-deleted");
                        return { success: true, message: "Post was already deleted" };
                    } else {
                        return { error: "Post not found or has been deleted" };
                    }
                }
            } catch (debugError) {
                console.error("Debug query also failed:", debugError);
            }
            return { error: "Post not found" };
        }

        console.log("Post found, comments count:", post.comments?.length || 0);

        const comments = post.comments || [];
        
        // Parse the comment path
        const pathParts = commentPath.split('.');
        const parentIndex = parseInt(pathParts[0]);
        
        console.log("Path parts:", pathParts, "Parent index:", parentIndex);
        
        if (parentIndex >= 0 && parentIndex < comments.length) {
            const parentComment = comments[parentIndex];
            
            if (pathParts.length === 1) {
                // Deleting a top-level comment
                const comment = parentComment;
                
                console.log("Deleting top-level comment, authorId:", comment.authorId, "User ID:", user._id);
                
                // Check if user is the author of the comment or an admin
                if (comment.authorId !== user._id && user.role !== "admin") {
                    console.error("Permission denied - user not author or admin");
                    return { error: "You don't have permission to delete this comment" };
                }

                // Remove the comment from the array
                comments.splice(parentIndex, 1);
                console.log("Removed top-level comment, new comments count:", comments.length);
            } else {
                // Deleting a nested comment
                const replyIndex = parseInt(pathParts[1]);
                console.log("Deleting nested comment, reply index:", replyIndex);
                
                if (parentComment.replies && replyIndex < parentComment.replies.length) {
                    const targetReply = parentComment.replies[replyIndex];
                    
                    console.log("Target reply authorId:", targetReply.authorId, "User ID:", user._id);
                    
                    // Check if user is the author of the comment or an admin
                    if (targetReply.authorId !== user._id && user.role !== "admin") {
                        console.error("Permission denied - user not author or admin");
                        return { error: "You don't have permission to delete this comment" };
                    }

                    // Remove the reply from the array
                    const updatedReplies = [...parentComment.replies];
                    updatedReplies.splice(replyIndex, 1);
                    
                    comments[parentIndex] = {
                        ...parentComment,
                        replies: updatedReplies
                    };
                    console.log("Removed nested comment, new replies count:", updatedReplies.length);
                } else {
                    console.error("Reply not found at index:", replyIndex);
                    return { error: "Comment not found" };
                }
            }
        } else {
            console.error("Parent comment not found at index:", parentIndex);
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
        console.log("Updating post with new comments array");
        await adminClient.patch(postId).set({
            comments: comments
        }).commit();

        console.log("=== DELETE EMBEDDED COMMENT SUCCESS ===");
        return { success: true };
    } catch (error) {
        console.error("=== DELETE EMBEDDED COMMENT ERROR ===");
        console.error("Error deleting embedded comment:", error);
        console.error("Error type:", typeof error);
        console.error("Error message:", error instanceof Error ? error.message : String(error));
        console.error("=== END ERROR ===");
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
        console.log('Raw comments from Sanity:', JSON.stringify(comments, null, 2));
        
        // Fetch user profile images for all comment authors
        const structuredComments = await Promise.all(comments.map(async (comment: any) => {
            console.log('Processing comment:', JSON.stringify(comment, null, 2));
            console.log('Comment author field:', comment.author);
            console.log('Comment authorId field:', comment.authorId);
            
            // Get user profile image and user data
            let authorData = null;
            try {
                // Check if comment has author as a reference or direct object
                const authorId = comment.authorId || (comment.author?._ref) || comment.author?._id;
                console.log('Using authorId:', authorId);
                
                if (authorId) {
                    const userQuery = defineQuery(`
                        *[_type == "user" && _id == $authorId][0] {
                            _id,
                            username,
                            imageURL
                        }
                    `);
                    authorData = await adminClient.fetch(userQuery, { authorId });
                    console.log('Author data for comment:', authorData);
                } else {
                    console.log('No authorId found, using comment.author directly');
                    authorData = comment.author;
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }

            // Process replies with user data
            const processedReplies = await Promise.all((comment.replies || []).map(async (reply: any) => {
                console.log('Processing reply:', JSON.stringify(reply, null, 2));
                console.log('Reply author field:', reply.author);
                console.log('Reply authorId field:', reply.authorId);
                
                let replyAuthorData = null;
                try {
                    // Check if reply has author as a reference or direct object
                    const replyAuthorId = reply.authorId || (reply.author?._ref) || reply.author?._id;
                    console.log('Using reply authorId:', replyAuthorId);
                    
                    if (replyAuthorId) {
                        const replyUserQuery = defineQuery(`
                            *[_type == "user" && _id == $authorId][0] {
                                _id,
                                username,
                                imageURL
                            }
                        `);
                        replyAuthorData = await adminClient.fetch(replyUserQuery, { authorId: replyAuthorId });
                        console.log('Reply author data:', replyAuthorData);
                    } else {
                        console.log('No reply authorId found, using reply.author directly');
                        replyAuthorData = reply.author;
                    }
                } catch (error) {
                    console.error('Error fetching reply user data:', error);
                }

                const processedReply = {
                    _id: reply._id || `${reply.authorId}-${reply.createdAt}`,
                    content: reply.content,
                    author: {
                        _id: replyAuthorData?._id || reply.authorId,
                        username: replyAuthorData?.username || reply.authorUsername || 'Unknown User',
                        imageURL: replyAuthorData?.imageURL || null
                    },
                    authorRole: reply.authorRole || 'user',
                    parentCommentId: reply.parentCommentId,
                    replies: reply.replies || [],
                    createdAt: reply.createdAt,
                    updatedAt: reply.updatedAt
                };
                
                console.log('Processed reply:', processedReply);
                return processedReply;
            }));

            const structuredComment = {
                _id: comment._id || `${comment.authorId}-${comment.createdAt}`,
                content: comment.content,
                author: {
                    _id: authorData?._id || comment.authorId,
                    username: authorData?.username || comment.authorUsername || 'Unknown User',
                    imageURL: authorData?.imageURL || null
                },
                authorRole: comment.authorRole || 'user',
                parentCommentId: comment.parentCommentId,
                replies: processedReplies,
                createdAt: comment.createdAt,
                updatedAt: comment.updatedAt
            };
            
            console.log('Structured comment:', structuredComment);
            return structuredComment;
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

        // For each favorite with a commentPath, fetch the actual comment content
        const favoritesWithComments = await Promise.all(favorites.map(async (favorite: any) => {
            if (favorite.commentPath) {
                console.log(`Fetching comment for favorite with path: "${favorite.commentPath}"`);
                try {
                    const post = favorite.post;
                    const postType = post._type === 'communityQuestion' ? 'community' : 'blog';
                    
                    // Get the post with comments
                    const postQuery = defineQuery(`
                        *[_type == $sanityPostType && _id == $postId][0] {
                            _id,
                            comments
                        }
                    `);
                    
                    const sanityPostType = postType === 'community' ? 'communityQuestion' : postType;
                    const postWithComments = await adminClient.fetch(postQuery, { 
                        postId: post._id, 
                        sanityPostType 
                    });
                    
                    console.log(`Found post with ${postWithComments?.comments?.length || 0} comments`);
                    
                    if (postWithComments && postWithComments.comments) {
                        // Parse the comment path to find the specific comment
                        const pathParts = favorite.commentPath.split('.');
                        const parentIndex = parseInt(pathParts[0]);
                        
                        console.log(`Looking for comment at path: ${favorite.commentPath}, parentIndex: ${parentIndex}, pathParts: ${JSON.stringify(pathParts)}`);
                        
                        if (parentIndex >= 0 && parentIndex < postWithComments.comments.length) {
                            const parentComment = postWithComments.comments[parentIndex];
                            
                            let targetComment;
                            if (pathParts.length === 1) {
                                // Top-level comment
                                targetComment = parentComment;
                                console.log(`Found top-level comment: ${targetComment.content?.substring(0, 50)}...`);
                            } else {
                                // Nested comment
                                const replyIndex = parseInt(pathParts[1]);
                                if (parentComment.replies && replyIndex < parentComment.replies.length) {
                                    targetComment = parentComment.replies[replyIndex];
                                    console.log(`Found nested comment: ${targetComment.content?.substring(0, 50)}...`);
                                } else {
                                    console.log(`Reply not found at index ${replyIndex} in parent comment`);
                                }
                            }
                            
                            if (targetComment) {
                                // Get user data for the comment author
                                let authorData = null;
                                try {
                                    const authorId = targetComment.authorId || (targetComment.author?._ref) || targetComment.author?._id;
                                    if (authorId) {
                                        const userQuery = defineQuery(`
                                            *[_type == "user" && _id == $authorId][0] {
                                                _id,
                                                username,
                                                imageURL
                                            }
                                        `);
                                        authorData = await adminClient.fetch(userQuery, { authorId });
                                    } else {
                                        authorData = targetComment.author;
                                    }
                                } catch (error) {
                                    console.error('Error fetching comment author data:', error);
                                }
                                
                                console.log(`Successfully retrieved comment: "${targetComment.content?.substring(0, 50)}..." by ${authorData?.username || 'Unknown'}`);
                                
                                return {
                                    ...favorite,
                                    comment: {
                                        _id: targetComment._id || `${targetComment.authorId}-${targetComment.createdAt}`,
                                        content: targetComment.content,
                                        author: {
                                            _id: authorData?._id || targetComment.authorId,
                                            username: authorData?.username || targetComment.authorUsername || 'Unknown User',
                                            imageURL: authorData?.imageURL || null
                                        },
                                        authorRole: targetComment.authorRole || 'user',
                                        createdAt: targetComment.createdAt,
                                        updatedAt: targetComment.updatedAt
                                    }
                                };
                            } else {
                                console.log(`Comment not found for path: ${favorite.commentPath}`);
                            }
                        } else {
                            console.log(`Parent comment not found at index ${parentIndex}`);
                        }
                    } else {
                        console.log(`No comments found for post: ${post._id}`);
                    }
                } catch (error) {
                    console.error('Error fetching comment for favorite:', error);
                }
            }
            
            return favorite;
        }));

        return { success: true, favorites: favoritesWithComments };
    } catch (error) {
        console.error("Error getting user favorites:", error);
        return { error: "Failed to get user favorites" };
    }
}

// Cleanup functions for when posts or comments are deleted
export async function cleanupAllCommentsForDeletedPost(postId: string, postType: 'blog' | 'community') {
    try {
        console.log("Cleaning up all comments for deleted post:", postId, "type:", postType);
        
        // Map postType to actual Sanity document type
        const sanityPostType = postType === 'community' ? 'communityQuestion' : postType;
        
        // 1. Clean up embedded comments by setting them to empty array
        console.log("Cleaning up embedded comments for post:", postId);
        try {
            await adminClient
                .patch(postId)
                .set({
                    comments: []
                })
                .commit();
            console.log("Successfully cleaned up embedded comments for post:", postId);
        } catch (embeddedCommentError) {
            console.warn("Warning: Failed to cleanup embedded comments:", embeddedCommentError);
        }
        
        // 2. Clean up separate comments that reference this post
        console.log("Cleaning up separate comments for post:", postId);
        try {
            const separateCommentsQuery = defineQuery(`
                *[_type == "comment" && post._ref == $postId && (isDeleted == false || isDeleted == null)] {
                    _id
                }
            `);
            
            const separateComments = await adminClient.fetch(separateCommentsQuery, { postId });
            
            if (separateComments && separateComments.length > 0) {
                console.log(`Found ${separateComments.length} separate comments to soft delete`);
                
                for (const comment of separateComments) {
                    await adminClient
                        .patch(comment._id)
                        .set({
                            isDeleted: true,
                            deletedAt: new Date().toISOString()
                        })
                        .commit();
                }
                
                console.log(`Successfully soft deleted ${separateComments.length} separate comments`);
            } else {
                console.log("No separate comments found for post:", postId);
            }
        } catch (separateCommentError) {
            console.warn("Warning: Failed to cleanup separate comments:", separateCommentError);
        }
        
        return { success: true };
    } catch (error) {
        console.error("Error cleaning up all comments for deleted post:", error);
        return { error: "Failed to cleanup comments for deleted post" };
    }
}

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