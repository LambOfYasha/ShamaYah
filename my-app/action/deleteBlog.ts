'use server';

import { defineQuery } from "groq"
import { adminClient } from "@/sanity/lib/adminClient"
import { client } from "@/sanity/lib/client"
import { getUser } from "@/lib/user/getUser"
import { currentUser } from "@clerk/nextjs/server"
import { cleanupFavoritesForDeletedPost } from "./embeddedComments";

export async function deleteBlog(blogId: string) {
    console.log("=== DELETE BLOG FUNCTION ENTRY ===");
    console.log("BlogId received:", blogId);
    
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

        console.log("Deleting blog with ID:", blogId);
        
        // Clean up favorites before deleting the blog
        console.log("Cleaning up favorites for blog:", blogId);
        const cleanupResult = await cleanupFavoritesForDeletedPost(blogId);
        if ("error" in cleanupResult) {
            console.warn("Warning: Failed to cleanup favorites:", cleanupResult.error);
        } else {
            console.log(`Cleaned up ${cleanupResult.cleanedCount} favorites for blog:`, blogId);
        }
        
        // Soft delete the blog (mark as deleted instead of hard delete)
        console.log("Soft deleting blog with ID:", blogId);
        try {
            const softDeleteResult = await adminClient
                .patch(blogId)
                .set({
                    isDeleted: true,
                    deletedAt: new Date().toISOString(),
                    deletedBy: user._id
                })
                .commit();
            
            console.log("Soft delete result:", softDeleteResult);
            
            if (!softDeleteResult) {
                console.error("Soft delete operation returned null/undefined");
                return { error: "Delete operation failed - no result returned" };
            }
            
            console.log("Soft delete operation completed successfully");
        } catch (deleteError) {
            console.error("Error during soft deletion:", deleteError);
            console.error("Error type:", typeof deleteError);
            console.error("Error message:", deleteError instanceof Error ? deleteError.message : String(deleteError));
            
            if (deleteError instanceof Error) {
                if (deleteError.message.includes("not found")) {
                    return { error: "Blog not found or already deleted" };
                }
                if (deleteError.message.includes("referenced")) {
                    return { error: "Cannot delete blog with existing references" };
                }
                if (deleteError.message.includes("permission")) {
                    return { error: "Permission denied - please check your access rights" };
                }
                if (deleteError.message.includes("token")) {
                    return { error: "Authentication failed - please check your Sanity token" };
                }
                if (deleteError.message.includes("network")) {
                    return { error: "Network error - please check your connection" };
                }
            }
            return { error: "Failed to delete blog - please try again" };
        }

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
        
        return { error: "Failed to delete blog - please try again" };
    }
}

// New server action that can be called directly from client components
export async function deleteBlogAction(blogId: string) {
    console.log("=== DELETE BLOG ACTION CALLED ===");
    console.log("deleteBlogAction called with blog ID:", blogId);
    
    const result = await deleteBlog(blogId);
    console.log("Delete result:", result);
    
    if ("error" in result) {
        console.error("Delete blog error:", result.error);
        throw new Error(result.error);
    }
    
    console.log("Delete successful");
    return result;
} 