'use server';

import { defineQuery } from "groq";
import { adminClient } from "@/sanity/lib/adminClient";
import { client } from "@/sanity/lib/client";
import { getUser } from "@/lib/user/getUser";
import { currentUser } from "@clerk/nextjs/server";

export type ImageData = {
    base64: string;
    fileName: string;
    contentType: string;
} | null;

export async function editBlog(
    blogId: string,
    title: string,
    description: string,
    slug: string,
    content: string,
    imageData: ImageData | null,
    tags?: string[]
) {
    try {
        const user = await getUser();

        if ("error" in user) {
            return { error: user.error };
        }

        // Check if user has permission to edit this blog
        const blogQuery = defineQuery(`
            *[_type == "blog" && _id == $blogId][0] {
                _id,
                author->{_id},
                title,
                slug
            }
        `);

        const blog = await client.fetch(blogQuery, { blogId });

        if (!blog) {
            return { error: "Blog not found" };
        }

        // Check if user is the author or an admin/teacher
        if (blog.author?._id !== user._id && user.role !== "admin" && user.role !== "teacher" && user.role !== "junior_teacher" && user.role !== "senior_teacher" && user.role !== "lead_teacher") {
            return { error: "You don't have permission to edit this blog" };
        }

        // Junior teachers can only edit member content, not teacher content
        if (user.role === "junior_teacher" && blog.author?._id !== user._id && blog.author?.role && ["teacher", "junior_teacher", "senior_teacher", "lead_teacher"].includes(blog.author.role)) {
            return { error: "Junior teachers cannot edit content from other teachers" };
        }

        // Check if new slug conflicts with existing blogs (excluding current blog)
        if (slug !== blog.slug?.current) {
            const checkSlugQuery = defineQuery(`
                *[_type == "blog" && slug.current == $slug && _id != $blogId][0] {
                    _id
                }
            `);

            const existingSlug = await client.fetch(checkSlugQuery, { slug, blogId });

            if (existingSlug) {
                return { error: "A blog with this URL already exists" };
            }
        }

        // Upload new image if provided
        let imageAsset;
        if (imageData) {
            try {
                const base64Data = imageData.base64.split(",")[1];
                const buffer = Buffer.from(base64Data, "base64");

                imageAsset = await adminClient.assets.upload("image", buffer, {
                    filename: imageData.fileName,
                    contentType: imageData.contentType,
                });
            } catch (error) {
                console.error("Failed to upload image:", error);
                return { error: "Failed to upload image" };
            }
        }

        // Update the blog
        const updateData: any = {
            title,
            description,
            slug: {
                current: slug,
                _type: "slug",
            },
            content: content,
        };

        // Add tags if provided
        if (tags) {
            updateData.tags = tags.map(tagId => ({
                _type: "reference",
                _ref: tagId,
            }));
        }

        if (imageAsset) {
            updateData.image = {
                _type: "image",
                asset: {
                    _type: "reference",
                    _ref: imageAsset._id,
                },
            };
        }

        const updatedBlog = await adminClient
            .patch(blogId)
            .set(updateData)
            .commit();

        return { success: true, blog: updatedBlog };
    } catch (error) {
        console.error("Failed to edit blog:", error);
        return { error: "Failed to edit blog" };
    }
} 