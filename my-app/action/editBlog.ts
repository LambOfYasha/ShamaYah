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
    console.log("editBlog called with:", {
        blogId,
        title,
        hasImageData: !!imageData,
        imageDataType: typeof imageData
    });

    // Test Sanity configuration
    console.log("Sanity configuration check:", {
        hasProjectId: !!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
        hasDataset: !!process.env.NEXT_PUBLIC_SANITY_DATASET,
        hasAdminToken: !!process.env.SANITY_ADMIN_API_TOKEN,
        projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
        dataset: process.env.NEXT_PUBLIC_SANITY_DATASET
    });

    // Test admin client connection
    try {
        const testQuery = await adminClient.fetch('*[_type == "blog"][0]{_id}');
        console.log("Admin client test successful:", testQuery);
    } catch (error) {
        console.error("Admin client test failed:", error);
        return { error: "Failed to connect to Sanity. Please check your configuration." };
    }

    try {
        // Validate input parameters
        if (!blogId || !title || !description || !slug || !content) {
            return { error: "All required fields must be provided" };
        }

        if (title.length < 3 || title.length > 100) {
            return { error: "Title must be between 3 and 100 characters" };
        }

        if (description.length < 10 || description.length > 200) {
            return { error: "Description must be between 10 and 200 characters" };
        }

        if (content.length < 50) {
            return { error: "Content must be at least 50 characters long" };
        }

        // Validate slug format
        const slugRegex = /^[a-z0-9-]+$/;
        if (!slugRegex.test(slug)) {
            return { error: "Slug can only contain lowercase letters, numbers, and hyphens" };
        }

        if (slug.length < 3 || slug.length > 50) {
            return { error: "Slug must be between 3 and 50 characters" };
        }

        // Validate image data if provided
        if (imageData !== null && imageData !== undefined) {
            console.log("Processing image data:", {
                hasBase64: !!imageData.base64,
                fileName: imageData.fileName,
                contentType: imageData.contentType
            });

            if (!imageData.base64 || !imageData.fileName || !imageData.contentType) {
                return { error: "Invalid image data provided" };
            }

            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
            if (!allowedTypes.includes(imageData.contentType)) {
                return { error: "Only JPEG, PNG, WebP, and GIF images are allowed" };
            }

            // Validate base64 format
            if (!imageData.base64.startsWith('data:image/')) {
                return { error: "Invalid image format" };
            }
        } else {
            console.log("No image data provided or image should be removed");
        }

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
        if (imageData !== null && imageData !== undefined) {
            console.log("Starting image upload process");
            try {
                // Validate base64 data format
                const base64Match = imageData.base64.match(/^data:([^;]+);base64,(.+)$/);
                if (!base64Match) {
                    console.error("Invalid base64 format");
                    return { error: "Invalid image data format" };
                }

                const [, contentType, base64Data] = base64Match;
                console.log("Base64 data parsed successfully:", {
                    contentType,
                    base64DataLength: base64Data.length
                });
                
                // Validate content type matches
                if (contentType !== imageData.contentType) {
                    console.error("Content type mismatch:", { contentType, expected: imageData.contentType });
                    return { error: "Image content type mismatch" };
                }

                // Validate base64 data length (reasonable size check)
                if (base64Data.length > 10 * 1024 * 1024) { // 10MB limit
                    console.error("Image too large:", base64Data.length);
                    return { error: "Image file is too large. Maximum size is 5MB." };
                }

                const buffer = Buffer.from(base64Data, "base64");
                console.log("Buffer created successfully, length:", buffer.length);

                // Additional validation for buffer
                if (buffer.length === 0) {
                    console.error("Empty buffer");
                    return { error: "Invalid image data" };
                }

                console.log("Uploading to Sanity...");
                console.log("Upload parameters:", {
                    filename: imageData.fileName,
                    contentType: imageData.contentType,
                    bufferLength: buffer.length
                });
                
                // Add timeout to prevent hanging
                const uploadPromise = adminClient.assets.upload("image", buffer, {
                    filename: imageData.fileName,
                    contentType: imageData.contentType,
                });

                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error("Upload timeout")), 30000); // 30 second timeout
                });

                imageAsset = await Promise.race([uploadPromise, timeoutPromise]);

                console.log("Image uploaded successfully:", imageAsset);
                console.log("Image asset details:", {
                    _id: imageAsset._id,
                    _type: imageAsset._type,
                    url: imageAsset.url,
                    path: imageAsset.path
                });

                if (!imageAsset || !imageAsset._id) {
                    console.error("No image asset returned");
                    return { error: "Failed to upload image to storage" };
                }
            } catch (error) {
                console.error("Failed to upload image:", error);
                
                // Provide more specific error messages
                if (error instanceof Error) {
                    if (error.message.includes('size')) {
                        return { error: "Image file is too large. Maximum size is 5MB." };
                    }
                    if (error.message.includes('type')) {
                        return { error: "Unsupported image format. Please use JPEG, PNG, WebP, or GIF." };
                    }
                }
                
                return { error: "Failed to upload image. Please try again." };
            }
        } else {
            console.log("No image upload needed");
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

        // Handle image updates
        if (imageAsset) {
            // New image uploaded - set the new image
            console.log("Setting new image:", imageAsset._id);
            updateData.image = {
                _type: "image",
                asset: {
                    _type: "reference",
                    _ref: imageAsset._id,
                },
            };
        } else if (imageData === null) {
            // Explicitly remove image (when user clicks remove)
            console.log("Removing image");
            updateData.image = null;
        } else {
            // If imageData is undefined, keep existing image unchanged
            console.log("Keeping existing image unchanged");
        }

        console.log("Final updateData:", updateData);

        const updatedBlog = await adminClient
            .patch(blogId)
            .set(updateData)
            .commit();

        console.log("Blog updated successfully:", updatedBlog);

        if (!updatedBlog) {
            return { error: "Failed to update blog" };
        }

        return { success: true, blog: updatedBlog };
    } catch (error) {
        console.error("Failed to edit blog:", error);
        
        // Provide more specific error messages based on error type
        if (error instanceof Error) {
            if (error.message.includes('network') || error.message.includes('timeout')) {
                return { error: "Network error. Please check your connection and try again." };
            }
            if (error.message.includes('permission') || error.message.includes('unauthorized')) {
                return { error: "Permission denied. You may not have access to edit this blog." };
            }
        }
        
        return { error: "Failed to edit blog. Please try again." };
    }
} 