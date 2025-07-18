'use server';

import { getUser } from "@/lib/user/getUser";
import { adminClient } from "@/sanity/lib/adminClient";
import { defineQuery } from "groq";
import { sanityFetch } from "@/sanity/lib/live";

export async function deleteBlog(blogId: string) {
    try {
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

        console.log("Deleting blog with ID:", blogId);
        
        // Delete the blog
        const deleteResult = await adminClient.delete(blogId);
        console.log("Delete result:", deleteResult);

        return { success: true };
    } catch (error) {
        console.error("Failed to delete blog:", error);
        
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
        }
        
        return { error: "Failed to delete blog" };
    }
} 