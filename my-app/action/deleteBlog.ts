'use server';

import { getUser } from "@/lib/user/getUser";
import { adminClient } from "@/sanity/lib/adminClient";
import { defineQuery } from "groq";

export async function deleteBlog(blogId: string) {
    try {
        console.log("=== DELETE BLOG DEBUG START ===");
        console.log("Starting deleteBlog with blogId:", blogId);
        
        // Check if admin token is available
        if (!process.env.SANITY_ADMIN_API_TOKEN) {
            console.error("SANITY_ADMIN_API_TOKEN is not set");
            return { error: "Admin token not configured" };
        }

        console.log("Admin token is available");
        console.log("Project ID:", process.env.NEXT_PUBLIC_SANITY_PROJECT_ID);
        console.log("Dataset:", process.env.NEXT_PUBLIC_SANITY_DATASET);

        const user = await getUser();
        console.log("User result:", user);

        if ("error" in user) {
            console.error("User error:", user.error);
            return { error: user.error };
        }

        // Check if user has permission to delete this blog using admin client
        const blogQuery = defineQuery(`
            *[_type == "blog" && _id == $blogId][0] {
                _id,
                author->{_id},
                title
            }
        `);

        console.log("Fetching blog with ID:", blogId);
        const blog = await adminClient.fetch(blogQuery, { blogId });

        console.log("Blog query result:", blog);

        if (!blog) {
            console.error("Blog not found with ID:", blogId);
            return { error: "Blog not found" };
        }

        console.log("Blog author ID:", blog.author?._id);
        console.log("Current user ID:", user._id);
        console.log("Current user role:", user.role);

        // Check if user is the author or an admin/teacher
        if (blog.author?._id !== user._id && user.role !== "admin" && user.role !== "teacher") {
            console.error("User does not have permission to delete this blog");
            return { error: "You don't have permission to delete this blog" };
        }

        console.log("Permission check passed, proceeding with deletion");

        // First, find and delete all comments associated with this blog
        console.log("Finding all comments for blog:", blogId);
        
        // Find all comments that reference this blog (both direct and nested)
        const allCommentsQuery = defineQuery(`
            *[_type == "comment" && (post._ref == $blogId || parentComment._ref in *[_type == "comment" && post._ref == $blogId]._id)] {
                _id,
                parentComment,
                replies
            }
        `);

        const allComments = await adminClient.fetch(allCommentsQuery, { blogId });
        console.log("Found all comments (including nested):", allComments);

        if (allComments && allComments.length > 0) {
            console.log(`Found ${allComments.length} comments to delete`);
            
            // Delete comments in reverse order to handle dependencies
            const commentsToDelete = [...allComments].reverse();
            
            for (const comment of commentsToDelete) {
                console.log("Deleting comment:", comment._id);
                try {
                    await adminClient.delete(comment._id);
                    console.log("Successfully deleted comment:", comment._id);
                } catch (commentError) {
                    console.error("Error deleting comment:", comment._id, commentError);
                    // Continue with other comments even if one fails
                }
            }
        } else {
            console.log("No comments found for this blog");
        }

        // Also try to find comments that might reference the blog with different field names
        console.log("Checking for comments with alternative references...");
        const alternativeCommentsQuery = defineQuery(`
            *[_type == "comment" && (post._ref == $blogId || post._ref in *[_type == "blog" && _id == $blogId]._id)] {
                _id
            }
        `);

        const alternativeComments = await adminClient.fetch(alternativeCommentsQuery, { blogId });
        console.log("Alternative comments found:", alternativeComments);

        if (alternativeComments && alternativeComments.length > 0) {
            console.log(`Found ${alternativeComments.length} alternative comments to delete`);
            
            for (const comment of alternativeComments) {
                console.log("Deleting alternative comment:", comment._id);
                try {
                    await adminClient.delete(comment._id);
                    console.log("Successfully deleted alternative comment:", comment._id);
                } catch (commentError) {
                    console.error("Error deleting alternative comment:", comment._id, commentError);
                }
            }
        }

        console.log("Deleting blog with ID:", blogId);
        
        // Now delete the blog
        const deleteResult = await adminClient.delete(blogId);
        console.log("Delete result:", deleteResult);

        console.log("=== DELETE BLOG DEBUG END ===");
        return { success: true };
    } catch (error) {
        console.error("=== DELETE BLOG ERROR ===");
        console.error("Failed to delete blog:", error);
        console.error("Error type:", typeof error);
        console.error("Error message:", error instanceof Error ? error.message : String(error));
        console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
        console.error("=== END ERROR ===");
        
        // Provide more specific error messages
        if (error instanceof Error) {
            if (error.message.includes("token")) {
                return { error: "Authentication failed - please check your permissions" };
            }
            if (error.message.includes("not found")) {
                return { error: "Blog not found or already deleted" };
            }
            if (error.message.includes("permission")) {
                return { error: "You don't have permission to delete this blog" };
            }
            if (error.message.includes("network")) {
                return { error: "Network error - please check your connection" };
            }
            if (error.message.includes("referenced")) {
                return { error: "Cannot delete blog with existing references - please try again" };
            }
            if (error.message.includes("timeout")) {
                return { error: "Request timeout - please try again" };
            }
        }
        
        return { error: "Failed to delete blog" };
    }
} 