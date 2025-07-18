'use server';

import { getUser } from "@/lib/user/getUser";
import { adminClient } from "@/sanity/lib/adminClient";
import { defineQuery } from "groq";
import { sanityFetch } from "@/sanity/lib/live";

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
    imageData: ImageData | null
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

        const blog = await sanityFetch({
            query: blogQuery,
            params: { blogId },
        });

        if (!blog.data) {
            return { error: "Blog not found" };
        }

        // Check if user is the author or an admin/teacher
        if (blog.data.author?._id !== user._id && user.role !== "admin" && user.role !== "teacher") {
            return { error: "You don't have permission to edit this blog" };
        }

        // Check if new slug conflicts with existing blogs (excluding current blog)
        if (slug !== blog.data.slug?.current) {
            const checkSlugQuery = defineQuery(`
                *[_type == "blog" && slug.current == $slug && _id != $blogId][0] {
                    _id
                }
            `);

            const existingSlug = await sanityFetch({
                query: checkSlugQuery,
                params: { slug, blogId },
            });

            if (existingSlug.data) {
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
            content: [
                {
                    _type: "block",
                    _key: "content",
                    children: [
                        {
                            _type: "span",
                            _key: "content-text",
                            text: content,
                        }
                    ],
                    style: "normal"
                }
            ],
        };

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