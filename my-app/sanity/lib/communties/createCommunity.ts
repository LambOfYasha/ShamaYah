import { ImageData } from "@/action/createCommunityQuestion"
import { defineQuery } from "groq"
import { sanityFetch } from "../live"
import { adminClient } from "../adminClient"
import { CommunityQuestion } from "@/sanity.types"

export async function createCommunity(
    name: string,
    moderatorId: string,
    imageData: ImageData | null,
    customSlug?: string,
    customDescription?: string

) {
    console.log(`Creating community: ${name} with moderator: ${moderatorId}`)
    try {
        // Validate input parameters
        if (!name || !moderatorId) {
            return { error: "Name and moderator are required" };
        }

        if (name.length < 3 || name.length > 100) {
            return { error: "Name must be between 3 and 100 characters" };
        }

        if (customDescription && (customDescription.length < 10 || customDescription.length > 500)) {
            return { error: "Description must be between 10 and 500 characters" };
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

        //check if community with this name already exists
        const checkExistingQuery = defineQuery(
            `*[_type == "communityQuestion" && title == $name][0]
            {
                _id,
            }
        `)

        const existingCommunity = await sanityFetch({
            query: checkExistingQuery,
            params: { name },
        })
        
        if (existingCommunity.data) {
            console.log(`Community with name ${name} already exists`)
            return { error: "Community with this name already exists" }
        }

        //check if slug already exists if custom slug is provided
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
                `*[_type == "communityQuestion" && slug.current == $slug][0]
                {
                    _id,
                }
            `)

            const existingSlug = await sanityFetch({
                query: checkSlugQuery,
                params: {slug: customSlug}
            })

            if (existingSlug.data) {
                console.log(`Community with slug "${customSlug}" already exists`)
                return { error: "A community with this URL already exists" }
            }
        }

        //create slug from name or use custom slug
        const slug = customSlug || name.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "").slice(0, 50);

        //Upload image if provided
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

                //upload to sanity
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
        
        // Create the community
        const communityDoc: Partial<CommunityQuestion> = {
            _type: "communityQuestion",
            title: name,
            description: customDescription || `Welcome to r/${name}`,
            slug: {
                current: slug,
                _type: "slug",
            },
            moderator: {
                _type: "reference",
                _ref: moderatorId,
            },
            createdAt: new Date().toISOString(),
        }

        //add image if available
        if (imageAsset) {
            communityDoc.image = {
                _type: "image",
                asset: {
                    _type: "reference",
                    _ref: imageAsset._id,
                },
            }
        }

        //create community
        const createdCommunity = await adminClient.create(communityDoc as CommunityQuestion)

        if (!createdCommunity || !createdCommunity._id) {
            return { error: "Failed to create community" };
        }

        console.log(`created community: ${createdCommunity._id}`)

        return { createdCommunity }

     } catch (error) {
        console.error("failed to create community", error)
        
        // Provide more specific error messages based on error type
        if (error instanceof Error) {
            if (error.message.includes('network') || error.message.includes('timeout')) {
                return { error: "Network error. Please check your connection and try again." };
            }
            if (error.message.includes('permission') || error.message.includes('unauthorized')) {
                return { error: "Permission denied. You may not have access to create communities." };
            }
            if (error.message.includes('duplicate') || error.message.includes('already exists')) {
                return { error: "A community with this name or URL already exists." };
            }
        }
        
        return { error: "Failed to create community. Please try again." }
    }
}