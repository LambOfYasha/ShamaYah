'use server';

import { getUser } from "@/lib/user/getUser";
import { adminClient } from "@/sanity/lib/adminClient";
import { defineQuery } from "groq";
import { sanityFetch } from "@/sanity/lib/live";

export async function deleteBlog(blogId: string) {
    try {
        const user = await getUser();

        if ("error" in user) {
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

        const blog = await sanityFetch({
            query: blogQuery,
            params: { blogId },
        });

        if (!blog.data) {
            return { error: "Blog not found" };
        }

        // Check if user is the author or an admin/teacher
        if (blog.data.author?._id !== user._id && user.role !== "admin" && user.role !== "teacher") {
            return { error: "You don't have permission to delete this blog" };
        }

        // Delete the blog
        await adminClient.delete(blogId);

        return { success: true };
    } catch (error) {
        console.error("Failed to delete blog:", error);
        return { error: "Failed to delete blog" };
    }
} 