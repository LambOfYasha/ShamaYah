import { ImageData } from "@/action/createBlog"
import { defineQuery } from "groq"
import { sanityFetch } from "../live"
import { adminClient } from "../adminClient"
import { Blog } from "@/sanity.types"

export async function createBlog(
    title: string,
    authorId: string,
    imageData: ImageData | null,
    customSlug?: string,
    customDescription?: string,
    content?: string
) {
    console.log(`Creating blog: ${title} with author: ${authorId}`)
    console.log(`Admin token available: ${!!process.env.SANITY_ADMIN_API_TOKEN}`)
    console.log(`Author ID type: ${typeof authorId}, value: ${authorId}`)
    
    try {
        // Validate input parameters
        if (!title || !authorId) {
            return { error: "Title and author are required" };
        }

        if (title.length < 3 || title.length > 100) {
            return { error: "Title must be between 3 and 100 characters" };
        }

        if (customDescription && (customDescription.length < 10 || customDescription.length > 200)) {
            return { error: "Description must be between 10 and 200 characters" };
        }

        if (content && content.length < 50) {
            return { error: "Content must be at least 50 characters long" };
        }

        // Validate image data if provided
        if (imageData) {
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
        }

        // Check if blog with this title already exists
        const checkExistingQuery = defineQuery(
            `*[_type == "blog" && title == $title][0]
            {
                _id,
            }
        `)

        const existingBlog = await sanityFetch({
            query: checkExistingQuery,
            params: { title },
        })
        
        if (existingBlog.data) {
            console.log(`Blog with title ${title} already exists`)
            return { error: "Blog with this title already exists" }
        }

        // Check if slug already exists if custom slug is provided
        if (customSlug) {
            // Validate slug format
            const slugRegex = /^[a-z0-9-]+$/;
            if (!slugRegex.test(customSlug)) {
                return { error: "Slug can only contain lowercase letters, numbers, and hyphens" };
            }

            if (customSlug.length < 3 || customSlug.length > 50) {
                return { error: "Slug must be between 3 and 50 characters" };
            }

            const checkSlugQuery = defineQuery(
                `*[_type == "blog" && slug.current == $slug][0]
                {
                    _id,
                }
            `)

            const existingSlug = await sanityFetch({
                query: checkSlugQuery,
                params: {slug: customSlug}
            })

            if (existingSlug.data) {
                console.log(`Blog with slug "${customSlug}" already exists`)
                return { error: "A blog with this URL already exists" }
            }
        }

        // Create slug from title or use custom slug
        const slug = customSlug || title.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "").slice(0, 50);

        // Upload image if provided
        let imageAsset
        if (imageData) {
            try {
                // Validate base64 data format
                const base64Match = imageData.base64.match(/^data:([^;]+);base64,(.+)$/);
                if (!base64Match) {
                    return { error: "Invalid image data format" };
                }

                const [, contentType, base64Data] = base64Match;
                
                // Validate content type matches
                if (contentType !== imageData.contentType) {
                    return { error: "Image content type mismatch" };
                }

                // Validate base64 data length (reasonable size check)
                if (base64Data.length > 10 * 1024 * 1024) { // 10MB limit
                    return { error: "Image file is too large. Maximum size is 5MB." };
                }

                const buffer = Buffer.from(base64Data, "base64")

                // Additional validation for buffer
                if (buffer.length === 0) {
                    return { error: "Invalid image data" };
                }

                // Upload to sanity
                imageAsset = await adminClient.assets.upload("image", buffer, {
                    filename: imageData.fileName,
                    contentType: imageData.contentType,
                })

                if (!imageAsset || !imageAsset._id) {
                    return { error: "Failed to upload image to storage" };
                }

                console.log("image asset:", imageAsset)
            } catch (error) {
                console.error("failed to upload image", error)
                
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
        }
        
        // Create the blog
        const blogDoc: Partial<Blog> = {
            _type: "blog",
            title: title,
            description: customDescription || `A blog post about ${title}`,
            slug: {
                current: slug,
                _type: "slug",
            },
            author: {
                _type: "reference",
                _ref: authorId,
            },
            createdAt: new Date().toISOString(),
        }
        
        console.log("Blog document before creation:", JSON.stringify(blogDoc, null, 2))

        // Add content (required field)
        blogDoc.content = [
            {
                _type: "block",
                _key: "content",
                children: [
                    {
                        _type: "span",
                        _key: "content-text",
                        text: content || "Blog content will be added here.",
                    }
                ],
                style: "normal"
            }
        ]

        // Add image if available
        if (imageAsset) {
            blogDoc.image = {
                _type: "image",
                asset: {
                    _type: "reference",
                    _ref: imageAsset._id,
                },
            }
        }

        // Create blog
        console.log("About to create blog with document:", JSON.stringify(blogDoc, null, 2))
        const createdBlog = await adminClient.create(blogDoc as Blog)

        if (!createdBlog || !createdBlog._id) {
            return { error: "Failed to create blog" };
        }

        console.log(`created blog: ${createdBlog._id}`)

        return { createdBlog }

     } catch (error) {
        console.error("failed to create blog", error)
        console.error("Error details:", {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        })
        
        // Provide more specific error messages based on error type
        if (error instanceof Error) {
            if (error.message.includes('network') || error.message.includes('timeout')) {
                return { error: "Network error. Please check your connection and try again." };
            }
            if (error.message.includes('permission') || error.message.includes('unauthorized')) {
                return { error: "Permission denied. You may not have access to create blogs." };
            }
            if (error.message.includes('duplicate') || error.message.includes('already exists')) {
                return { error: "A blog with this title or URL already exists." };
            }
        }
        
        return { error: "Failed to create blog. Please try again." }
    }
} 