import { ImageData } from "@/action/createBlog"
import { defineQuery } from "groq"
import { client } from "../client"
import { adminClient } from "../adminClient"
import { Blog } from "@/sanity.types"

export async function createBlog(
    title: string,
    authorId: string,
    imageData: ImageData | null,
    customSlug?: string,
    customDescription?: string,
    content?: string,
    tags?: string[]
) {
    console.log(`Creating blog: ${title} with author: ${authorId}`)
    console.log(`Admin token available: ${!!process.env.SANITY_ADMIN_API_TOKEN}`)
    console.log(`Author ID type: ${typeof authorId}, value: ${authorId}`)
    
    try {
        // Check if blog with this title already exists
        const checkExistingQuery = defineQuery(
            `*[_type == "blog" && title == $title][0]
            {
                _id,
            }
        `)

        const existingBlog = await client.fetch(
            checkExistingQuery,
            { title }
        )
        
        if (existingBlog) {
            console.log(`Blog with title ${title} already exists`)
            return { error: "Blog with this title already exists" }
        }

        // Check if slug already exists if custom slug is provided
        if (customSlug) {
            const checkSlugQuery = defineQuery(
                `*[_type == "blog" && slug.current == $slug][0]
                {
                    _id,
                }
            `)

            const existingSlug = await client.fetch(
                checkSlugQuery,
                {slug: customSlug}
            )

            if (existingSlug) {
                console.log(`Blog with slug "${customSlug}" already exists`)
                return { error: "A blog with this URL already exists" }
            }
        }

        // Create slug from title or use custom slug
        const slug = customSlug || title.toLowerCase().replace(/\s+/g, "-")

        // Upload image if provided
        let imageAsset
        if (imageData) {
            try {
                // Extract base64 data (remove data:image/jpeg;base64, part)
                const base64Data = imageData.base64.split(",")[1]

                // Convert base64 to buffer
                const buffer = Buffer.from(base64Data, "base64")

                // Upload to sanity
                imageAsset = await adminClient.assets.upload("image", buffer, {
                    filename: imageData.fileName,
                    contentType: imageData.contentType,
                })

                console.log("image asset:", imageAsset)
            } catch (error) {
                console.error("failed to upload image", error)
                // Continue without image if upload fails
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

        // Add tags if provided
        if (tags && tags.length > 0) {
            blogDoc.tags = tags.map(tagId => ({
                _type: "reference",
                _ref: tagId,
            }));
        }
        
        console.log("Blog document before creation:", JSON.stringify(blogDoc, null, 2))

        // Add content (required field) - save as HTML string
        blogDoc.content = content || "Blog content will be added here."

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

        console.log(`created blog: ${createdBlog._id}`)

        return { createdBlog }

     } catch (error) {
        console.error("failed to create blog", error)
        console.error("Error details:", {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        })
        return { error: "failed to create blog" }
    }
} 