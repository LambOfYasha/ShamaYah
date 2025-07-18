'use server';

import { getUser } from "@/lib/user/getUser";
import { adminClient } from "@/sanity/lib/adminClient";
import { defineQuery } from "groq";
import { sanityFetch } from "@/sanity/lib/live";

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

        // Check if user has permission to delete this blog
        const blogQuery = defineQuery(`
            *[_type == "blog" && _id == $blogId][0] {
                _id,
                author->{_id},
                title
            }
        `);

        console.log("Fetching blog with ID:", blogId);
        const blog = await sanityFetch({
            query: blogQuery,
            params: { blogId },
        });

        console.log("Blog query result:", blog);

        if (!blog.data) {
            console.error("Blog not found with ID:", blogId);
            return { error: "Blog not found" };
        }

        console.log("Blog author ID:", blog.data.author?._id);
        console.log("Current user ID:", user._id);
        console.log("Current user role:", user.role);

        // Check if user is the author or an admin/teacher
        if (blog.data.author?._id !== user._id && user.role !== "admin" && user.role !== "teacher") {
            console.error("User does not have permission to delete this blog");
            return { error: "You don't have permission to delete this blog" };
        }

        console.log("Permission check passed, proceeding with deletion");

        // First, find and delete all comments associated with this blog
        console.log("Finding all comments for blog:", blogId);
        const commentsQuery = defineQuery(`
            *[_type == "comment" && post._ref == $blogId] {
                _id,
                parentComment,
                replies
            }
        `);

        const comments = await sanityFetch({
            query: commentsQuery,
            params: { blogId },
        });

        console.log("Found comments:", comments);

        if (comments.data && comments.data.length > 0) {
            console.log(`Found ${comments.data.length} comments to delete`);
            
            // Delete all comments (this will also handle nested comments due to referential integrity)
            for (const comment of comments.data) {
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
        }
        
        return { error: "Failed to delete blog" };
    }
} 